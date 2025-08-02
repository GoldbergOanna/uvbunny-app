import { Injectable, inject, NgZone } from '@angular/core';
import {
  Firestore,
  collection,
  addDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  DocumentData,
  QuerySnapshot,
  getDocs,
  limit,
} from '@angular/fire/firestore';
import { BehaviorSubject, Observable, firstValueFrom } from 'rxjs';
import { BunnyEvent, EatingEvent, PlayingEvent } from '@core/models/bunny.model';
import { TimestampUtil } from '@shared/utils/timestamp.util';
import { ConfigService } from './config.service';
import { BunnyService } from './bunny.service';

@Injectable({
  providedIn: 'root',
})
/**
 * Service for managing bunny-related events such as feeding and playing
 * Provides methods to record events, update bunny happiness, and retrieve event history
 * Uses Firestore's real-time capabilities to keep the event list updated
 */
export class EventService {
  private firestore: Firestore = inject(Firestore);
  private ngZone: NgZone = inject(NgZone);
  private configService = inject(ConfigService);
  private bunnyService = inject(BunnyService);

  private eventsCollection = collection(this.firestore, 'events');
  private eventsSubject = new BehaviorSubject<BunnyEvent[]>([]);
  public events$: Observable<BunnyEvent[]> = this.eventsSubject.asObservable();

  constructor() {
    this.loadEvents();
  }

  private loadEvents(): void {
    const q = query(
      this.eventsCollection,
      orderBy('timestamp', 'desc')
    );

    this.ngZone.run(() => onSnapshot(q, (snapshot: QuerySnapshot<DocumentData>) => {
      const events: BunnyEvent[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...TimestampUtil.convertFirestoreDocument<Omit<BunnyEvent, 'id'>>(doc.data()),
      }));
      this.eventsSubject.next(events);
    }, (error) => {
      console.error('Error loading events:', error);
      this.eventsSubject.next([]);
    }));
  }

  public async feedBunny(bunnyId: string, foodType: 'lettuce' | 'carrot'): Promise<boolean> {
    try {
      const bunny = await this.bunnyService.getBunnyById(bunnyId);
      if (!bunny) {
        console.error('Bunny not found:', bunnyId);
        return false;
      }

      const config = this.configService.getConfigValue();
      const pointsEarned = foodType === 'lettuce' ? config.lettuce : config.carrot;

      const eatingEvent: BunnyEvent = {
        id: '',
        bunnyId,
        type: 'eating',
        details: { foodType } as EatingEvent,
        timestamp: new Date(),
        pointsEarned,
      };

      const firestoreData = TimestampUtil.prepareForFirestore(eatingEvent);
      const docRef = await this.ngZone.run(() => addDoc(this.eventsCollection, firestoreData));
      eatingEvent.id = docRef.id;

      await this.updateBunnyHappiness(bunnyId, pointsEarned);

      return true;
    } catch (error) {
      console.error('Error feeding bunny:', error);
      return false;
    }
  }

  public async playWithBunny(bunnyId: string, playmateBunnyId: string): Promise<boolean> {
    try {
      if (bunnyId === playmateBunnyId) {
        console.error('Bunny cannot play with itself');
        return false;
      }

      const [bunny, playmate] = await Promise.all([
        this.bunnyService.getBunnyById(bunnyId),
        this.bunnyService.getBunnyById(playmateBunnyId),
      ]);

      if (!bunny || !playmate) {
        console.error('One or both bunnies not found:', { bunnyId, playmateBunnyId });
        return false;
      }

      const isRepeatPlay = await this.checkRepeatPlay(bunnyId, playmateBunnyId);
      const config = this.configService.getConfigValue();
      const pointsEarned = isRepeatPlay ? config.repeatPlaying : config.playing;

      const playingEvent: BunnyEvent = {
        id: '',
        bunnyId,
        type: 'playing',
        details: { playmateBunnyId, isRepeatPlay } as PlayingEvent,
        timestamp: new Date(),
        pointsEarned,
      };

      const firestoreData = TimestampUtil.prepareForFirestore(playingEvent);
      const docRef = await this.ngZone.run(() => addDoc(this.eventsCollection, firestoreData));
      playingEvent.id = docRef.id;

      await Promise.all([
        this.updateBunnyHappiness(bunnyId, pointsEarned),
        this.updateBunnyHappiness(playmateBunnyId, pointsEarned),
      ]);

      return true;
    } catch (error) {
      console.error('Error recording play session:', error);
      return false;
    }
  }

  private async checkRepeatPlay(bunnyId: string, playmateBunnyId: string): Promise<boolean> {
    try {
      const q1 = query(
        this.eventsCollection,
        where('bunnyId', '==', bunnyId),
        where('type', '==', 'playing'),
        orderBy('timestamp', 'desc'),
        limit(10)
      );

      const snapshot = await this.ngZone.run(() => getDocs(q1));
      const events = snapshot.docs.map(doc =>
        TimestampUtil.convertFirestoreDocument<BunnyEvent>({ id: doc.id, ...doc.data() })
      );

      return events.some(event => {
        const details = event.details as PlayingEvent;
        return details.playmateBunnyId === playmateBunnyId;
      });
    } catch (error) {
      console.error('Error checking repeat play:', error);
      return false;
    }
  }

  private async updateBunnyHappiness(bunnyId: string, pointsEarned: number): Promise<void> {
    try {
      const bunny = await this.bunnyService.getBunnyById(bunnyId);
      if (!bunny) {
        console.error('Bunny not found for happiness update:', bunnyId);
        return;
      }

      const newHappiness = Math.min(100, Math.max(0, bunny.happiness + pointsEarned));

      await this.bunnyService.updateBunny(bunnyId, { happiness: newHappiness });
    } catch (error) {
      console.error('Error updating bunny happiness:', error);
    }
  }

  public getBunnyEvents(bunnyId: string): Observable<BunnyEvent[]> {
    return new Observable(subscriber => {
      const q = query(
        this.eventsCollection,
        where('bunnyId', '==', bunnyId),
        orderBy('timestamp', 'desc')
      );

      const unsubscribe = this.ngZone.run(() => onSnapshot(q, (snapshot: QuerySnapshot<DocumentData>) => {
        const events: BunnyEvent[] = snapshot.docs.map(doc => ({
          id: doc.id,
          ...TimestampUtil.convertFirestoreDocument<Omit<BunnyEvent, 'id'>>(doc.data()),
        }));
        subscriber.next(events);
      }, (error) => {
        console.error('Error getting bunny events:', error);
        subscriber.error(error);
      }));

      return () => unsubscribe();
    });
  }

  public getAllEvents(): Observable<BunnyEvent[]> {
    return this.events$;
  }

  public async recalculateHappinessFromEvents(bunnyId: string): Promise<boolean> {
    try {
      const bunny = await this.bunnyService.getBunnyById(bunnyId);
      if (!bunny) {
        console.error('Bunny not found for happiness recalculation:', bunnyId);
        return false;
      }

      const q = query(
        this.eventsCollection,
        where('bunnyId', '==', bunnyId),
        orderBy('timestamp', 'asc')
      );



      const snapshot = await this.ngZone.run(() => getDocs(q));
      const events = snapshot.docs.map(doc =>
        TimestampUtil.convertFirestoreDocument<BunnyEvent>({ id: doc.id, ...doc.data() })
      );

      const config = this.configService.getConfigValue();
      let totalHappiness = 0;

      for (const event of events) {
        let eventPoints = 0;

        if (event.type === 'eating') {
          const details = event.details as EatingEvent;
          eventPoints = details.foodType === 'lettuce' ? config.lettuce : config.carrot;
        } else if (event.type === 'playing') {
          const details = event.details as PlayingEvent;
          eventPoints = details.isRepeatPlay ? config.repeatPlaying : config.playing;
        }

        totalHappiness += eventPoints;
      }

      const finalHappiness = Math.min(100, Math.max(0, totalHappiness));
      await this.bunnyService.updateBunny(bunnyId, { happiness: finalHappiness });

      return true;
    } catch (error) {
      console.error('Error recalculating happiness from events:', error);
      return false;
    }
  }

  public async recalculateAllBunniesHappiness(): Promise<void> {
    try {
      const bunnies = await firstValueFrom(this.bunnyService.getBunnies());

      await Promise.all(
        bunnies.map(bunny => this.recalculateHappinessFromEvents(bunny.id))
      );

      console.log('Successfully recalculated happiness for all bunnies');
    } catch (error) {
      console.error('Error recalculating happiness for all bunnies:', error);
    }
  }
}

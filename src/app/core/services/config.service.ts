import { Injectable, inject, NgZone } from '@angular/core';
import {
  Firestore,
  doc,
  getDoc,
  setDoc,
  onSnapshot,
  DocumentSnapshot,
  DocumentData,
} from '@angular/fire/firestore';
import { BehaviorSubject, Observable, firstValueFrom } from 'rxjs';
import { PointsConfig, BunnyEvent, Bunny } from '@core/models/bunny.model';
import { TimestampUtil } from '@shared/utils/timestamp.util';

/**
 * Service for managing configuration settings related to points in the application
 * Provides methods to get, update, and initialize points configuration
 * Uses Firestore's real-time capabilities to keep the config updated
 */
@Injectable({
  providedIn: 'root',
})
export class ConfigService {
  private firestore: Firestore = inject(Firestore);
  private ngZone: NgZone = inject(NgZone);
  private configDoc = doc(this.firestore, 'config/points');
  private configSubject = new BehaviorSubject<PointsConfig | null>(null);
  public config$: Observable<PointsConfig | null> = this.configSubject.asObservable();

  private readonly defaultConfig: PointsConfig = {
    lettuce: 1,
    carrot: 3,
    playing: 2,
    repeatPlaying: 4,
  };

  constructor() {
    this.initializeConfig();
  }

  private initializeConfig(): void {
    onSnapshot(this.configDoc, (snapshot: DocumentSnapshot<DocumentData>) => {
      if (snapshot.exists()) {
        const data = TimestampUtil.convertFirestoreDocument<PointsConfig>(snapshot.data());
        this.configSubject.next(data);
      } else {
        this.initializeDefaultConfig();
      }
    }, (error) => {
      console.error('Error listening to config changes:', error);
      this.configSubject.next(this.defaultConfig);
    });
  }

  public async getPointsConfig(): Promise<PointsConfig> {
    try {
      const snapshot = await this.ngZone.run(() => getDoc(this.configDoc));

      if (snapshot.exists()) {
        return TimestampUtil.convertFirestoreDocument<PointsConfig>(snapshot.data());
      } else {
        await this.initializeDefaultConfig();
        return this.defaultConfig;
      }
    } catch (error) {
      console.error('Error getting points config:', error);
      return this.defaultConfig;
    }
  }

  public async updatePointsConfig(newConfig: PointsConfig): Promise<boolean> {
    try {
      const validatedConfig = this.validateConfig(newConfig);
      const firestoreData = TimestampUtil.prepareForFirestore(validatedConfig);

      await this.ngZone.run(() => setDoc(this.configDoc, firestoreData));

      await this.recalculateAllHappiness();

      return true;
    } catch (error) {
      console.error('Error updating points config:', error);
      return false;
    }
  }

  public async initializeDefaultConfig(): Promise<void> {
    try {
      const firestoreData = TimestampUtil.prepareForFirestore(this.defaultConfig);
      await this.ngZone.run(() => setDoc(this.configDoc, firestoreData));
      this.configSubject.next(this.defaultConfig);
    } catch (error) {
      console.error('Error initializing default config:', error);
      this.configSubject.next(this.defaultConfig);
    }
  }

  public async recalculateAllHappiness(): Promise<void> {
    try {
      console.log('Triggering happiness recalculation due to config change...');

      const { EventService } = await import('./event.service');
      const eventService = new EventService();
      await eventService.recalculateAllBunniesHappiness();
    } catch (error) {
      console.error('Error triggering happiness recalculation:', error);
    }
  }

  private validateConfig(config: PointsConfig): PointsConfig {
    const validated: PointsConfig = {
      lettuce: Math.max(0, Math.floor(config.lettuce || 0)),
      carrot: Math.max(0, Math.floor(config.carrot || 0)),
      playing: Math.max(0, Math.floor(config.playing || 0)),
      repeatPlaying: Math.max(0, Math.floor(config.repeatPlaying || 0)),
    };

    if (validated.lettuce < 0 || validated.carrot < 0 || validated.playing < 0 || validated.repeatPlaying < 0) {
      throw new Error('All point values must be non-negative numbers');
    }

    return validated;
  }

  public getCurrentConfig(): PointsConfig | null {
    return this.configSubject.value;
  }

  public getConfigValue(): PointsConfig {
    return this.configSubject.value || this.defaultConfig;
  }

  public getDefaultConfiguration(): PointsConfig {
    return { ...this.defaultConfig };
  }

  public async getAffectedEventsCount(newConfig: PointsConfig): Promise<number> {
    try {
      const { EventService } = await import('./event.service');
      const eventService = new EventService();
      const events = await firstValueFrom(eventService.getAllEvents()) || [];
      
      return events.length;
    } catch (error) {
      console.error('Error getting affected events count:', error);
      return 0;
    }
  }

  public validateConfigValues(config: PointsConfig): boolean {
    return Object.values(config).every(value => 
      typeof value === 'number' && value >= 0 && !isNaN(value)
    );
  }

  public async calculateHappinessImpact(newConfig: PointsConfig): Promise<{
    totalBunniesAffected: number;
    averageHappinessChange: number;
    eventsRecalculated: number;
  }> {
    try {
      const { BunnyService } = await import('./bunny.service');
      const { EventService } = await import('./event.service');
      const bunnyService = new BunnyService();
      const eventService = new EventService();
      
      const [bunnies, events] = await Promise.all([
        firstValueFrom(bunnyService.getBunnies()),
        firstValueFrom(eventService.getAllEvents())
      ]);

      const bunniesList = bunnies || [];
      const eventsList = events || [];
      let totalHappinessChange = 0;
      let affectedBunnies = 0;

      for (const bunny of bunniesList) {
        const bunnyEvents = eventsList.filter((event: BunnyEvent) => event.bunnyId === bunny.id);
        if (bunnyEvents.length > 0) {
          const currentHappiness = this.calculateBunnyHappiness(bunnyEvents, this.getConfigValue());
          const newHappiness = this.calculateBunnyHappiness(bunnyEvents, newConfig);
          const change = newHappiness - currentHappiness;
          
          if (Math.abs(change) > 0.01) {
            totalHappinessChange += change;
            affectedBunnies++;
          }
        }
      }

      return {
        totalBunniesAffected: affectedBunnies,
        averageHappinessChange: affectedBunnies > 0 ? totalHappinessChange / affectedBunnies : 0,
        eventsRecalculated: eventsList.length
      };
    } catch (error) {
      console.error('Error calculating happiness impact:', error);
      return {
        totalBunniesAffected: 0,
        averageHappinessChange: 0,
        eventsRecalculated: 0
      };
    }
  }

  private calculateBunnyHappiness(events: BunnyEvent[], config: PointsConfig): number {
    let totalPoints = 0;
    const playmates = new Set<string>();

    for (const event of events) {
      if (event.type === 'eating') {
        const details = event.details as any;
        if (details.foodType === 'lettuce') {
          totalPoints += config.lettuce;
        } else if (details.foodType === 'carrot') {
          totalPoints += config.carrot;
        }
      } else if (event.type === 'playing') {
        const details = event.details as any;
        const playmateId = details.playmateBunnyId;
        
        if (playmates.has(playmateId)) {
          totalPoints += config.repeatPlaying;
        } else {
          totalPoints += config.playing;
          playmates.add(playmateId);
        }
      }
    }

    return Math.min(100, Math.max(0, totalPoints));
  }
}

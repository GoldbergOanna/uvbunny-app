import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  query,
  onSnapshot,
  DocumentData,
  QuerySnapshot,
} from '@angular/fire/firestore';
import { BehaviorSubject, Observable, map, catchError, of } from 'rxjs';
import { Bunny } from '../models/bunny.model';
import { TimestampUtil } from '../../shared/utils/timestamp.util';

/**
 * Service for managing bunnies in Firestore
 * Provides methods to add, update, delete, and retrieve bunnies
 * Uses Firestore's real-time capabilities to keep the bunny list updated
 */
@Injectable({  providedIn: 'root',})
export class BunnyService {
  private firestore: Firestore = inject(Firestore);
  private bunniesCollection = collection(this.firestore, 'bunnies');
  private bunniesSubject = new BehaviorSubject<Bunny[]>([]);
  public bunnies$: Observable<Bunny[]> = this.bunniesSubject.asObservable();

  constructor() {
    this.loadBunnies();
  }

  private loadBunnies(): void {
    const q = query(this.bunniesCollection);
    onSnapshot(q, (snapshot: QuerySnapshot<DocumentData>) => {
      const bunnies: Bunny[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...TimestampUtil.convertDatesToTimestamps(doc.data()),
      })) as Bunny[];
      this.bunniesSubject.next(bunnies);
    });
  }



  public getBunnies(): Observable<Bunny[]> {
    return this.bunnies$;
  }

  public async addBunny(bunnyData: Omit<Bunny, 'id' | 'createdAt' | 'updatedAt'>): Promise<string | null> {
    try {
      const now = new Date();
      const newBunny = {
        ...bunnyData,
        createdAt: now,
        updatedAt: now
      };
      const firestoreData = TimestampUtil.convertDatesToTimestamps(newBunny);
      const docRef = await addDoc(this.bunniesCollection, firestoreData);
      return docRef.id;
    } catch (error) {
      console.error('Error adding bunny:', error);
      return null;
    }
  }

  public async updateBunny(id: string, updates: Partial<Omit<Bunny, 'id' | 'createdAt'>>): Promise<boolean> {
    try {
      const bunnyDoc = doc(this.firestore, `bunnies/${id}`);
      const updateData = {
        ...updates,
        updatedAt: new Date()
      };
      const firestoreData = TimestampUtil.convertDatesToTimestamps(updateData);
      await updateDoc(bunnyDoc, firestoreData);
      return true;
    } catch (error) {
      console.error('Error updating bunny:', error);
      return false;
    }
  }

  public async deleteBunny(bunnyId: string): Promise<boolean> {
    try {
      const bunnyDoc = doc(this.firestore, `bunnies/${bunnyId}`);
      await deleteDoc(bunnyDoc);
      return true;
    } catch (error) {
      console.error('Error deleting bunny:', error);
      return false;
    }
  }

  public async getBunnyById(bunnyId: string): Promise<Bunny | null> {
    try {
      const bunnyDoc = doc(this.firestore, `bunnies/${bunnyId}`);
      const docSnapshot = await getDoc(bunnyDoc);

      if (docSnapshot.exists()) {
        return {
          id: docSnapshot.id,
          ...TimestampUtil.convertDatesToTimestamps(docSnapshot.data())
        } as Bunny;
      }
      return null;
    } catch (error) {
      console.error('Error getting bunny by ID:', error);
      return null;
    }
  }

  public getAverageHappiness(): Observable<number> {
    return this.bunnies$.pipe(
      map(bunnies => {
        if (bunnies.length === 0) return 0;
        const totalHappiness = bunnies.reduce((sum, bunny) => sum + bunny.happiness, 0);
        return Math.round(totalHappiness / bunnies.length * 100) / 100;
      }),
      catchError(() => of(0))
    );
  }

}

import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  doc,
  getDoc,
  setDoc,
  onSnapshot,
  DocumentSnapshot,
  DocumentData,
} from '@angular/fire/firestore';
import { BehaviorSubject, Observable } from 'rxjs';
import { PointsConfig } from '../models/bunny.model';
import { TimestampUtil } from '../../shared/utils/timestamp.util';

/**
 * Service for managing configuration settings related to points in the application
 * Provides methods to get, update, and initialize points configuration
 * Uses Firestore's real-time capabilities to keep the config updated
 */
// Note: This service is designed to be pure and free from side effects
// It uses TimestampUtil for safe conversions and avoids circular dependencies
@Injectable({
  providedIn: 'root',
})
export class ConfigService {
  private firestore: Firestore = inject(Firestore);
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
      const snapshot = await getDoc(this.configDoc);

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

      await setDoc(this.configDoc, firestoreData);

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
      await setDoc(this.configDoc, firestoreData);
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
}

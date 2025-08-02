import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
  inject
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, Observable, BehaviorSubject, combineLatest, firstValueFrom } from 'rxjs';
import { takeUntil, map, catchError, startWith } from 'rxjs/operators';

import { ConfigService } from '@core/services/config.service';
import { BunnyService } from '@core/services/bunny.service';
import { EventService } from '@core/services/event.service';
import { PointsConfig, Bunny, BunnyEvent } from '@core/models/bunny.model';

interface ConfigurationState {
  currentConfig: PointsConfig | null;
  previewConfig: PointsConfig | null;
  affectedBunnies: Bunny[];
  affectedEventsCount: number;
  averageHappinessChange: number;
  isLoading: boolean;
  isSaving: boolean;
  isCalculatingPreview: boolean;
  successMessage: string | null;
  errorMessage: string | null;
  showPreview: boolean;
}

interface HappinessPreview {
  bunny: Bunny;
  currentHappiness: number;
  newHappiness: number;
  change: number;
}

@Component({
  selector: 'app-configuration',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './configuration.component.html',
  styleUrl: './configuration.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfigurationComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly configService = inject(ConfigService);
  private readonly bunnyService = inject(BunnyService);
  private readonly eventService = inject(EventService);

  private readonly state$ = new BehaviorSubject<ConfigurationState>({
    currentConfig: null,
    previewConfig: null,
    affectedBunnies: [],
    affectedEventsCount: 0,
    averageHappinessChange: 0,
    isLoading: true,
    isSaving: false,
    isCalculatingPreview: false,
    successMessage: null,
    errorMessage: null,
    showPreview: false,
  });

  readonly currentConfig$ = this.state$.pipe(map(state => state.currentConfig));
  readonly previewConfig$ = this.state$.pipe(map(state => state.previewConfig));
  readonly affectedBunnies$ = this.state$.pipe(map(state => state.affectedBunnies));
  readonly affectedEventsCount$ = this.state$.pipe(map(state => state.affectedEventsCount));
  readonly averageHappinessChange$ = this.state$.pipe(map(state => state.averageHappinessChange));
  readonly isLoading$ = this.state$.pipe(map(state => state.isLoading));
  readonly isSaving$ = this.state$.pipe(map(state => state.isSaving));
  readonly isCalculatingPreview$ = this.state$.pipe(map(state => state.isCalculatingPreview));
  readonly successMessage$ = this.state$.pipe(map(state => state.successMessage));
  readonly errorMessage$ = this.state$.pipe(map(state => state.errorMessage));
  readonly showPreview$ = this.state$.pipe(map(state => state.showPreview));

  readonly configForm: FormGroup;
  readonly defaultConfig: PointsConfig = {
    lettuce: 1,
    carrot: 3,
    playing: 2,
    repeatPlaying: 4,
  };

  readonly happinessPreviews$ = new BehaviorSubject<HappinessPreview[]>([]);

  constructor() {
    this.configForm = this.createConfigForm();
  }

  ngOnInit(): void {
    this.loadCurrentConfig();
    this.setupFormValueChanges();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private createConfigForm(): FormGroup {
    return this.fb.group({
      lettuce: [this.defaultConfig.lettuce, [Validators.required, Validators.min(0)]],
      carrot: [this.defaultConfig.carrot, [Validators.required, Validators.min(0)]],
      playing: [this.defaultConfig.playing, [Validators.required, Validators.min(0)]],
      repeatPlaying: [this.defaultConfig.repeatPlaying, [Validators.required, Validators.min(0)]],
    });
  }

  private setupFormValueChanges(): void {
    this.configForm.valueChanges
      .pipe(
        takeUntil(this.destroy$),
        startWith(this.configForm.value)
      )
      .subscribe(() => {
        this.clearMessages();
        if (this.state$.value.showPreview) {
          this.calculatePreviewChanges();
        }
      });
  }

  loadCurrentConfig(): void {
    this.updateState({ isLoading: true, errorMessage: null });

    this.configService.config$
      .pipe(
        takeUntil(this.destroy$),
        catchError(error => {
          console.error('Error loading config:', error);
          this.updateState({
            errorMessage: 'Failed to load configuration',
            isLoading: false
          });
          return [];
        })
      )
      .subscribe(config => {
        if (config) {
          this.updateState({ currentConfig: config, isLoading: false });
          this.configForm.patchValue(config, { emitEvent: false });
        }
      });
  }

  updateConfigValue(field: keyof PointsConfig, value: number): void {
    if (this.configForm.get(field)) {
      this.configForm.get(field)?.setValue(value);
    }
  }

  async saveConfiguration(): Promise<void> {
    if (this.configForm.invalid) {
      this.updateState({ errorMessage: 'Please fix form errors before saving' });
      return;
    }

    this.updateState({ 
      isSaving: true, 
      errorMessage: null, 
      successMessage: null 
    });

    try {
      const formValue = this.configForm.value as PointsConfig;
      const success = await this.configService.updatePointsConfig(formValue);

      if (success) {
        this.updateState({
          successMessage: 'Configuration saved successfully! Bunny happiness has been recalculated.',
          isSaving: false,
          showPreview: false
        });
        this.happinessPreviews$.next([]);
      } else {
        this.updateState({
          errorMessage: 'Failed to save configuration',
          isSaving: false
        });
      }
    } catch (error) {
      console.error('Error saving configuration:', error);
      this.updateState({
        errorMessage: 'An error occurred while saving configuration',
        isSaving: false
      });
    }
  }

  resetToDefaults(): void {
    this.configForm.patchValue(this.defaultConfig);
    this.updateState({ 
      successMessage: 'Configuration reset to defaults',
      showPreview: false 
    });
    this.happinessPreviews$.next([]);
  }

  async previewChanges(): Promise<void> {
    if (this.configForm.invalid) {
      this.updateState({ errorMessage: 'Please fix form errors before previewing' });
      return;
    }

    this.updateState({ 
      showPreview: true, 
      errorMessage: null,
      successMessage: null
    });
    
    await this.calculatePreviewChanges();
  }

  private async calculatePreviewChanges(): Promise<void> {
    this.updateState({ isCalculatingPreview: true });

    try {
      const previewConfig = this.configForm.value as PointsConfig;
      const impact = await this.calculateImpactStats(previewConfig);

      this.updateState({
        previewConfig,
        affectedBunnies: impact.affectedBunnies,
        affectedEventsCount: impact.eventsCount,
        averageHappinessChange: impact.averageChange,
        isCalculatingPreview: false
      });

      this.happinessPreviews$.next(impact.happinessPreviews);
    } catch (error) {
      console.error('Error calculating preview:', error);
      this.updateState({
        errorMessage: 'Failed to calculate preview changes',
        isCalculatingPreview: false
      });
    }
  }

  async calculateImpactStats(newConfig: PointsConfig): Promise<{
    affectedBunnies: Bunny[];
    eventsCount: number;
    averageChange: number;
    happinessPreviews: HappinessPreview[];
  }> {
    try {
      const [bunnies, allEvents] = await Promise.all([
        firstValueFrom(this.bunnyService.getBunnies().pipe(takeUntil(this.destroy$))),
        firstValueFrom(this.eventService.getAllEvents().pipe(takeUntil(this.destroy$)))
      ]);

      const bunniesList = bunnies || [];
      const eventsList = allEvents || [];
      const currentConfig = this.state$.value.currentConfig || this.defaultConfig;
      const happinessPreviews: HappinessPreview[] = [];
      const affectedBunnies: Bunny[] = [];
      let totalChange = 0;
      let eventsCount = 0;

      for (const bunny of bunniesList) {
        const bunnyEvents = eventsList.filter(event => event.bunnyId === bunny.id);
        const currentHappiness = this.calculateBunnyHappiness(bunnyEvents, currentConfig);
        const newHappiness = this.calculateBunnyHappiness(bunnyEvents, newConfig);
        const change = newHappiness - currentHappiness;

        if (Math.abs(change) > 0.01) {
          affectedBunnies.push(bunny);
          totalChange += change;
          eventsCount += bunnyEvents.length;
        }

        happinessPreviews.push({
          bunny,
          currentHappiness,
          newHappiness,
          change
        });
      }

      const averageChange = affectedBunnies.length > 0 ? totalChange / affectedBunnies.length : 0;

      return {
        affectedBunnies,
        eventsCount,
        averageChange: Math.round(averageChange * 100) / 100,
        happinessPreviews
      };
    } catch (error) {
      console.error('Error calculating impact stats:', error);
      return {
        affectedBunnies: [],
        eventsCount: 0,
        averageChange: 0,
        happinessPreviews: []
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

  private validateConfigValues(config: PointsConfig): boolean {
    return Object.values(config).every(value => 
      typeof value === 'number' && value >= 0 && !isNaN(value)
    );
  }

  goBack(): void {
    this.router.navigate(['/']);
  }

  hidePreview(): void {
    this.updateState({ showPreview: false });
    this.happinessPreviews$.next([]);
  }

  private clearMessages(): void {
    if (this.state$.value.successMessage || this.state$.value.errorMessage) {
      this.updateState({
        successMessage: null,
        errorMessage: null
      });
    }
  }

  private updateState(updates: Partial<ConfigurationState>): void {
    const currentState = this.state$.value;
    this.state$.next({ ...currentState, ...updates });
  }

  trackByBunnyId(index: number, bunny: Bunny): string {
    return bunny.id;
  }

  trackByPreviewId(index: number, preview: HappinessPreview): string {
    return preview.bunny.id;
  }

  // Template helper methods
  mathAbs(value: number): number {
    return Math.abs(value);
  }

  mathRound(value: number): number {
    return Math.round(value);
  }

  encodeUriComponent(value: string): string {
    return encodeURIComponent(value);
  }
}
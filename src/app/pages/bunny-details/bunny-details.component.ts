import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
  inject
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Subject, Observable, of, BehaviorSubject, combineLatest } from 'rxjs';
import {
  takeUntil,
  switchMap,
  map,
  catchError
} from 'rxjs/operators';

import { BunnyService } from '@core/services/bunny.service';
import { EventService } from '@core/services/event.service';
import { ConfigService } from '@core/services/config.service';
import { Bunny, BunnyEvent } from '@core/models/bunny.model';
import { HappinessMeterComponent } from '@components/happiness-meter/happiness-meter.component';

interface BunnyDetailsState {
  bunny: Bunny | null;
  otherBunnies: Bunny[];
  events: BunnyEvent[];
  isLoading: boolean;
  isFeeding: boolean;
  isPlaying: boolean;
  isUploadingAvatar: boolean;
  error: string | null;
}

@Component({
  selector: 'app-bunny-details',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HappinessMeterComponent],
  templateUrl: './bunny-details.component.html',
  styleUrl: './bunny-details.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BunnyDetailsComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly bunnyService = inject(BunnyService);
  private readonly eventService = inject(EventService);
  private readonly configService = inject(ConfigService);

  private readonly state$ = new BehaviorSubject<BunnyDetailsState>({
    bunny: null,
    otherBunnies: [],
    events: [],
    isLoading: true,
    isFeeding: false,
    isPlaying: false,
    isUploadingAvatar: false,
    error: null,
  });

  readonly bunny$ = this.state$.pipe(map((state) => state.bunny));
  readonly otherBunnies$ = this.state$.pipe(map((state) => state.otherBunnies));
  readonly events$ = this.state$.pipe(map((state) => state.events));
  readonly isLoading$ = this.state$.pipe(map((state) => state.isLoading));
  readonly isFeeding$ = this.state$.pipe(map((state) => state.isFeeding));
  readonly isPlaying$ = this.state$.pipe(map((state) => state.isPlaying));
  readonly isUploadingAvatar$ = this.state$.pipe(
    map((state) => state.isUploadingAvatar),
  );
  readonly error$ = this.state$.pipe(map((state) => state.error));

  readonly playmateControl = new FormControl<string>('');

  readonly config$ = this.configService.config$;

  private bunnyId: string | null = null;

  ngOnInit(): void {
    this.route.paramMap
      .pipe(
        takeUntil(this.destroy$),
        switchMap((params) => {
          this.bunnyId = params.get('id');
          if (!this.bunnyId) {
            this.updateState({ error: 'Invalid bunny ID' });
            return of(null);
          }
          return this.loadBunnyDetails(this.bunnyId);
        }),
      )
      .subscribe();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadBunnyDetails(bunnyId: string): Observable<any> {
    this.updateState({ isLoading: true, error: null });

    return combineLatest([
      this.bunnyService.getBunnies(),
      this.eventService.getBunnyEvents(bunnyId),
      this.configService.config$,
    ]).pipe(
      switchMap(([allBunnies, events, config]) => {
        const bunny = allBunnies.find((b) => b.id === bunnyId);

        if (!bunny) {
          this.updateState({ error: 'Bunny not found', isLoading: false });
          return of(null);
        }

        const otherBunnies = allBunnies.filter((b) => b.id !== bunnyId);
        this.updateState({
          bunny,
          otherBunnies,
          events: events.slice(0, 20),
          isLoading: false,
          error: null,
        });

        return of({ bunny, otherBunnies, events });
      }),
      catchError((error) => {
        console.error('Error loading bunny details:', error);
        this.updateState({
          error: 'Failed to load bunny details',
          isLoading: false,
        });
        return of(null);
      }),
    );
  }

  private updateState(updates: Partial<BunnyDetailsState>): void {
    const currentState = this.state$.value;
    this.state$.next({ ...currentState, ...updates });
  }

  goBack(): void {
    this.router.navigate(['/']);
  }

  feedBunny(foodType: 'lettuce' | 'carrot'): void {
    if (!this.bunnyId) return;

    this.updateState({ isFeeding: true });

    this.eventService
      .feedBunny(this.bunnyId, foodType)
      .then((success) => {
        if (success) {
          this.loadBunnyDetails(this.bunnyId!)
            .pipe(takeUntil(this.destroy$))
            .subscribe();
        } else {
          this.updateState({
            error: 'Failed to feed bunny',
            isFeeding: false,
          });
        }
      })
      .catch((error) => {
        console.error('Error feeding bunny:', error);
        this.updateState({
          error: 'Failed to feed bunny',
          isFeeding: false,
        });
      })
      .finally(() => {
        this.updateState({ isFeeding: false });
      });
  }

  playWithBunny(): void {
    const playmateId = this.playmateControl.value;
    if (!this.bunnyId || !playmateId) return;

    this.updateState({ isPlaying: true });

    this.eventService
      .playWithBunny(this.bunnyId, playmateId)
      .then((success) => {
        if (success) {
          this.loadBunnyDetails(this.bunnyId!)
            .pipe(takeUntil(this.destroy$))
            .subscribe(() => {
              this.playmateControl.reset();
            });
        } else {
          this.updateState({
            error: 'Failed to play with bunny',
            isPlaying: false,
          });
        }
      })
      .catch((error) => {
        console.error('Error playing with bunny:', error);
        this.updateState({
          error: 'Failed to play with bunny',
          isPlaying: false,
        });
      })
      .finally(() => {
        this.updateState({ isPlaying: false });
      });
  }

  uploadAvatar(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file || !this.bunnyId) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      this.updateState({ error: 'Please select a valid image file' });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      this.updateState({ error: 'Image file size must be less than 5MB' });
      return;
    }

    this.updateState({ isUploadingAvatar: true, error: null });

    // For now, we'll create a URL from the file and update the bunny
    // In a real implementation, you'd upload to Firebase Storage first
    const reader = new FileReader();
    reader.onload = (e) => {
      const avatarUrl = e.target?.result as string;

      this.bunnyService
        .updateBunny(this.bunnyId!, { avatarUrl })
        .then((success) => {
          if (success) {
            // Reload bunny details to get updated avatar
            this.loadBunnyDetails(this.bunnyId!)
              .pipe(takeUntil(this.destroy$))
              .subscribe();
          } else {
            this.updateState({
              error: 'Failed to upload avatar',
              isUploadingAvatar: false,
            });
          }
        })
        .catch((error) => {
          console.error('Error uploading avatar:', error);
          this.updateState({
            error: 'Failed to upload avatar',
            isUploadingAvatar: false,
          });
        })
        .finally(() => {
          this.updateState({ isUploadingAvatar: false });
        });
    };

    reader.readAsDataURL(file);

    // Reset input
    input.value = '';
  }

  getBunnyAvatar(bunny: Bunny): string {
    return (
      bunny.avatarUrl ||
      `https://ui-avatars.com/api/?name=${encodeURIComponent(bunny.name)}&background=2563eb&color=ffffff&size=200`
    );
  }

  getHappinessColor(happiness: number): string {
    if (happiness >= 80) return 'happiness-high';
    if (happiness >= 50) return 'happiness-medium';
    if (happiness >= 20) return 'happiness-low';
    return 'happiness-critical';
  }

  getHappinessWidth(happiness: number): string {
    return `${Math.max(0, Math.min(100, happiness))}%`;
  }

  formatEventTime(timestamp: Date): string {
    const now = new Date();
    const diff = now.getTime() - new Date(timestamp).getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  }

  getEventIcon(event: BunnyEvent): string {
    switch (event.type) {
      case 'eating':
        // Check if the details object has foodType property
        const eatingDetails = event.details as any;
        if (typeof eatingDetails === 'object' && eatingDetails.foodType) {
          return eatingDetails.foodType === 'lettuce' ? '🥬' : '🥕';
        }
        // Fallback: check if details is a string containing food type
        if (typeof eatingDetails === 'string') {
          return eatingDetails.includes('lettuce') ? '🥬' : '🥕';
        }
        return '🥗';
      case 'playing':
        return '🎮';
      default:
        return '📝';
    }
  }

  getEventDescription(event: BunnyEvent): string {
    if (typeof event.details === 'string') {
      return event.details;
    }

    if (event.type === 'eating') {
      const details = event.details as any;
      if (details.foodType) {
        return `Ate ${details.foodType}`;
      }
    }

    if (event.type === 'playing') {
      const details = event.details as any;
      if (details.playmateBunnyId) {
        return `Played with another bunny`;
      }
    }

    return 'Unknown activity';
  }

  private isRecentEvent(timestamp: Date): boolean {
    const now = new Date();
    const eventTime = new Date(timestamp);
    const diffHours = (now.getTime() - eventTime.getTime()) / (1000 * 60 * 60);
    return diffHours < 24; // Within last 24 hours
  }

  trackByEventId(index: number, event: BunnyEvent): string {
    return event.id;
  }

  trackByBunnyId(index: number, bunny: Bunny): string {
    return bunny.id;
  }

  getCurrentEventPoints(event: BunnyEvent): number {
    const currentConfig = this.configService.getCurrentConfig();
    if (!currentConfig) return event.pointsEarned;

    if (event.type === 'eating') {
      const details = event.details as any;
      if (details.foodType === 'lettuce') {
        return currentConfig.lettuce;
      } else if (details.foodType === 'carrot') {
        return currentConfig.carrot;
      }
    } else if (event.type === 'playing') {
      const details = event.details as any;
      if (details.isRepeatPlay) {
        return currentConfig.repeatPlaying;
      } else {
        return currentConfig.playing;
      }
    }

    return event.pointsEarned;
  }
}

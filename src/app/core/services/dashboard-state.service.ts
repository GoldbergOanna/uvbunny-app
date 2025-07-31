import { Injectable } from '@angular/core';
import { Observable, combineLatest, of } from 'rxjs';
import { catchError, map, startWith } from 'rxjs/operators';
import { BunnyService } from '@core/services/bunny.service';
import { EventService } from '@core/services/event.service';
import { ComponentState } from '@core/models/dahsboard.types';
import { Bunny } from '@core/models/bunny.model';
import { BunnyEvent } from '@core/models/bunny.model';
import { TimestampUtil } from '@shared/utils/timestamp.util';

@Injectable({ providedIn: 'root' })
export class DashboardStateService {
  constructor(
    private bunnyService: BunnyService,
    private eventService: EventService,
  ) {}

  readonly bunnies$: Observable<Bunny[]> = this.bunnyService.getBunnies().pipe(
    startWith([]),
    catchError((error) => {
      console.error('Error loading bunnies:', error);
      return of([]);
    }),
  );

  readonly averageHappiness$: Observable<number> = this.bunnyService
    .getAverageHappiness()
    .pipe(
      startWith(0),
      catchError((error) => {
        console.error('Error loading happiness:', error);
        return of(0);
      }),
    );

  readonly events$: Observable<BunnyEvent[]> = this.eventService
    .getAllEvents()
    .pipe(
      startWith([]),
      catchError((error) => {
        console.error('Error loading events:', error);
        return of([]);
      }),
    );

  readonly state$: Observable<ComponentState> = combineLatest([
    this.bunnies$,
    this.averageHappiness$,
    this.events$,
  ]).pipe(
    map(([bunnies, avgHappiness, events]) =>
      this.buildComponentState(bunnies, avgHappiness, events),
    ),
    startWith(this.getInitialComponentState()),
    catchError((error) => {
      console.error('Error in dashboard state:', error);
      return of(this.getErrorComponentState());
    }),
  );

  private buildComponentState(
    bunnies: Bunny[],
    averageHappiness: number,
    events: BunnyEvent[],
  ): ComponentState {
    return {
      bunnies,
      stats: {
        averageHappiness: Math.round(averageHappiness * 10) / 10,
        totalBunnies: bunnies.length,
        eventsToday: this.getEventsToday(events),
      },
      isLoading: false,
      error: null,
      isSubmitting: false,
    };
  }

  private getInitialComponentState(): ComponentState {
    return {
      bunnies: [],
      stats: {
        averageHappiness: 0,
        totalBunnies: 0,
        eventsToday: 0,
      },
      isLoading: true,
      error: null,
      isSubmitting: false,
    };
  }

  private getErrorComponentState(): ComponentState {
    return {
      bunnies: [],
      stats: {
        averageHappiness: 0,
        totalBunnies: 0,
        eventsToday: 0,
      },
      isLoading: false,
      error: 'Failed to load dashboard data. Please try again.',
      isSubmitting: false,
    };
  }

  /**
   * Counts the number of events whose timestamp is today (based on local time).
   * Uses TimestampUtil to support Firestore Timestamps.
   */
  private getEventsToday(events: BunnyEvent[]): number {
    const today = new Date().toDateString();

    return events.filter((event) => {
      const eventDate = TimestampUtil.safeTimestampToDate(event.timestamp);
      return eventDate?.toDateString() === today;
    }).length;
  }
}

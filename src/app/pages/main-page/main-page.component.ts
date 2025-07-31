import {
  Component,
  OnDestroy,
  ChangeDetectionStrategy,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { Observable, Subject } from 'rxjs';

import type { Bunny, BunnyEvent } from '@core/models/bunny.model';
import type { ComponentState } from '@core/models/dahsboard.types';

import { DashboardStateService } from '@core/services/dashboard-state.service';
import { BunnyService } from '@core/services/bunny.service';

import { HeaderComponent } from '@components/header/header.component';
import { LoadindStateComponent } from '@components/loadind-state/loadind-state.component';
import { ErrorAlertComponent } from '@components/error-alert/error-alert.component';
import { StatsSectionComponent } from '@components/stats-section/stats-section.component';
import { BunnyCardComponent } from "@components/bunny-card/bunny-card.component";
import { AddBunnyFormComponent } from "@components/add-bunny-form/add-bunny-form.component";

@Component({
  selector: 'uvbunny-main-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    HeaderComponent,
    LoadindStateComponent,
    ErrorAlertComponent,
    StatsSectionComponent,
    BunnyCardComponent,
    AddBunnyFormComponent
],
  templateUrl: './main-page.component.html',
  styleUrls: ['./main-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MainPageComponent implements OnDestroy {
  private readonly destroy$ = new Subject<void>();
  private readonly bunnyService = inject(BunnyService);
  private readonly fb = inject(FormBuilder);
  private readonly dashboardState = inject(DashboardStateService);

  readonly state$: Observable<ComponentState> = this.dashboardState.state$;



  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }


  private getEventsToday(events: BunnyEvent[]): number {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return events.filter((event) => {
      const eventDate = new Date(event.timestamp);
      return eventDate >= today && eventDate < tomorrow;
    }).length;
  }
}

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { map, startWith, catchError} from 'rxjs/operators';
import { of } from 'rxjs';
import { DashboardStateService } from '@core/services/dashboard-state.service';
import type { DashboardStats } from '@core/models/dahsboard.types';


@Component({
  selector: 'app-stats-section',
  imports: [CommonModule],
  templateUrl: './stats-section.component.html',
  styleUrl: './stats-section.component.scss'
})
export class StatsSectionComponent {

    constructor(private dashboardState: DashboardStateService){}

    readonly stats$: Observable<DashboardStats> = this.dashboardState.state$.pipe(
      map(state => state.stats),
      startWith({ averageHappiness: 0, totalBunnies: 0, totalEvents: 0, eventsToday: 0 }),
      catchError((error) => {
        console.error('Error loading stats:', error);
        return of({ averageHappiness: 0, totalBunnies: 0, totalEvents: 0, eventsToday: 0 });
      })
    );
}

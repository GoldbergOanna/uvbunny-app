import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AsyncPipe } from '@angular/common';
import { DashboardStateService } from '@core/services/dashboard-state.service';

@Component({
  selector: 'app-error-state',
  imports: [AsyncPipe],
  templateUrl: './error-state.component.html',
  styleUrl: './error-state.component.scss'
})
export class ErrorStateComponent {
  constructor(private dashboardState: DashboardStateService) {}
   readonly error$: Observable<string | null> = this.dashboardState.state$.pipe(
    map(state => state.error)
  );

  onClearError(): void {
    this.dashboardState.clearError();
  }
}

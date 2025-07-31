import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AsyncPipe } from '@angular/common';
import { DashboardStateService } from '@core/services/dashboard-state.service';

@Component({
  selector: 'app-error-alert',
  imports: [AsyncPipe],
  templateUrl: './error-alert.component.html',
  styleUrl: './error-alert.component.scss'
})
export class ErrorAlertComponent {
  constructor(private dashboardState: DashboardStateService) {}
   readonly error$: Observable<string | null> = this.dashboardState.state$.pipe(
    map(state => state.error)
  );

  onClearError(): void {
    this.dashboardState.clearError();
  }
}

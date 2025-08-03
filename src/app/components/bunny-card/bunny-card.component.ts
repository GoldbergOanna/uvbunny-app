import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { inject } from '@angular/core';
import { BunnyService } from '@core/services/bunny.service';
import { Observable } from 'rxjs';
import { map, startWith, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { DashboardStateService } from '@core/services/dashboard-state.service';
import { Bunny } from '@core/models/bunny.model';
import { HappinessMeterComponent } from '@components/happiness-meter/happiness-meter.component';

@Component({
  selector: 'app-bunny-card',
  imports: [CommonModule, HappinessMeterComponent],
  templateUrl: './bunny-card.component.html',
  styleUrl: './bunny-card.component.scss'
})
export class BunnyCardComponent {
  readonly fallbackEmoji = '🐰';
    private readonly router = inject(Router);
    private readonly dashboardState = inject(DashboardStateService);

      readonly bunnies$: Observable<Bunny[]> = this.dashboardState.state$.pipe(
        map(state => state.bunnies),
        startWith([]),
        catchError((error) => {
          console.error('Error loading stats:', error);
          return of([]);
        })
      );


  /**
   * Get bunny avatar URL or return null to use fallback emoji
   * @param bunny - Bunny object
   * @returns Avatar URL or null for emoji fallback
   */
  getBunnyAvatar(bunny: Bunny): string | null {
    return bunny.avatarUrl || null;
  }

  /**
   * Check if bunny has a valid avatar URL
   * @param bunny - Bunny object
   * @returns True if bunny has avatarUrl
   */
  hasAvatarUrl(bunny: Bunny): boolean {
    return !!(bunny.avatarUrl && bunny.avatarUrl.trim());
  }

  /**
   * Handle avatar image load error
   * @param event - Error event
   */
  onAvatarError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.style.display = 'none';
    const container = img.parentElement;
    if (container) {
      container.classList.add('show-emoji-fallback');
    }
  }
  /**
   * TrackBy function for ngFor to optimize rendering
   * @param index - Index of the item
   * @param bunny - Bunny object
   * @returns Bunny ID
   */
  trackByBunnyId(index: number, bunny: Bunny): string {
    return bunny.id;
  }
  /**
   * Handle bunny card click to navigate to bunny details
   * @param bunnyId - ID of the clicked bunny
   */
    onBunnyCardClick(bunnyId: string): void {
    if (bunnyId) {
      this.router.navigate(['/bunny', bunnyId]).catch((error) => {
        console.error('Navigation error:', error);
      });
    }
  }

}

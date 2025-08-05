import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'uvbunny-happiness-meter',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './happiness-meter.component.html',
  styleUrl: './happiness-meter.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HappinessMeterComponent {
  @Input() happiness: number = 0;
  @Input() size: 'small' | 'medium' | 'large' = 'medium';
  @Input() showStatus: boolean = true;

  /**
   * Get happiness color CSS class based on happiness level
   * @param happiness - Happiness value (0-100)
   * @returns CSS class for happiness color
   */
  getHappinessColor(happiness: number): string {
    const validatedHappiness = this.validateHappiness(happiness);

    if (validatedHappiness >= 80) return 'excellent';
    if (validatedHappiness >= 50) return 'good';
    if (validatedHappiness >= 20) return 'okay';
    return 'poor';
  }

  /**
   * Get happiness width percentage for progress bar
   * @param happiness - Happiness value (0-100)
   * @returns Percentage width string like '75%'
   */
  getHappinessWidth(happiness: number): string {
    const validatedHappiness = this.validateHappiness(happiness);
    return `${validatedHappiness}%`;
  }

  /**
   * Get happiness status text
   * @param happiness - Happiness value (0-100)
   * @returns Status text description
   */
  getHappinessStatus(happiness: number): string {
    const validatedHappiness = this.validateHappiness(happiness);

    if (validatedHappiness >= 80) return 'Excellent! 🌟';
    if (validatedHappiness >= 50) return 'Good 😊';
    if (validatedHappiness >= 20) return 'Needs attention 😐';
    return 'Needs care! 😢';
  }

  /**
   * Validate and clamp happiness value between 0-100
   * @param happiness - Raw happiness value
   * @returns Validated happiness value
   */
  /**
   * Validate and clamp happiness value between 0-100
   * @param happiness - Raw happiness value
   * @returns Validated happiness value
   */
  private validateHappiness(happiness: number): number {
    if (typeof happiness !== 'number' || isNaN(happiness)) {
      return 0;
    }
    return Math.max(0, Math.min(100, Math.round(happiness)));
  }
}

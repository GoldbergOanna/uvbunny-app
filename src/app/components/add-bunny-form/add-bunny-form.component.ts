import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { Observable, of } from 'rxjs';
import { map, startWith, catchError } from 'rxjs/operators';

import { BunnyService } from '@core/services/bunny.service';
import { DashboardStateService } from '@core/services/dashboard-state.service';

@Component({
  selector: 'app-add-bunny-form',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './add-bunny-form.component.html',
  styleUrl: './add-bunny-form.component.scss'
})
export class AddBunnyFormComponent implements OnDestroy {
  private readonly destroy$ = new Subject<void>();
  private readonly bunnyService = inject(BunnyService);
  private readonly fb = inject(FormBuilder);
  private readonly dashboardState = inject(DashboardStateService);

  readonly isSubmitting$: Observable<boolean> = this.dashboardState.state$.pipe(
      map(state => state.isSubmitting),
      startWith(false),
      catchError((error) => {
      console.error('Error loading state:', error);
      return of(false);
          })
        );

  readonly addBunnyForm: FormGroup = this.fb.group({
    name: [
      '',
      [Validators.required, Validators.minLength(2), Validators.maxLength(50)],
    ],
    avatarUrl: [
      '',
      [Validators.pattern(/^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i)],
    ],
    happiness: [
      50,
      [Validators.required, Validators.min(0), Validators.max(100)],
    ],
  });

  async onAddBunny(): Promise<void> {
      if (this.addBunnyForm.valid) {
        try {
          const formValue = this.addBunnyForm.value;
          const bunnyData = {
            name: formValue.name.trim(),
            avatarUrl: formValue.avatarUrl?.trim() || undefined,
            happiness: formValue.happiness,
          };

          const result = await this.bunnyService.addBunny(bunnyData);

          if (result) {
            this.addBunnyForm.reset({
              name: '',
              avatarUrl: '',
              happiness: 50,
            });
            // TODO Success feedback could be added here (toast notification, etc.)
          } else {
            // TODO Error handling - could show toast notification
            console.error('Failed to add bunny');
          }
        } catch (error) {
          console.error('Error adding bunny:', error);
          // TODO Error handling - could show toast notification
        }
      } else {
        // Mark all fields as touched to show validation errors
        this.addBunnyForm.markAllAsTouched();
      }
    }

    /**
     * Get form field error message
     */
    getFieldError(fieldName: string): string | null {
      const field = this.addBunnyForm.get(fieldName);
      if (field && field.invalid && (field.dirty || field.touched)) {
        if (field.errors?.['required']) {
          return `${this.getFieldDisplayName(fieldName)} is required`;
        }
        if (field.errors?.['minlength']) {
          return `${this.getFieldDisplayName(fieldName)} must be at least ${field.errors['minlength'].requiredLength} characters`;
        }
        if (field.errors?.['maxlength']) {
          return `${this.getFieldDisplayName(fieldName)} must be no more than ${field.errors['maxlength'].requiredLength} characters`;
        }
        if (field.errors?.['min']) {
          return `${this.getFieldDisplayName(fieldName)} must be at least ${field.errors['min'].min}`;
        }
        if (field.errors?.['max']) {
          return `${this.getFieldDisplayName(fieldName)} must be no more than ${field.errors['max'].max}`;
        }
        if (field.errors?.['pattern']) {
          return `Please enter a valid image URL`;
        }
      }
      return null;
    }

    /**
     * Check if form field has error
     */
    hasFieldError(fieldName: string): boolean {
      const field = this.addBunnyForm.get(fieldName);
      return !!(field && field.invalid && (field.dirty || field.touched));
    }


    private getFieldDisplayName(fieldName: string): string {
      const displayNames: { [key: string]: string } = {
        name: 'Name',
        avatarUrl: 'Avatar URL',
        happiness: 'Happiness',
      };
      return displayNames[fieldName] || fieldName;
    }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

}

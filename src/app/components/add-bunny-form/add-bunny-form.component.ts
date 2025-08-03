import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ValidatorFn, AbstractControl } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { Observable, of } from 'rxjs';
import { map, startWith, catchError, takeUntil } from 'rxjs/operators';

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
      [this.createImageUrlValidator()],
    ],
    happiness: [
      10,
      [Validators.required, Validators.min(0), Validators.max(100)],
    ],
  });

  private duplicateNameError = false;

  constructor() {
    // Clear duplicate name error when user starts typing
    this.addBunnyForm.get('name')?.valueChanges.pipe(
      takeUntil(this.destroy$)
    ).subscribe(() => {
      if (this.duplicateNameError) {
        this.duplicateNameError = false;
        const nameControl = this.addBunnyForm.get('name');
        if (nameControl?.hasError('duplicateName')) {
          const errors = { ...nameControl.errors };
          delete errors['duplicateName'];
          nameControl.setErrors(Object.keys(errors).length > 0 ? errors : null);
        }
      }
    });
  }

  async onAddBunny(): Promise<void> {
      // Clear any previous duplicate name error
      this.duplicateNameError = false;
      
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
              happiness: 10,
            });
            // TODO Success feedback could be added here (toast notification, etc.)
          } else {
            // TODO Error handling - could show toast notification
            console.error('Failed to add bunny');
          }
        } catch (error) {
          console.error('Error adding bunny:', error);
          if (error instanceof Error && error.message === 'DUPLICATE_NAME') {
            this.duplicateNameError = true;
            this.addBunnyForm.get('name')?.setErrors({ duplicateName: true });
          }
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
        if (field.errors?.['duplicateName']) {
          return `A bunny with this name already exists. Please choose a different name.`;
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
        if (field.errors?.['invalidImageUrl']) {
          return `Please enter a valid image URL (supports gravatar.com, imgur.com, cloudinary.com, etc.)`;
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

    /**
     * Custom validator for image URLs that supports various hosting services
     */
    private createImageUrlValidator(): ValidatorFn {
      return (control: AbstractControl): { [key: string]: any } | null => {
        const value = control.value?.trim();
        
        // Allow empty values since avatar is optional
        if (!value) {
          return null;
        }

        // Basic URL format validation
        const urlPattern = /^https?:\/\/.+/i;
        if (!urlPattern.test(value)) {
          return { invalidImageUrl: true };
        }

        // Allow specific patterns for known image hosting services
        const validPatterns = [
          // Gravatar URLs
          /^https?:\/\/(www\.)?gravatar\.com\/avatar\/[a-f0-9]+(\?.*)?$/i,
          
          // Common image hosting services
          /^https?:\/\/(www\.)?(imgur\.com|i\.imgur\.com)\/.+$/i,
          /^https?:\/\/(www\.)?(cloudinary\.com|res\.cloudinary\.com)\/.+$/i,
          /^https?:\/\/(www\.)?(unsplash\.com|images\.unsplash\.com)\/.+$/i,
          /^https?:\/\/(www\.)?(pexels\.com|images\.pexels\.com)\/.+$/i,
          
          // URLs ending with image extensions
          /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp|svg|bmp|tiff|ico)(\?.*)?$/i,
          
          // GitHub/GitLab avatars and other common patterns
          /^https?:\/\/(www\.)?(github\.com|githubusercontent\.com|gitlab\.com)\/.+$/i,
          /^https?:\/\/(www\.)?(cdn\.|images\.|img\.|media\.|static\.)/i,
          
          // Generic image URLs with common image hosting patterns
          /^https?:\/\/[^\/]+\/.+\.(jpg|jpeg|png|gif|webp|svg)(\?.*)?$/i
        ];

        const isValid = validPatterns.some(pattern => pattern.test(value));
        
        return isValid ? null : { invalidImageUrl: true };
      };
    }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

}

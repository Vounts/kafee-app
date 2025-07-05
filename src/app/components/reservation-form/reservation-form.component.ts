/**
 * Reservation Form Component
 * 
 * This component handles the main reservation form with:
 * - Reactive forms with comprehensive validation
 * - Real-time availability checking
 * - Mobile-responsive design
 * - Step-by-step form progression
 * - Alternative suggestions when slots are unavailable
 */

import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatStepperModule } from '@angular/material/stepper';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatStepper } from '@angular/material/stepper';
import { Subject, Observable, combineLatest } from 'rxjs';
import { takeUntil, debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';

import { 
  ReservationFormData, 
  ReservationConfirmation, 
  TimeSlot, 
  Region, 
  TimeSlotAvailability,
  getAllTimeSlots,
  getAllRegions,
  formatTimeSlot,
  getRegionDisplayName,
  RESERVATION_CONSTRAINTS
} from '../../models/reservation.model';
import { ValidationService } from '../../services/validation.service';
import { ReservationService } from '../../services/reservation.service';

@Component({
  selector: 'app-reservation-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatCardModule,
    MatStepperModule,
    MatCheckboxModule,
    MatIconModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatDividerModule
  ],
  templateUrl: './reservation-form.component.html',
  styleUrls: ['./reservation-form.component.css']
})
export class ReservationFormComponent implements OnInit, OnDestroy {

  // Step FormGroups
  dateTimeForm!: FormGroup;
  partyForm!: FormGroup;
  contactForm!: FormGroup;
  preferencesForm!: FormGroup;

  // Form and validation
  isSubmitting = false;
  currentStep = 0;
  
  // Data for form options
  availableTimeSlots = getAllTimeSlots();
  availableRegions = getAllRegions();
  
  // Availability tracking
  selectedDateAvailability: TimeSlotAvailability[] = [];
  alternativeTimeSlots: TimeSlotAvailability[] = [];
  isCheckingAvailability = false;
  
  // Form state
  showAlternatives = false;
  reservationConfirmed: ReservationConfirmation | null = null;
  
  // Helper functions for template
  formatTimeSlot = formatTimeSlot;
  getRegionDisplayName = getRegionDisplayName;
  
  // Constants
  readonly MAX_PARTY_SIZE = RESERVATION_CONSTRAINTS.MAX_PARTY_SIZE;
  readonly MIN_PARTY_SIZE = RESERVATION_CONSTRAINTS.MIN_PARTY_SIZE;
  readonly START_DATE = RESERVATION_CONSTRAINTS.AVAILABLE_DATES.START_DATE;
  readonly END_DATE = RESERVATION_CONSTRAINTS.AVAILABLE_DATES.END_DATE;
  
  // Destroy subject for cleanup
  private destroy$ = new Subject<void>();
  
  // Stepper reference
  @ViewChild('stepper') stepper!: MatStepper;

  constructor(
    private fb: FormBuilder,
    private validationService: ValidationService,
    private reservationService: ReservationService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.dateTimeForm = this.fb.group({
      date: [null, [Validators.required, this.validationService.dateValidator()]],
      timeSlot: [null, [Validators.required, this.validationService.timeSlotValidator()]],
    });
    this.partyForm = this.fb.group({
      partySize: [2, [
        Validators.required,
        Validators.min(this.MIN_PARTY_SIZE),
        Validators.max(this.MAX_PARTY_SIZE),
        this.validationService.partySizeValidator()
      ]],
      region: [null, [Validators.required, this.validationService.regionValidator()]],
    });
    this.contactForm = this.fb.group({
      customerName: ['', [
        Validators.required,
        Validators.minLength(RESERVATION_CONSTRAINTS.MIN_NAME_LENGTH),
        Validators.maxLength(RESERVATION_CONSTRAINTS.MAX_NAME_LENGTH),
        this.validationService.customerNameValidator()
      ]],
      email: ['', [
        Validators.required,
        Validators.pattern(RESERVATION_CONSTRAINTS.EMAIL_REGEX),
        this.validationService.emailValidator()
      ]],
      phone: ['', [
        Validators.required,
        this.validationService.phoneValidator()
      ]],
    });
    this.preferencesForm = this.fb.group({
      hasChildren: [false],
      smokingRequested: [false]
    });
    this.setupFormSubscriptions();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Set up form subscriptions for real-time validation and availability checking
   */
  private setupFormSubscriptions(): void {
    // Monitor date changes for availability updates
    this.dateTimeForm.get('date')?.valueChanges.pipe(
      takeUntil(this.destroy$),
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(date => {
      if (date) {
        this.checkDateAvailability(date);
      } else {
        this.selectedDateAvailability = [];
      }
    });

    // Monitor time slot changes
    this.dateTimeForm.get('timeSlot')?.valueChanges.pipe(
      takeUntil(this.destroy$),
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(timeSlot => {
      if (timeSlot) {
        this.checkTimeSlotAvailability(timeSlot);
      }
    });

    // Monitor party size changes for capacity validation
    this.partyForm.get('partySize')?.valueChanges.pipe(
      takeUntil(this.destroy$),
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(partySize => {
      if (partySize && this.dateTimeForm.get('timeSlot')?.value) {
        this.checkTimeSlotAvailability(this.dateTimeForm.get('timeSlot')?.value);
      }
    });
  }

  /**
   * Check availability for a specific date
   * @param date - The date to check
   */
  private checkDateAvailability(date: Date): void {
    this.isCheckingAvailability = true;
    this.reservationService.checkDateAvailability(date).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (availability) => {
        this.isCheckingAvailability = false;
        if (availability) {
          this.selectedDateAvailability = availability.timeSlots;
        } else {
          this.selectedDateAvailability = [];
        }
      },
      error: (error) => {
        this.isCheckingAvailability = false;
        this.showError('Error checking availability. Please try again.');
      }
    });
  }

  /**
   * Check availability for the selected time slot
   * @param timeSlot - The time slot to check
   */
  private checkTimeSlotAvailability(timeSlot: TimeSlot): void {
    const date = this.dateTimeForm.get('date')?.value;
    const partySize = this.partyForm.get('partySize')?.value;
    
    if (!date || !partySize) return;

    this.reservationService.checkTimeSlotAvailability(date, timeSlot).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (availability) => {
        if (availability && (!availability.available || availability.remainingCapacity < partySize)) {
          this.showAlternatives = true;
          this.getAlternativeTimeSlots(date, timeSlot, partySize);
        } else {
          this.showAlternatives = false;
          this.alternativeTimeSlots = [];
        }
      },
      error: (error) => {
        this.showError('Error checking time slot availability.');
      }
    });
  }

  /**
   * Get alternative time slots when selected slot is unavailable
   * @param date - The requested date
   * @param timeSlot - The requested time slot
   * @param partySize - The party size
   */
  private getAlternativeTimeSlots(date: Date, timeSlot: TimeSlot, partySize: number): void {
    this.reservationService.getAlternativeTimeSlots(date, timeSlot, partySize).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (alternatives) => {
        this.alternativeTimeSlots = alternatives;
      },
      error: (error) => {
        this.showError('Error getting alternative time slots.');
      }
    });
  }

  /**
   * Select a time slot
   * @param timeSlot - The time slot to select
   */
  selectTimeSlot(timeSlot: TimeSlot): void {
    if (this.isTimeSlotAvailable(timeSlot)) {
      this.dateTimeForm.patchValue({ timeSlot });
      this.dateTimeForm.get('timeSlot')?.markAsTouched();
    }
  }

  /**
   * Select an alternative time slot
   * @param timeSlot - The alternative time slot to select
   */
  selectAlternativeTimeSlot(timeSlot: TimeSlot): void {
    this.dateTimeForm.patchValue({ timeSlot });
    this.showAlternatives = false;
    this.alternativeTimeSlots = [];
  }

  /**
   * Test stepper navigation
   */
  testStepper(): void {
    console.log('Test stepper clicked');
    console.log('Form valid:', this.dateTimeForm.valid);
    console.log('Form values:', this.dateTimeForm.value);
    console.log('Date valid:', this.dateTimeForm.get('date')?.valid);
    console.log('TimeSlot valid:', this.dateTimeForm.get('timeSlot')?.valid);
    console.log('Stepper:', this.stepper);
    
    if (this.stepper) {
      console.log('Current step index:', this.stepper.selectedIndex);
      this.stepper.next();
      console.log('After next, step index:', this.stepper.selectedIndex);
    }
  }

  /**
   * Navigate to the next step in the form
   */
  nextStep(): void {
    console.log('nextStep called, currentStep:', this.currentStep);
    console.log('isCurrentStepValid result:', this.isCurrentStepValid());
    console.log('isStep1Valid result:', this.isStep1Valid());
    
    // Use the stepper's built-in navigation
    if (this.isStep1Valid()) {
      // The stepper will automatically advance to the next step
      console.log('Step 1 validation passed, stepper should advance');
    } else {
      this.markCurrentStepAsTouched();
      console.log('Step 1 validation failed');
    }
  }

  /**
   * Navigate to the previous step in the form
   */
  previousStep(): void {
    this.currentStep--;
  }

  /**
   * Check if step 1 (date and time) is valid
   * @returns True if step 1 is valid
   */
  isStep1Valid(): boolean {
    const dateControl = this.dateTimeForm.get('date');
    const timeSlotControl = this.dateTimeForm.get('timeSlot');
    
    const dateValid = dateControl?.valid;
    const timeSlotValid = timeSlotControl?.valid;
    const dateValue = dateControl?.value;
    const timeSlotValue = timeSlotControl?.value;
    
    console.log('Step 1 validation check:', {
      dateValid,
      dateValue,
      timeSlotValid,
      timeSlotValue,
      bothValid: dateValid && timeSlotValid,
      result: !!(dateValid && timeSlotValid)
    });
    
    return !!(dateValid && timeSlotValid);
  }

  /**
   * Check if the current step is valid
   * @returns True if current step is valid
   */
  isCurrentStepValid(): boolean {
    const stepControls = this.getStepControls(this.currentStep);
    return stepControls.every(controlName => 
      this.dateTimeForm.get(controlName)?.valid
    );
  }

  /**
   * Mark all controls in the current step as touched to show validation errors
   */
  markCurrentStepAsTouched(): void {
    const stepControls = this.getStepControls(this.currentStep);
    stepControls.forEach(controlName => {
      this.dateTimeForm.get(controlName)?.markAsTouched();
    });
  }

  /**
   * Get the form controls for a specific step
   * @param step - The step number
   * @returns Array of control names for the step
   */
  private getStepControls(step: number): string[] {
    const stepControls: { [key: number]: string[] } = {
      0: ['date', 'timeSlot'],
      1: ['partySize', 'region'],
      2: ['customerName', 'email', 'phone'],
      3: ['hasChildren', 'smokingRequested']
    };
    return stepControls[step] || [];
  }

  /**
   * Submit the reservation form
   */
  submitReservation(): void {
    if (this.dateTimeForm.valid && !this.isSubmitting) {
      this.isSubmitting = true;
      
      const formData = {
        ...this.dateTimeForm.value,
        ...this.partyForm.value,
        ...this.contactForm.value,
        ...this.preferencesForm.value,
      };
      
      this.reservationService.createReservation(formData).pipe(
        takeUntil(this.destroy$)
      ).subscribe({
        next: (confirmation) => {
          this.isSubmitting = false;
          this.reservationConfirmed = confirmation;
          this.showSuccess('Reservation confirmed successfully!');
        },
        error: (error) => {
          this.isSubmitting = false;
          if (error.message.includes('no longer available')) {
            this.showError('Selected time slot is no longer available. Please choose another time.');
            this.checkTimeSlotAvailability(formData.timeSlot!);
          } else {
            this.showError('Error creating reservation. Please try again.');
          }
        }
      });
    } else {
      this.markAllAsTouched();
    }
  }

  /**
   * Mark all form controls as touched to show validation errors
   */
  private markAllAsTouched(): void {
    Object.keys(this.dateTimeForm.controls).forEach(key => {
      const control = this.dateTimeForm.get(key);
      control?.markAsTouched();
    });
    Object.keys(this.partyForm.controls).forEach(key => {
      const control = this.partyForm.get(key);
      control?.markAsTouched();
    });
    Object.keys(this.contactForm.controls).forEach(key => {
      const control = this.contactForm.get(key);
      control?.markAsTouched();
    });
    Object.keys(this.preferencesForm.controls).forEach(key => {
      const control = this.preferencesForm.get(key);
      control?.markAsTouched();
    });
  }

  /**
   * Reset the form and start over
   */
  resetForm(): void {
    this.dateTimeForm.reset({
      partySize: 2,
      hasChildren: false,
      smokingRequested: false
    });
    this.currentStep = 0;
    this.reservationConfirmed = null;
    this.showAlternatives = false;
    this.alternativeTimeSlots = [];
    this.selectedDateAvailability = [];
  }

  /**
   * Show success message
   * @param message - The success message to display
   */
  private showSuccess(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 5000,
      panelClass: ['success-snackbar']
    });
  }

  /**
   * Show error message
   * @param message - The error message to display
   */
  private showError(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 5000,
      panelClass: ['error-snackbar']
    });
  }

  /**
   * Get error message for a form control
   * @param controlName - The name of the form control
   * @returns Error message string
   */
  getErrorMessage(controlName: string, group: FormGroup): string {
    const control = group.get(controlName);
    if (control?.errors && control.touched) {
      const errors = control.errors;
      
      if (errors['required']) return 'This field is required';
      if (errors['invalidDate']) return errors['invalidDate'].message;
      if (errors['invalidTimeSlot']) return errors['invalidTimeSlot'].message;
      if (errors['invalidPartySize']) return errors['invalidPartySize'].message;
      if (errors['invalidRegion']) return errors['invalidRegion'].message;
      if (errors['invalidName']) return errors['invalidName'].message;
      if (errors['invalidEmail']) return errors['invalidEmail'].message;
      if (errors['invalidPhone']) return errors['invalidPhone'].message;
      if (errors['min']) return `Minimum value is ${errors['min'].min}`;
      if (errors['max']) return `Maximum value is ${errors['max'].max}`;
      if (errors['minlength']) return `Minimum length is ${errors['minlength'].requiredLength} characters`;
      if (errors['maxlength']) return `Maximum length is ${errors['maxlength'].requiredLength} characters`;
      if (errors['pattern']) return 'Please enter a valid format';
    }
    return '';
  }

  /**
   * Check if a form control has an error
   * @param controlName - The name of the form control
   * @returns True if the control has an error
   */
  hasError(controlName: string, group: FormGroup): boolean {
    const control = group.get(controlName);
    return !!(control?.invalid && control?.touched);
  }

  /**
   * Check if a time slot is available for the selected party size
   * @param timeSlot - The time slot to check
   * @returns True if the time slot is available
   */
  isTimeSlotAvailable(timeSlot: TimeSlot): boolean {
    const availability = this.selectedDateAvailability.find(slot => slot.timeSlot === timeSlot);
    const partySize = this.partyForm.get('partySize')?.value;
    return availability ? (availability.available && availability.remainingCapacity >= partySize) : false;
  }

  /**
   * Get the remaining capacity for a time slot
   * @param timeSlot - The time slot to check
   * @returns Remaining capacity number
   */
  getTimeSlotCapacity(timeSlot: TimeSlot): number {
    const availability = this.selectedDateAvailability.find(slot => slot.timeSlot === timeSlot);
    return availability ? availability.remainingCapacity : 0;
  }
} 
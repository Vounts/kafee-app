/**
 * Reservation Form Component Unit Tests
 * 
 * This file contains comprehensive unit tests for the ReservationFormComponent,
 * covering form validation, step navigation, and user interactions.
 */

import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatSnackBar } from '@angular/material/snack-bar';
import { of, throwError } from 'rxjs';

import { ReservationFormComponent } from './reservation-form.component';
import { ValidationService } from '../../services/validation.service';
import { ReservationService } from '../../services/reservation.service';
import { 
  ReservationFormData, 
  ReservationConfirmation, 
  TimeSlot, 
  Region,
  TimeSlotAvailability,
  DateAvailability
} from '../../models/reservation.model';

describe('ReservationFormComponent', () => {
  let component: ReservationFormComponent;
  let fixture: ComponentFixture<ReservationFormComponent>;
  let validationService: jasmine.SpyObj<ValidationService>;
  let reservationService: jasmine.SpyObj<ReservationService>;
  let snackBar: jasmine.SpyObj<MatSnackBar>;

  beforeEach(async () => {
    const validationSpy = jasmine.createSpyObj('ValidationService', [
      'validateReservationForm',
      'isFormValid',
      'validateDate',
      'validateTimeSlot',
      'validatePartySize',
      'validateRegion',
      'validateCustomerName',
      'validateEmail',
      'validatePhone',
      'dateValidator',
      'timeSlotValidator',
      'partySizeValidator',
      'regionValidator',
      'customerNameValidator',
      'emailValidator',
      'phoneValidator'
    ]);

    const reservationSpy = jasmine.createSpyObj('ReservationService', [
      'checkDateAvailability',
      'checkTimeSlotAvailability',
      'getAlternativeTimeSlots',
      'createReservation',
      'availability$'
    ]);

    const snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);

    await TestBed.configureTestingModule({
      imports: [
        ReservationFormComponent,
        ReactiveFormsModule,
        NoopAnimationsModule
      ],
      providers: [
        { provide: ValidationService, useValue: validationSpy },
        { provide: ReservationService, useValue: reservationSpy },
        { provide: MatSnackBar, useValue: snackBarSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ReservationFormComponent);
    component = fixture.componentInstance;
    validationService = TestBed.inject(ValidationService) as jasmine.SpyObj<ValidationService>;
    reservationService = TestBed.inject(ReservationService) as jasmine.SpyObj<ReservationService>;
    snackBar = TestBed.inject(MatSnackBar) as jasmine.SpyObj<MatSnackBar>;

    // Setup default spy returns
    validationService.dateValidator.and.returnValue(() => null);
    validationService.timeSlotValidator.and.returnValue(() => null);
    validationService.partySizeValidator.and.returnValue(() => null);
    validationService.regionValidator.and.returnValue(() => null);
    validationService.customerNameValidator.and.returnValue(() => null);
    validationService.emailValidator.and.returnValue(() => null);
    validationService.phoneValidator.and.returnValue(() => null);
    reservationService.availability$ = of([]);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Component Initialization', () => {
    it('should initialize form with default values', () => {
      fixture.detectChanges();
      
      expect(component.reservationForm).toBeDefined();
      expect(component.reservationForm.get('partySize')?.value).toBe(2);
      expect(component.reservationForm.get('hasChildren')?.value).toBe(false);
      expect(component.reservationForm.get('smokingRequested')?.value).toBe(false);
    });

    it('should set up form subscriptions', () => {
      spyOn(component as any, 'checkDateAvailability');
      fixture.detectChanges();
      
      // Trigger date change
      component.reservationForm.patchValue({ date: new Date('2024-07-24') });
      tick(300); // Wait for debounce
      
      expect((component as any).checkDateAvailability).toHaveBeenCalled();
    });
  });

  describe('Form Validation', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should validate date field', () => {
      const dateControl = component.reservationForm.get('date');
      expect(dateControl?.hasError('required')).toBe(true);
      
      dateControl?.setValue(new Date('2024-07-24'));
      expect(dateControl?.valid).toBe(true);
    });

    it('should validate time slot field', () => {
      const timeSlotControl = component.reservationForm.get('timeSlot');
      expect(timeSlotControl?.hasError('required')).toBe(true);
      
      timeSlotControl?.setValue(TimeSlot.SIX_PM);
      expect(timeSlotControl?.valid).toBe(true);
    });

    it('should validate party size field', () => {
      const partySizeControl = component.reservationForm.get('partySize');
      expect(partySizeControl?.valid).toBe(true); // Default value is 2
      
      partySizeControl?.setValue(0);
      expect(partySizeControl?.hasError('min')).toBe(true);
      
      partySizeControl?.setValue(15);
      expect(partySizeControl?.hasError('max')).toBe(true);
    });

    it('should validate region field', () => {
      const regionControl = component.reservationForm.get('region');
      expect(regionControl?.hasError('required')).toBe(true);
      
      regionControl?.setValue(Region.MAIN_DINING);
      expect(regionControl?.valid).toBe(true);
    });

    it('should validate customer name field', () => {
      const nameControl = component.reservationForm.get('customerName');
      expect(nameControl?.hasError('required')).toBe(true);
      
      nameControl?.setValue('John Smith');
      expect(nameControl?.valid).toBe(true);
    });

    it('should validate email field', () => {
      const emailControl = component.reservationForm.get('email');
      expect(emailControl?.hasError('required')).toBe(true);
      
      emailControl?.setValue('invalid');
      expect(emailControl?.hasError('pattern')).toBe(true);
      
      emailControl?.setValue('john@example.com');
      expect(emailControl?.valid).toBe(true);
    });

    it('should validate phone field', () => {
      const phoneControl = component.reservationForm.get('phone');
      expect(phoneControl?.hasError('required')).toBe(true);
      
      phoneControl?.setValue('123');
      expect(phoneControl?.hasError('invalidPhone')).toBe(true);
      
      phoneControl?.setValue('1234567890');
      expect(phoneControl?.valid).toBe(true);
    });
  });

  describe('Step Navigation', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should start at step 0', () => {
      expect(component.currentStep).toBe(0);
    });

    it('should navigate to next step when current step is valid', () => {
      // Fill step 0
      component.reservationForm.patchValue({
        date: new Date('2024-07-24'),
        timeSlot: TimeSlot.SIX_PM
      });
      
      component.nextStep();
      expect(component.currentStep).toBe(1);
    });

    it('should not navigate to next step when current step is invalid', () => {
      component.nextStep();
      expect(component.currentStep).toBe(0);
    });

    it('should navigate to previous step', () => {
      component.currentStep = 1;
      component.previousStep();
      expect(component.currentStep).toBe(0);
    });

    it('should mark current step as touched when validation fails', () => {
      const dateControl = component.reservationForm.get('date');
      const timeSlotControl = component.reservationForm.get('timeSlot');
      
      component.nextStep();
      
      expect(dateControl?.touched).toBe(true);
      expect(timeSlotControl?.touched).toBe(true);
    });
  });

  describe('Availability Checking', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should check date availability when date changes', fakeAsync(() => {
      spyOn(component as any, 'checkDateAvailability');
      
      component.reservationForm.patchValue({ date: new Date('2024-07-24') });
      tick(300); // Wait for debounce
      
      expect((component as any).checkDateAvailability).toHaveBeenCalledWith(new Date('2024-07-24'));
    }));

    it('should check time slot availability when time slot changes', fakeAsync(() => {
      spyOn(component as any, 'checkTimeSlotAvailability');
      
      component.reservationForm.patchValue({ timeSlot: TimeSlot.SIX_PM });
      tick(300); // Wait for debounce
      
      expect((component as any).checkTimeSlotAvailability).toHaveBeenCalledWith(TimeSlot.SIX_PM);
    }));

    it('should update selected date availability', () => {
      const mockAvailability: DateAvailability = {
        date: new Date('2024-07-24'),
        timeSlots: [
          {
            timeSlot: TimeSlot.SIX_PM,
            available: true,
            remainingCapacity: 10,
            maxCapacity: 20
          }
        ],
        isFullyBooked: false
      };

      reservationService.checkDateAvailability.and.returnValue(of(mockAvailability));
      
      (component as any).checkDateAvailability(new Date('2024-07-24'));
      
      expect(component.selectedDateAvailability).toEqual(mockAvailability.timeSlots);
    });
  });

  describe('Time Slot Selection', () => {
    beforeEach(() => {
      fixture.detectChanges();
      component.selectedDateAvailability = [
        {
          timeSlot: TimeSlot.SIX_PM,
          available: true,
          remainingCapacity: 10,
          maxCapacity: 20
        },
        {
          timeSlot: TimeSlot.SEVEN_PM,
          available: false,
          remainingCapacity: 0,
          maxCapacity: 20
        }
      ];
    });

    it('should correctly identify available time slots', () => {
      expect(component.isTimeSlotAvailable(TimeSlot.SIX_PM)).toBe(true);
      expect(component.isTimeSlotAvailable(TimeSlot.SEVEN_PM)).toBe(false);
    });

    it('should get correct capacity for time slots', () => {
      expect(component.getTimeSlotCapacity(TimeSlot.SIX_PM)).toBe(10);
      expect(component.getTimeSlotCapacity(TimeSlot.SEVEN_PM)).toBe(0);
    });

    it('should select alternative time slot', () => {
      const alternative: TimeSlotAvailability = {
        timeSlot: TimeSlot.EIGHT_PM,
        available: true,
        remainingCapacity: 5,
        maxCapacity: 20
      };
      
      component.alternativeTimeSlots = [alternative];
      component.selectAlternativeTimeSlot(TimeSlot.EIGHT_PM);
      
      expect(component.reservationForm.get('timeSlot')?.value).toBe(TimeSlot.EIGHT_PM);
      expect(component.showAlternatives).toBe(false);
    });
  });

  describe('Reservation Submission', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should submit reservation successfully', fakeAsync(() => {
      const mockConfirmation: ReservationConfirmation = {
        reservationId: 'RES-123',
        customerName: 'John Smith',
        date: new Date('2024-07-24'),
        timeSlot: TimeSlot.SIX_PM,
        partySize: 4,
        region: Region.MAIN_DINING,
        email: 'john@example.com',
        phone: '1234567890',
        hasChildren: false,
        smokingRequested: false,
        confirmationCode: '123456',
        createdAt: new Date()
      };

      // Fill form
      component.reservationForm.patchValue({
        date: new Date('2024-07-24'),
        timeSlot: TimeSlot.SIX_PM,
        partySize: 4,
        region: Region.MAIN_DINING,
        customerName: 'John Smith',
        email: 'john@example.com',
        phone: '1234567890',
        hasChildren: false,
        smokingRequested: false
      });

      reservationService.createReservation.and.returnValue(of(mockConfirmation));
      
      component.submitReservation();
      tick();
      
      expect(component.reservationConfirmed).toEqual(mockConfirmation);
      expect(snackBar.open).toHaveBeenCalledWith(
        'Reservation confirmed successfully!',
        'Close',
        { duration: 5000, panelClass: ['success-snackbar'] }
      );
    }));

    it('should handle reservation submission error', fakeAsync(() => {
      // Fill form
      component.reservationForm.patchValue({
        date: new Date('2024-07-24'),
        timeSlot: TimeSlot.SIX_PM,
        partySize: 4,
        region: Region.MAIN_DINING,
        customerName: 'John Smith',
        email: 'john@example.com',
        phone: '1234567890',
        hasChildren: false,
        smokingRequested: false
      });

      const error = new Error('Selected time slot is no longer available');
      reservationService.createReservation.and.returnValue(throwError(() => error));
      
      component.submitReservation();
      tick();
      
      expect(component.isSubmitting).toBe(false);
      expect(snackBar.open).toHaveBeenCalledWith(
        'Selected time slot is no longer available. Please choose another time.',
        'Close',
        { duration: 5000, panelClass: ['error-snackbar'] }
      );
    }));

    it('should not submit when form is invalid', () => {
      component.submitReservation();
      
      expect(component.isSubmitting).toBe(false);
      expect(reservationService.createReservation).not.toHaveBeenCalled();
    });
  });

  describe('Form Reset', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should reset form to initial state', () => {
      // Fill form
      component.reservationForm.patchValue({
        date: new Date('2024-07-24'),
        timeSlot: TimeSlot.SIX_PM,
        partySize: 4,
        region: Region.MAIN_DINING,
        customerName: 'John Smith',
        email: 'john@example.com',
        phone: '1234567890',
        hasChildren: true,
        smokingRequested: true
      });
      
      component.currentStep = 2;
      component.reservationConfirmed = {} as ReservationConfirmation;
      
      component.resetForm();
      
      expect(component.currentStep).toBe(0);
      expect(component.reservationConfirmed).toBeNull();
      expect(component.reservationForm.get('partySize')?.value).toBe(2);
      expect(component.reservationForm.get('hasChildren')?.value).toBe(false);
      expect(component.reservationForm.get('smokingRequested')?.value).toBe(false);
    });
  });

  describe('Error Handling', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should show error message for field validation', () => {
      const dateControl = component.reservationForm.get('date');
      dateControl?.markAsTouched();
      
      const errorMessage = component.getErrorMessage('date');
      expect(errorMessage).toBe('This field is required');
    });

    it('should check if field has error', () => {
      const dateControl = component.reservationForm.get('date');
      dateControl?.markAsTouched();
      
      expect(component.hasError('date')).toBe(true);
    });

    it('should show success message', () => {
      (component as any).showSuccess('Test success message');
      
      expect(snackBar.open).toHaveBeenCalledWith(
        'Test success message',
        'Close',
        { duration: 5000, panelClass: ['success-snackbar'] }
      );
    });

    it('should show error message', () => {
      (component as any).showError('Test error message');
      
      expect(snackBar.open).toHaveBeenCalledWith(
        'Test error message',
        'Close',
        { duration: 5000, panelClass: ['error-snackbar'] }
      );
    });
  });

  describe('Component Cleanup', () => {
    it('should complete destroy subject on ngOnDestroy', () => {
      fixture.detectChanges();
      
      spyOn(component['destroy$'], 'next');
      spyOn(component['destroy$'], 'complete');
      
      component.ngOnDestroy();
      
      expect(component['destroy$'].next).toHaveBeenCalled();
      expect(component['destroy$'].complete).toHaveBeenCalled();
    });
  });

  describe('Helper Functions', () => {
    it('should get step controls correctly', () => {
      expect((component as any).getStepControls(0)).toEqual(['date', 'timeSlot']);
      expect((component as any).getStepControls(1)).toEqual(['partySize', 'region']);
      expect((component as any).getStepControls(2)).toEqual(['customerName', 'email', 'phone']);
      expect((component as any).getStepControls(3)).toEqual(['hasChildren', 'smokingRequested']);
    });

    it('should check if current step is valid', () => {
      component.reservationForm.patchValue({
        date: new Date('2024-07-24'),
        timeSlot: TimeSlot.SIX_PM
      });
      
      expect(component.isCurrentStepValid()).toBe(true);
    });

    it('should mark current step as touched', () => {
      const dateControl = component.reservationForm.get('date');
      const timeSlotControl = component.reservationForm.get('timeSlot');
      
      component.markCurrentStepAsTouched();
      
      expect(dateControl?.touched).toBe(true);
      expect(timeSlotControl?.touched).toBe(true);
    });
  });
}); 
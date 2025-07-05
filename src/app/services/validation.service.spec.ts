/**
 * Validation Service Unit Tests
 * 
 * This file contains comprehensive unit tests for the ValidationService,
 * covering all validation methods and edge cases.
 */

import { TestBed } from '@angular/core/testing';
import { ValidationService } from './validation.service';
import { 
  ReservationFormData, 
  TimeSlot, 
  Region, 
  RESERVATION_CONSTRAINTS 
} from '../models/reservation.model';

describe('ValidationService', () => {
  let service: ValidationService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ValidationService]
    });
    service = TestBed.inject(ValidationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('validateDate', () => {
    it('should return error for null date', () => {
      const result = service.validateDate(null);
      expect(result).toBe('Please select a date for your reservation');
    });

    it('should return error for past date', () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);
      const result = service.validateDate(pastDate);
      expect(result).toBe('Reservation date cannot be in the past');
    });

    it('should return error for date before start date', () => {
      const beforeStartDate = new Date(RESERVATION_CONSTRAINTS.AVAILABLE_DATES.START_DATE);
      beforeStartDate.setDate(beforeStartDate.getDate() - 1);
      const result = service.validateDate(beforeStartDate);
      expect(result).toContain('Reservations are only available from');
    });

    it('should return error for date after end date', () => {
      const afterEndDate = new Date(RESERVATION_CONSTRAINTS.AVAILABLE_DATES.END_DATE);
      afterEndDate.setDate(afterEndDate.getDate() + 1);
      const result = service.validateDate(afterEndDate);
      expect(result).toContain('Reservations are only available until');
    });

    it('should return null for valid date', () => {
      const validDate = new Date(RESERVATION_CONSTRAINTS.AVAILABLE_DATES.START_DATE);
      const result = service.validateDate(validDate);
      expect(result).toBeNull();
    });
  });

  describe('validateTimeSlot', () => {
    it('should return error for null time slot', () => {
      const result = service.validateTimeSlot(null);
      expect(result).toBe('Please select a time for your reservation');
    });

    it('should return error for invalid time slot', () => {
      const result = service.validateTimeSlot('invalid' as TimeSlot);
      expect(result).toBe('Please select a valid time slot');
    });

    it('should return null for valid time slot', () => {
      const result = service.validateTimeSlot(TimeSlot.SIX_PM);
      expect(result).toBeNull();
    });
  });

  describe('validatePartySize', () => {
    it('should return error for null party size', () => {
      const result = service.validatePartySize(null as any);
      expect(result).toBe('Please enter the number of guests');
    });

    it('should return error for NaN party size', () => {
      const result = service.validatePartySize(NaN);
      expect(result).toBe('Please enter the number of guests');
    });

    it('should return error for party size below minimum', () => {
      const result = service.validatePartySize(RESERVATION_CONSTRAINTS.MIN_PARTY_SIZE - 1);
      expect(result).toContain('Minimum party size is');
    });

    it('should return error for party size above maximum', () => {
      const result = service.validatePartySize(RESERVATION_CONSTRAINTS.MAX_PARTY_SIZE + 1);
      expect(result).toContain('Maximum party size is');
    });

    it('should return error for non-integer party size', () => {
      const result = service.validatePartySize(2.5);
      expect(result).toBe('Party size must be a whole number');
    });

    it('should return null for valid party size', () => {
      const result = service.validatePartySize(4);
      expect(result).toBeNull();
    });
  });

  describe('validateRegion', () => {
    it('should return error for null region', () => {
      const result = service.validateRegion(null);
      expect(result).toBe('Please select a seating area preference');
    });

    it('should return error for invalid region', () => {
      const result = service.validateRegion('invalid' as Region);
      expect(result).toBe('Please select a valid seating area');
    });

    it('should return null for valid region', () => {
      const result = service.validateRegion(Region.MAIN_DINING);
      expect(result).toBeNull();
    });
  });

  describe('validateCustomerName', () => {
    it('should return error for empty name', () => {
      const result = service.validateCustomerName('');
      expect(result).toBe('Please enter your name');
    });

    it('should return error for whitespace-only name', () => {
      const result = service.validateCustomerName('   ');
      expect(result).toBe('Please enter your name');
    });

    it('should return error for name too short', () => {
      const result = service.validateCustomerName('A');
      expect(result).toContain('Name must be at least');
    });

    it('should return error for name too long', () => {
      const longName = 'A'.repeat(RESERVATION_CONSTRAINTS.MAX_NAME_LENGTH + 1);
      const result = service.validateCustomerName(longName);
      expect(result).toContain('Name cannot exceed');
    });

    it('should return error for name with invalid characters', () => {
      const result = service.validateCustomerName('John123');
      expect(result).toBe('Name can only contain letters, spaces, hyphens, and apostrophes');
    });

    it('should return null for valid name', () => {
      const result = service.validateCustomerName('John Smith');
      expect(result).toBeNull();
    });

    it('should accept names with hyphens and apostrophes', () => {
      const result1 = service.validateCustomerName('Jean-Pierre');
      const result2 = service.validateCustomerName("O'Connor");
      expect(result1).toBeNull();
      expect(result2).toBeNull();
    });
  });

  describe('validateEmail', () => {
    it('should return error for empty email', () => {
      const result = service.validateEmail('');
      expect(result).toBe('Please enter your email address');
    });

    it('should return error for whitespace-only email', () => {
      const result = service.validateEmail('   ');
      expect(result).toBe('Please enter your email address');
    });

    it('should return error for invalid email format', () => {
      const invalidEmails = [
        'invalid',
        'invalid@',
        '@invalid.com',
        'invalid@invalid',
        'invalid..invalid@domain.com'
      ];

      invalidEmails.forEach(email => {
        const result = service.validateEmail(email);
        expect(result).toBe('Please enter a valid email address');
      });
    });

    it('should return null for valid email', () => {
      const validEmails = [
        'test@example.com',
        'user.name@domain.co.uk',
        'user+tag@example.org'
      ];

      validEmails.forEach(email => {
        const result = service.validateEmail(email);
        expect(result).toBeNull();
      });
    });
  });

  describe('validatePhone', () => {
    it('should return error for empty phone', () => {
      const result = service.validatePhone('');
      expect(result).toBe('Please enter your phone number');
    });

    it('should return error for whitespace-only phone', () => {
      const result = service.validatePhone('   ');
      expect(result).toBe('Please enter your phone number');
    });

    it('should return error for phone with too few digits', () => {
      const result = service.validatePhone('123456789');
      expect(result).toBe('Phone number must have at least 10 digits');
    });

    it('should return error for phone with too many digits', () => {
      const result = service.validatePhone('1234567890123456');
      expect(result).toBe('Phone number cannot exceed 15 digits');
    });

    it('should return error for phone starting with 0', () => {
      const result = service.validatePhone('01234567890');
      expect(result).toBe('Please enter a valid phone number');
    });

    it('should return null for valid phone numbers', () => {
      const validPhones = [
        '1234567890',
        '+1234567890',
        '12345678901',
        '+123456789012'
      ];

      validPhones.forEach(phone => {
        const result = service.validatePhone(phone);
        expect(result).toBeNull();
      });
    });

    it('should handle phone numbers with formatting', () => {
      const result = service.validatePhone('(123) 456-7890');
      expect(result).toBeNull();
    });
  });

  describe('validateReservationForm', () => {
    it('should return empty object for valid form data', () => {
      const validFormData: ReservationFormData = {
        date: new Date(RESERVATION_CONSTRAINTS.AVAILABLE_DATES.START_DATE),
        timeSlot: TimeSlot.SIX_PM,
        partySize: 4,
        region: Region.MAIN_DINING,
        customerName: 'John Smith',
        email: 'john@example.com',
        phone: '1234567890',
        hasChildren: false,
        smokingRequested: false
      };

      const result = service.validateReservationForm(validFormData);
      expect(result).toEqual({});
    });

    it('should return errors for invalid form data', () => {
      const invalidFormData: ReservationFormData = {
        date: null,
        timeSlot: null,
        partySize: 0,
        region: null,
        customerName: '',
        email: 'invalid',
        phone: '123',
        hasChildren: false,
        smokingRequested: false
      };

      const result = service.validateReservationForm(invalidFormData);
      expect(Object.keys(result).length).toBeGreaterThan(0);
      expect(result.date).toBeDefined();
      expect(result.timeSlot).toBeDefined();
      expect(result.partySize).toBeDefined();
      expect(result.region).toBeDefined();
      expect(result.customerName).toBeDefined();
      expect(result.email).toBeDefined();
      expect(result.phone).toBeDefined();
    });
  });

  describe('isFormValid', () => {
    it('should return true for valid form data', () => {
      const validFormData: ReservationFormData = {
        date: new Date(RESERVATION_CONSTRAINTS.AVAILABLE_DATES.START_DATE),
        timeSlot: TimeSlot.SIX_PM,
        partySize: 4,
        region: Region.MAIN_DINING,
        customerName: 'John Smith',
        email: 'john@example.com',
        phone: '1234567890',
        hasChildren: false,
        smokingRequested: false
      };

      const result = service.isFormValid(validFormData);
      expect(result).toBe(true);
    });

    it('should return false for invalid form data', () => {
      const invalidFormData: ReservationFormData = {
        date: null,
        timeSlot: null,
        partySize: 0,
        region: null,
        customerName: '',
        email: 'invalid',
        phone: '123',
        hasChildren: false,
        smokingRequested: false
      };

      const result = service.isFormValid(invalidFormData);
      expect(result).toBe(false);
    });
  });

  describe('Custom Validators', () => {
    describe('dateValidator', () => {
      it('should return validation error for invalid date', () => {
        const validator = service.dateValidator();
        const control = { value: null };
        const result = validator(control as any);
        expect(result).toEqual({
          invalidDate: { value: null, message: 'Please select a date for your reservation' }
        });
      });

      it('should return null for valid date', () => {
        const validator = service.dateValidator();
        const control = { value: new Date(RESERVATION_CONSTRAINTS.AVAILABLE_DATES.START_DATE) };
        const result = validator(control as any);
        expect(result).toBeNull();
      });
    });

    describe('timeSlotValidator', () => {
      it('should return validation error for invalid time slot', () => {
        const validator = service.timeSlotValidator();
        const control = { value: null };
        const result = validator(control as any);
        expect(result).toEqual({
          invalidTimeSlot: { value: null, message: 'Please select a time for your reservation' }
        });
      });

      it('should return null for valid time slot', () => {
        const validator = service.timeSlotValidator();
        const control = { value: TimeSlot.SIX_PM };
        const result = validator(control as any);
        expect(result).toBeNull();
      });
    });

    describe('partySizeValidator', () => {
      it('should return validation error for invalid party size', () => {
        const validator = service.partySizeValidator();
        const control = { value: 0 };
        const result = validator(control as any);
        expect(result?.['invalidPartySize']).toBeDefined();
      });

      it('should return null for valid party size', () => {
        const validator = service.partySizeValidator();
        const control = { value: 4 };
        const result = validator(control as any);
        expect(result).toBeNull();
      });
    });

    describe('regionValidator', () => {
      it('should return validation error for invalid region', () => {
        const validator = service.regionValidator();
        const control = { value: null };
        const result = validator(control as any);
        expect(result).toEqual({
          invalidRegion: { value: null, message: 'Please select a seating area preference' }
        });
      });

      it('should return null for valid region', () => {
        const validator = service.regionValidator();
        const control = { value: Region.MAIN_DINING };
        const result = validator(control as any);
        expect(result).toBeNull();
      });
    });

    describe('customerNameValidator', () => {
      it('should return validation error for invalid name', () => {
        const validator = service.customerNameValidator();
        const control = { value: '' };
        const result = validator(control as any);
        expect(result?.['invalidName']).toBeDefined();
      });

      it('should return null for valid name', () => {
        const validator = service.customerNameValidator();
        const control = { value: 'John Smith' };
        const result = validator(control as any);
        expect(result).toBeNull();
      });
    });

    describe('emailValidator', () => {
      it('should return validation error for invalid email', () => {
        const validator = service.emailValidator();
        const control = { value: 'invalid' };
        const result = validator(control as any);
        expect(result?.['invalidEmail']).toBeDefined();
      });

      it('should return null for valid email', () => {
        const validator = service.emailValidator();
        const control = { value: 'test@example.com' };
        const result = validator(control as any);
        expect(result).toBeNull();
      });
    });

    describe('phoneValidator', () => {
      it('should return validation error for invalid phone', () => {
        const validator = service.phoneValidator();
        const control = { value: '123' };
        const result = validator(control as any);
        expect(result?.['invalidPhone']).toBeDefined();
      });

      it('should return null for valid phone', () => {
        const validator = service.phoneValidator();
        const control = { value: '1234567890' };
        const result = validator(control as any);
        expect(result).toBeNull();
      });
    });
  });
}); 
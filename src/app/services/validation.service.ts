/**
 * Validation Service for Reservation System
 * 
 * This service provides comprehensive form validation for the reservation system,
 * including custom validators and validation logic for all form fields.
 */

import { Injectable } from '@angular/core';
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { 
  ReservationFormData, 
  ReservationValidationErrors, 
  RESERVATION_CONSTRAINTS,
  Region,
  TimeSlot,
  getAllTimeSlots,
  getAllRegions
} from '../models/reservation.model';

@Injectable({
  providedIn: 'root'
})
export class ValidationService {

  constructor() { }

  /**
   * Validates the complete reservation form data
   * @param formData - The reservation form data to validate
   * @returns Object containing validation errors for each field
   */
  validateReservationForm(formData: ReservationFormData): ReservationValidationErrors {
    const errors: ReservationValidationErrors = {};

    // Validate date
    const dateError = this.validateDate(formData.date);
    if (dateError) errors.date = dateError;

    // Validate time slot
    const timeSlotError = this.validateTimeSlot(formData.timeSlot);
    if (timeSlotError) errors.timeSlot = timeSlotError;

    // Validate party size
    const partySizeError = this.validatePartySize(formData.partySize);
    if (partySizeError) errors.partySize = partySizeError;

    // Validate region
    const regionError = this.validateRegion(formData.region);
    if (regionError) errors.region = regionError;

    // Validate customer name
    const nameError = this.validateCustomerName(formData.customerName);
    if (nameError) errors.customerName = nameError;

    // Validate email
    const emailError = this.validateEmail(formData.email);
    if (emailError) errors.email = emailError;

    // Validate phone
    const phoneError = this.validatePhone(formData.phone);
    if (phoneError) errors.phone = phoneError;

    return errors;
  }

  /**
   * Validates if the form has any errors
   * @param formData - The reservation form data to validate
   * @returns True if the form is valid, false otherwise
   */
  isFormValid(formData: ReservationFormData): boolean {
    const errors = this.validateReservationForm(formData);
    return Object.keys(errors).length === 0;
  }

  /**
   * Validates the reservation date
   * @param date - The date to validate
   * @returns Error message if invalid, null if valid
   */
  validateDate(date: Date | null): string | null {
    if (!date) {
      return 'Please select a date for your reservation';
    }

    // Normalize dates to midnight for comparison
    const normalizedDate = new Date(date);
    normalizedDate.setHours(0, 0, 0, 0);
    
    const startDate = new Date(RESERVATION_CONSTRAINTS.AVAILABLE_DATES.START_DATE);
    startDate.setHours(0, 0, 0, 0);
    
    const endDate = new Date(RESERVATION_CONSTRAINTS.AVAILABLE_DATES.END_DATE);
    endDate.setHours(0, 0, 0, 0);

    if (normalizedDate < startDate) {
      return `Reservations are only available from ${RESERVATION_CONSTRAINTS.AVAILABLE_DATES.START_DATE.toLocaleDateString()}`;
    }

    if (normalizedDate > endDate) {
      return `Reservations are only available until ${RESERVATION_CONSTRAINTS.AVAILABLE_DATES.END_DATE.toLocaleDateString()}`;
    }

    return null;
  }

  /**
   * Validates the time slot
   * @param timeSlot - The time slot to validate
   * @returns Error message if invalid, null if valid
   */
  validateTimeSlot(timeSlot: TimeSlot | null): string | null {
    if (!timeSlot) {
      return 'Please select a time for your reservation';
    }

    const validTimeSlots = getAllTimeSlots();
    if (!validTimeSlots.includes(timeSlot)) {
      return 'Please select a valid time slot';
    }

    return null;
  }

  /**
   * Validates the party size
   * @param partySize - The party size to validate
   * @returns Error message if invalid, null if valid
   */
  validatePartySize(partySize: number): string | null {
    if (!partySize || isNaN(partySize)) {
      return 'Please enter the number of guests';
    }

    if (partySize < RESERVATION_CONSTRAINTS.MIN_PARTY_SIZE) {
      return `Minimum party size is ${RESERVATION_CONSTRAINTS.MIN_PARTY_SIZE} guest`;
    }

    if (partySize > RESERVATION_CONSTRAINTS.MAX_PARTY_SIZE) {
      return `Maximum party size is ${RESERVATION_CONSTRAINTS.MAX_PARTY_SIZE} guests`;
    }

    if (!Number.isInteger(partySize)) {
      return 'Party size must be a whole number';
    }

    return null;
  }

  /**
   * Validates the region selection
   * @param region - The region to validate
   * @returns Error message if invalid, null if valid
   */
  validateRegion(region: Region | null): string | null {
    if (!region) {
      return 'Please select a seating area preference';
    }

    const validRegions = getAllRegions();
    if (!validRegions.includes(region)) {
      return 'Please select a valid seating area';
    }

    return null;
  }

  /**
   * Validates the customer name
   * @param name - The name to validate
   * @returns Error message if invalid, null if valid
   */
  validateCustomerName(name: string): string | null {
    if (!name || name.trim().length === 0) {
      return 'Please enter your name';
    }

    const trimmedName = name.trim();
    if (trimmedName.length < RESERVATION_CONSTRAINTS.MIN_NAME_LENGTH) {
      return `Name must be at least ${RESERVATION_CONSTRAINTS.MIN_NAME_LENGTH} characters long`;
    }

    if (trimmedName.length > RESERVATION_CONSTRAINTS.MAX_NAME_LENGTH) {
      return `Name cannot exceed ${RESERVATION_CONSTRAINTS.MAX_NAME_LENGTH} characters`;
    }

    // Check for valid characters (letters, spaces, hyphens, apostrophes)
    const nameRegex = /^[a-zA-Z\s\-']+$/;
    if (!nameRegex.test(trimmedName)) {
      return 'Name can only contain letters, spaces, hyphens, and apostrophes';
    }

    return null;
  }

  /**
   * Validates the email address
   * @param email - The email to validate
   * @returns Error message if invalid, null if valid
   */
  validateEmail(email: string): string | null {
    if (!email || email.trim().length === 0) {
      return 'Please enter your email address';
    }

    const trimmedEmail = email.trim();
    if (!RESERVATION_CONSTRAINTS.EMAIL_REGEX.test(trimmedEmail)) {
      return 'Please enter a valid email address';
    }

    return null;
  }

  /**
   * Validates the phone number
   * @param phone - The phone number to validate
   * @returns Error message if invalid, null if valid
   */
  validatePhone(phone: string): string | null {
    if (!phone || phone.trim().length === 0) {
      return 'Please enter your phone number';
    }

    // Remove all non-digit characters for validation
    const cleanPhone = phone.replace(/\D/g, '');
    
    if (cleanPhone.length < 10) {
      return 'Phone number must have at least 10 digits';
    }

    if (cleanPhone.length > 15) {
      return 'Phone number cannot exceed 15 digits';
    }

    if (!RESERVATION_CONSTRAINTS.PHONE_REGEX.test(cleanPhone)) {
      return 'Please enter a valid phone number';
    }

    return null;
  }

  /**
   * Custom validator for date field
   * @returns ValidatorFn for date validation
   */
  dateValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const date = control.value;
      const error = this.validateDate(date);
      return error ? { invalidDate: { value: date, message: error } } : null;
    };
  }

  /**
   * Custom validator for time slot field
   * @returns ValidatorFn for time slot validation
   */
  timeSlotValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const timeSlot = control.value;
      const error = this.validateTimeSlot(timeSlot);
      return error ? { invalidTimeSlot: { value: timeSlot, message: error } } : null;
    };
  }

  /**
   * Custom validator for party size field
   * @returns ValidatorFn for party size validation
   */
  partySizeValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const partySize = control.value;
      const error = this.validatePartySize(partySize);
      return error ? { invalidPartySize: { value: partySize, message: error } } : null;
    };
  }

  /**
   * Custom validator for region field
   * @returns ValidatorFn for region validation
   */
  regionValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const region = control.value;
      const error = this.validateRegion(region);
      return error ? { invalidRegion: { value: region, message: error } } : null;
    };
  }

  /**
   * Custom validator for customer name field
   * @returns ValidatorFn for customer name validation
   */
  customerNameValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const name = control.value;
      const error = this.validateCustomerName(name);
      return error ? { invalidName: { value: name, message: error } } : null;
    };
  }

  /**
   * Custom validator for email field
   * @returns ValidatorFn for email validation
   */
  emailValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const email = control.value;
      const error = this.validateEmail(email);
      return error ? { invalidEmail: { value: email, message: error } } : null;
    };
  }

  /**
   * Custom validator for phone field
   * @returns ValidatorFn for phone validation
   */
  phoneValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const phone = control.value;
      const error = this.validatePhone(phone);
      return error ? { invalidPhone: { value: phone, message: error } } : null;
    };
  }
} 
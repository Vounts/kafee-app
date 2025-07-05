/**
 * Reservation Service for Kafè Restaurant
 * 
 * This service manages all reservation-related operations including:
 * - Checking availability for dates and time slots
 * - Creating and managing reservations
 * - Real-time availability updates
 * - Alternative suggestions when requested slots are unavailable
 */

import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, timer } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';
import { 
  ReservationFormData, 
  ReservationConfirmation, 
  DateAvailability, 
  TimeSlotAvailability,
  TimeSlot,
  Region,
  getAllTimeSlots,
  getAllRegions,
  RESERVATION_CONSTRAINTS
} from '../models/reservation.model';

@Injectable({
  providedIn: 'root'
})
export class ReservationService {

  // BehaviorSubject to track real-time availability changes
  private availabilitySubject = new BehaviorSubject<DateAvailability[]>([]);
  public availability$ = this.availabilitySubject.asObservable();

  // In-memory storage for reservations (in a real app, this would be a database)
  private reservations: ReservationConfirmation[] = [];

  // Mock availability data - in a real app, this would come from a backend
  private mockAvailability: DateAvailability[] = [];

  constructor() {
    this.initializeMockAvailability();
    this.startRealTimeUpdates();
  }

  /**
   * Initialize mock availability data for the reservation period
   */
  private initializeMockAvailability(): void {
    const startDate = RESERVATION_CONSTRAINTS.AVAILABLE_DATES.START_DATE;
    const endDate = RESERVATION_CONSTRAINTS.AVAILABLE_DATES.END_DATE;
    
    for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
      const dateAvailability: DateAvailability = {
        date: new Date(date),
        timeSlots: this.generateTimeSlotAvailability(),
        isFullyBooked: false
      };
      this.mockAvailability.push(dateAvailability);
    }
    
    this.availabilitySubject.next(this.mockAvailability);
  }

  /**
   * Generate time slot availability with random booking patterns
   */
  private generateTimeSlotAvailability(): TimeSlotAvailability[] {
    const timeSlots = getAllTimeSlots();
    return timeSlots.map(timeSlot => {
      // Simulate different availability patterns
      const isWeekend = new Date().getDay() === 0 || new Date().getDay() === 6;
      const baseCapacity = isWeekend ? 40 : 60; // Weekend vs weekday capacity
      const maxCapacity = baseCapacity;
      
      // Random availability (in real app, this would be based on actual bookings)
      const remainingCapacity = Math.max(0, Math.floor(Math.random() * maxCapacity));
      const available = remainingCapacity > 0;
      
      return {
        timeSlot,
        available,
        remainingCapacity,
        maxCapacity
      };
    });
  }

  /**
   * Start real-time availability updates (simulates live updates)
   */
  private startRealTimeUpdates(): void {
    // Update availability every 30 seconds to simulate real-time changes
    timer(0, 30000).pipe(
      switchMap(() => this.simulateAvailabilityChange())
    ).subscribe();
  }

  /**
   * Simulate availability changes (in real app, this would be websocket updates)
   */
  private simulateAvailabilityChange(): Observable<void> {
    return of(void 0).pipe(
      tap(() => {
        // Randomly update some time slots to simulate booking activity
        this.mockAvailability.forEach(dateAvailability => {
          dateAvailability.timeSlots.forEach(timeSlot => {
            if (Math.random() < 0.1) { // 10% chance of change
              timeSlot.remainingCapacity = Math.max(0, timeSlot.remainingCapacity - Math.floor(Math.random() * 5));
              timeSlot.available = timeSlot.remainingCapacity > 0;
            }
          });
          
          // Update fully booked status
          dateAvailability.isFullyBooked = dateAvailability.timeSlots.every(slot => !slot.available);
        });
        
        this.availabilitySubject.next([...this.mockAvailability]);
      })
    );
  }

  /**
   * Check availability for a specific date
   * @param date - The date to check availability for
   * @returns Observable of DateAvailability
   */
  checkDateAvailability(date: Date): Observable<DateAvailability | null> {
    return this.availability$.pipe(
      map(availability => {
        const dateStr = date.toDateString();
        return availability.find(d => d.date.toDateString() === dateStr) || null;
      })
    );
  }

  /**
   * Check availability for a specific date and time slot
   * @param date - The date to check
   * @param timeSlot - The time slot to check
   * @returns Observable of TimeSlotAvailability | null
   */
  checkTimeSlotAvailability(date: Date, timeSlot: TimeSlot): Observable<TimeSlotAvailability | null> {
    return this.checkDateAvailability(date).pipe(
      map(dateAvailability => {
        if (!dateAvailability) return null;
        return dateAvailability.timeSlots.find(slot => slot.timeSlot === timeSlot) || null;
      })
    );
  }

  /**
   * Get alternative time slots when requested slot is unavailable
   * @param date - The requested date
   * @param timeSlot - The requested time slot
   * @param partySize - The party size
   * @returns Observable of alternative TimeSlotAvailability[]
   */
  getAlternativeTimeSlots(date: Date, timeSlot: TimeSlot, partySize: number): Observable<TimeSlotAvailability[]> {
    return this.checkDateAvailability(date).pipe(
      map(dateAvailability => {
        if (!dateAvailability) return [];
        
        return dateAvailability.timeSlots
          .filter(slot => 
            slot.available && 
            slot.remainingCapacity >= partySize &&
            slot.timeSlot !== timeSlot
          )
          .sort((a, b) => {
            // Sort by closest time to requested slot
            const requestedTime = parseInt(timeSlot.replace(':', ''));
            const timeA = parseInt(a.timeSlot.replace(':', ''));
            const timeB = parseInt(b.timeSlot.replace(':', ''));
            return Math.abs(timeA - requestedTime) - Math.abs(timeB - requestedTime);
          })
          .slice(0, 3); // Return top 3 alternatives
      })
    );
  }

  /**
   * Create a new reservation
   * @param formData - The reservation form data
   * @returns Observable of ReservationConfirmation
   */
  createReservation(formData: ReservationFormData): Observable<ReservationConfirmation> {
    return this.checkTimeSlotAvailability(formData.date!, formData.timeSlot!).pipe(
      map(availability => {
        if (!availability || !availability.available || availability.remainingCapacity < formData.partySize) {
          throw new Error('Selected time slot is no longer available');
        }
        
        // Create reservation confirmation
        const reservation: ReservationConfirmation = {
          reservationId: this.generateReservationId(),
          customerName: formData.customerName,
          date: formData.date!,
          timeSlot: formData.timeSlot!,
          partySize: formData.partySize,
          region: formData.region!,
          email: formData.email,
          phone: formData.phone,
          hasChildren: formData.hasChildren,
          smokingRequested: formData.smokingRequested,
          confirmationCode: this.generateConfirmationCode(),
          createdAt: new Date()
        };
        
        // Add to reservations list
        this.reservations.push(reservation);
        
        // Update availability
        this.updateAvailability(formData.date!, formData.timeSlot!, formData.partySize);
        
        return reservation;
      })
    );
  }

  /**
   * Update availability after a reservation is made
   * @param date - The reservation date
   * @param timeSlot - The reservation time slot
   * @param partySize - The party size
   */
  private updateAvailability(date: Date, timeSlot: TimeSlot, partySize: number): void {
    const dateAvailability = this.mockAvailability.find(d => d.date.toDateString() === date.toDateString());
    if (dateAvailability) {
      const timeSlotAvailability = dateAvailability.timeSlots.find(slot => slot.timeSlot === timeSlot);
      if (timeSlotAvailability) {
        timeSlotAvailability.remainingCapacity = Math.max(0, timeSlotAvailability.remainingCapacity - partySize);
        timeSlotAvailability.available = timeSlotAvailability.remainingCapacity > 0;
        
        // Update fully booked status
        dateAvailability.isFullyBooked = dateAvailability.timeSlots.every(slot => !slot.available);
        
        // Emit updated availability
        this.availabilitySubject.next([...this.mockAvailability]);
      }
    }
  }

  /**
   * Generate a unique reservation ID
   * @returns Unique reservation ID string
   */
  private generateReservationId(): string {
    return 'RES-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9).toUpperCase();
  }

  /**
   * Generate a confirmation code
   * @returns 6-digit confirmation code
   */
  private generateConfirmationCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * Get all reservations (for admin purposes)
   * @returns Observable of all reservations
   */
  getAllReservations(): Observable<ReservationConfirmation[]> {
    return of([...this.reservations]);
  }

  /**
   * Get reservation by ID
   * @param reservationId - The reservation ID to find
   * @returns Observable of ReservationConfirmation | null
   */
  getReservationById(reservationId: string): Observable<ReservationConfirmation | null> {
    const reservation = this.reservations.find(r => r.reservationId === reservationId);
    return of(reservation || null);
  }

  /**
   * Cancel a reservation
   * @param reservationId - The reservation ID to cancel
   * @returns Observable of boolean indicating success
   */
  cancelReservation(reservationId: string): Observable<boolean> {
    const reservationIndex = this.reservations.findIndex(r => r.reservationId === reservationId);
    if (reservationIndex === -1) {
      return of(false);
    }
    
    const reservation = this.reservations[reservationIndex];
    this.reservations.splice(reservationIndex, 1);
    
    // Restore availability
    this.restoreAvailability(reservation.date, reservation.timeSlot, reservation.partySize);
    
    return of(true);
  }

  /**
   * Restore availability when a reservation is cancelled
   * @param date - The reservation date
   * @param timeSlot - The reservation time slot
   * @param partySize - The party size
   */
  private restoreAvailability(date: Date, timeSlot: TimeSlot, partySize: number): void {
    const dateAvailability = this.mockAvailability.find(d => d.date.toDateString() === date.toDateString());
    if (dateAvailability) {
      const timeSlotAvailability = dateAvailability.timeSlots.find(slot => slot.timeSlot === timeSlot);
      if (timeSlotAvailability) {
        timeSlotAvailability.remainingCapacity = Math.min(
          timeSlotAvailability.maxCapacity,
          timeSlotAvailability.remainingCapacity + partySize
        );
        timeSlotAvailability.available = timeSlotAvailability.remainingCapacity > 0;
        
        // Update fully booked status
        dateAvailability.isFullyBooked = dateAvailability.timeSlots.every(slot => !slot.available);
        
        // Emit updated availability
        this.availabilitySubject.next([...this.mockAvailability]);
      }
    }
  }
} 
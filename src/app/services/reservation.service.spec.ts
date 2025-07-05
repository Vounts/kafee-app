/**
 * Reservation Service Unit Tests
 * 
 * This file contains comprehensive unit tests for the ReservationService,
 * covering availability checking, reservation creation, and real-time updates.
 */
import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ReservationService } from './reservation.service';
import { 
  ReservationFormData, 
  TimeSlot, 
  Region, 
  ReservationConfirmation,
  TimeSlotAvailability,
  DateAvailability
} from '../models/reservation.model';

describe('ReservationService', () => {
  let service: ReservationService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ReservationService]
    });
    service = TestBed.inject(ReservationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('checkDateAvailability', () => {
    it('should return DateAvailability for valid date', (done) => {
      const testDate = new Date('2024-07-24');
      
      service.checkDateAvailability(testDate).subscribe({
        next: (availability) => {
          if (availability) {
            if (availability.date == null && testDate == null) {
              expect(availability.date).toBeNull();
              expect(testDate).toBeNull();
            } else if (availability.date != null && testDate != null) {
              expect(new Date(availability.date).toISOString()).toEqual(new Date(testDate).toISOString());
            }
            expect(availability.timeSlots).toBeDefined();
            expect(Array.isArray(availability.timeSlots)).toBe(true);
          } else {
            expect(availability).toBeNull();
          }
          done();
        },
        error: done
      });
    });

    it('should return null for invalid date', (done) => {
      const invalidDate = new Date('2024-08-01'); // Outside available range
      
      service.checkDateAvailability(invalidDate).subscribe({
        next: (availability) => {
          expect(availability).toBeNull();
          done();
        },
        error: done
      });
    });
  });

  describe('checkTimeSlotAvailability', () => {
    it('should return TimeSlotAvailability for valid date and time slot', (done) => {
      const testDate = new Date('2024-07-24');
      const testTimeSlot = TimeSlot.SIX_PM;
      
      service.checkTimeSlotAvailability(testDate, testTimeSlot).subscribe({
        next: (availability) => {
          expect(availability).toBeTruthy();
          if (availability?.timeSlot != null && testTimeSlot != null) {
            expect(availability.timeSlot).toBe(testTimeSlot);
          } else {
            expect(availability?.timeSlot).toBe(testTimeSlot);
          }
          expect(availability?.available).toBeDefined();
          expect(availability?.remainingCapacity).toBeDefined();
          expect(availability?.maxCapacity).toBeDefined();
          done();
        },
        error: done
      });
    });

    it('should return null for invalid date', (done) => {
      const invalidDate = new Date('2024-08-01');
      const testTimeSlot = TimeSlot.SIX_PM;
      
      service.checkTimeSlotAvailability(invalidDate, testTimeSlot).subscribe({
        next: (availability) => {
          expect(availability).toBeNull();
          done();
        },
        error: done
      });
    });
  });

  describe('getAlternativeTimeSlots', () => {
    it('should return alternative time slots when requested slot is unavailable', (done) => {
      const testDate = new Date('2024-07-24');
      const testTimeSlot = TimeSlot.SIX_PM;
      const partySize = 4;
      
      service.getAlternativeTimeSlots(testDate, testTimeSlot, partySize).subscribe({
        next: (alternatives) => {
          expect(Array.isArray(alternatives)).toBe(true);
          alternatives.forEach(alternative => {
            expect(alternative.timeSlot).not.toBe(testTimeSlot);
            expect(alternative.available).toBe(true);
            expect(alternative.remainingCapacity).toBeGreaterThanOrEqual(partySize);
          });
          done();
        },
        error: done
      });
    });

    it('should return empty array when no alternatives available', (done) => {
      const testDate = new Date('2024-07-24');
      const testTimeSlot = TimeSlot.SIX_PM;
      const partySize = 1000; // Very large party size
      
      service.getAlternativeTimeSlots(testDate, testTimeSlot, partySize).subscribe({
        next: (alternatives) => {
          expect(alternatives).toEqual([]);
          done();
        },
        error: done
      });
    });
  });

  describe('createReservation', () => {
    it('should create reservation successfully', (done) => {
      const formData: ReservationFormData = {
        date: new Date('2024-07-24'),
        timeSlot: TimeSlot.SIX_PM,
        partySize: 4,
        region: Region.MAIN_DINING,
        customerName: 'John Smith',
        email: 'john@example.com',
        phone: '1234567890',
        hasChildren: false,
        smokingRequested: false
      };
      
      service.createReservation(formData).subscribe({
        next: (confirmation) => {
          expect(confirmation).toBeTruthy();
          expect(confirmation.reservationId).toBeDefined();
          expect(confirmation.confirmationCode).toBeDefined();
          expect(confirmation.customerName).toBe(formData.customerName);
          if (confirmation.date == null && formData.date == null) {
            expect(confirmation.date).toBeNull();
            expect(formData.date).toBeNull();
          } else if (confirmation.date != null && formData.date != null) {
            expect(new Date(confirmation.date).toISOString()).toEqual(new Date(formData.date).toISOString());
          }
          if (confirmation.timeSlot == null && formData.timeSlot == null) {
            expect(confirmation.timeSlot).toBeNull();
            expect(formData.timeSlot).toBeNull();
          } else if (confirmation.timeSlot != null && formData.timeSlot != null) {
            expect(confirmation.timeSlot).toBe(formData.timeSlot);
          }
          expect(confirmation.partySize).toBe(formData.partySize);
          if (confirmation.region == null && formData.region == null) {
            expect(confirmation.region).toBeNull();
            expect(formData.region).toBeNull();
          } else if (confirmation.region != null && formData.region != null) {
            expect(confirmation.region).toBe(formData.region);
          }
          expect(confirmation.email).toBe(formData.email);
          expect(confirmation.phone).toBe(formData.phone);
          expect(confirmation.hasChildren).toBe(formData.hasChildren);
          expect(confirmation.smokingRequested).toBe(formData.smokingRequested);
          expect(confirmation.createdAt).toBeDefined();
          done();
        },
        error: done
      });
    });

    it('should throw error when time slot is unavailable', (done) => {
      const formData: ReservationFormData = {
        date: new Date('2024-07-24'),
        timeSlot: TimeSlot.SIX_PM,
        partySize: 1000, // Very large party size to make slot unavailable
        region: Region.MAIN_DINING,
        customerName: 'John Smith',
        email: 'john@example.com',
        phone: '1234567890',
        hasChildren: false,
        smokingRequested: false
      };
      
      service.createReservation(formData).subscribe({
        next: () => {
          done.fail('Should have thrown an error');
        },
        error: (error) => {
          expect(error.message).toContain('no longer available');
          done();
        }
      });
    });
  });

  describe('getAllReservations', () => {
    it('should return all reservations', (done) => {
      service.getAllReservations().subscribe({
        next: (reservations) => {
          expect(Array.isArray(reservations)).toBe(true);
          done();
        },
        error: done
      });
    });
  });

  describe('getReservationById', () => {
    it('should return reservation when found', (done) => {
      // First create a reservation
      const formData: ReservationFormData = {
        date: new Date('2024-07-24'),
        timeSlot: TimeSlot.SIX_PM,
        partySize: 4,
        region: Region.MAIN_DINING,
        customerName: 'John Smith',
        email: 'john@example.com',
        phone: '1234567890',
        hasChildren: false,
        smokingRequested: false
      };
      
      service.createReservation(formData).subscribe({
        next: (confirmation) => {
          // Then try to get it by ID
          service.getReservationById(confirmation.reservationId).subscribe({
            next: (foundReservation) => {
              expect(foundReservation).toBeTruthy();
              expect(foundReservation?.reservationId).toBe(confirmation.reservationId);
              done();
            },
            error: done
          });
        },
        error: done
      });
    });

    it('should return null when reservation not found', (done) => {
      service.getReservationById('non-existent-id').subscribe({
        next: (reservation) => {
          expect(reservation).toBeNull();
          done();
        },
        error: done
      });
    });
  });

  describe('cancelReservation', () => {
    it('should cancel reservation successfully', (done) => {
      // First create a reservation
      const formData: ReservationFormData = {
        date: new Date('2024-07-24'),
        timeSlot: TimeSlot.SIX_PM,
        partySize: 4,
        region: Region.MAIN_DINING,
        customerName: 'John Smith',
        email: 'john@example.com',
        phone: '1234567890',
        hasChildren: false,
        smokingRequested: false
      };
      
      service.createReservation(formData).subscribe({
        next: (confirmation) => {
          // Then cancel it
          service.cancelReservation(confirmation.reservationId).subscribe({
            next: (success) => {
              expect(success).toBe(true);
              
              // Verify it's no longer in the list
              service.getReservationById(confirmation.reservationId).subscribe({
                next: (foundReservation) => {
                  expect(foundReservation).toBeNull();
                  done();
                },
                error: done
              });
            },
            error: done
          });
        },
        error: done
      });
    });

    it('should return false when reservation not found', (done) => {
      service.cancelReservation('non-existent-id').subscribe({
        next: (success) => {
          expect(success).toBe(false);
          done();
        },
        error: done
      });
    });
  });

  describe('availability$ observable', () => {
    it('should emit availability updates', fakeAsync(() => {
      let emissionCount = 0;
      
      service.availability$.subscribe({
        next: (availability) => {
          emissionCount++;
          expect(Array.isArray(availability)).toBe(true);
          expect(availability.length).toBeGreaterThan(0);
        }
      });
      
      // Wait for initial emission and some real-time updates
      tick(1000); // Initial emission
      tick(30000); // First real-time update
      
      expect(emissionCount).toBeGreaterThan(0);
    }));
  });

  describe('reservation ID generation', () => {
    it('should generate unique reservation IDs', (done) => {
      const formData: ReservationFormData = {
        date: new Date('2024-07-24'),
        timeSlot: TimeSlot.SIX_PM,
        partySize: 4,
        region: Region.MAIN_DINING,
        customerName: 'John Smith',
        email: 'john@example.com',
        phone: '1234567890',
        hasChildren: false,
        smokingRequested: false
      };
      
      const reservations: ReservationConfirmation[] = [];
      
      // Create multiple reservations
      const createReservation = (index: number) => {
        const data = { ...formData, customerName: `John Smith ${index}` };
        service.createReservation(data).subscribe({
          next: (confirmation) => {
            reservations.push(confirmation);
            if (reservations.length === 3) {
              // Check that all IDs are unique
              const ids = reservations.map(r => r.reservationId);
              const uniqueIds = new Set(ids);
              expect(uniqueIds.size).toBe(3);
              done();
            }
          },
          error: done
        });
      };
      
      createReservation(1);
      createReservation(2);
      createReservation(3);
    });
  });

  describe('confirmation code generation', () => {
    it('should generate 6-digit confirmation codes', (done) => {
      const formData: ReservationFormData = {
        date: new Date('2024-07-24'),
        timeSlot: TimeSlot.SIX_PM,
        partySize: 4,
        region: Region.MAIN_DINING,
        customerName: 'John Smith',
        email: 'john@example.com',
        phone: '1234567890',
        hasChildren: false,
        smokingRequested: false
      };
      
      service.createReservation(formData).subscribe({
        next: (confirmation) => {
          expect(confirmation.confirmationCode).toMatch(/^\d{6}$/);
          done();
        },
        error: done
      });
    });
  });

  describe('availability updates after reservation', () => {
    it('should update availability when reservation is created', (done) => {
      const testDate = new Date('2024-07-24');
      const testTimeSlot = TimeSlot.SIX_PM;
      const partySize = 4;
      
      // Get initial availability
      service.checkTimeSlotAvailability(testDate, testTimeSlot).subscribe({
        next: (initialAvailability) => {
          expect(initialAvailability).toBeTruthy();
          const initialCapacity = initialAvailability!.remainingCapacity;
          
          // Create reservation
          const formData: ReservationFormData = {
            date: testDate,
            timeSlot: testTimeSlot,
            partySize: partySize,
            region: Region.MAIN_DINING,
            customerName: 'John Smith',
            email: 'john@example.com',
            phone: '1234567890',
            hasChildren: false,
            smokingRequested: false
          };
          
          service.createReservation(formData).subscribe({
            next: () => {
              // Check updated availability
              service.checkTimeSlotAvailability(testDate, testTimeSlot).subscribe({
                next: (updatedAvailability) => {
                  expect(updatedAvailability).toBeTruthy();
                  expect(updatedAvailability!.remainingCapacity).toBe(initialCapacity - partySize);
                  done();
                },
                error: done
              });
            },
            error: done
          });
        },
        error: done
      });
    });
  });

  describe('edge cases', () => {
    it('should handle multiple reservations for same time slot', (done) => {
      const testDate = new Date('2024-07-24');
      const testTimeSlot = TimeSlot.SIX_PM;
      const partySize = 2;
      
      const formData: ReservationFormData = {
        date: testDate,
        timeSlot: testTimeSlot,
        partySize: partySize,
        region: Region.MAIN_DINING,
        customerName: 'John Smith',
        email: 'john@example.com',
        phone: '1234567890',
        hasChildren: false,
        smokingRequested: false
      };
      
      let completedReservations = 0;
      const totalReservations = 3;
      
      const createReservation = (index: number) => {
        const data = { ...formData, customerName: `John Smith ${index}` };
        service.createReservation(data).subscribe({
          next: () => {
            completedReservations++;
            if (completedReservations === totalReservations) {
              // Check final availability
              service.checkTimeSlotAvailability(testDate, testTimeSlot).subscribe({
                next: (availability) => {
                  expect(availability).toBeTruthy();
                  expect(availability!.remainingCapacity).toBeGreaterThanOrEqual(0);
                  done();
                },
                error: done
              });
            }
          },
          error: done
        });
      };
      
      createReservation(1);
      createReservation(2);
      createReservation(3);
    });
  });
}); 
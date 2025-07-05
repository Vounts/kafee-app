/**
 * Reservation System Models and Interfaces
 * 
 * This file contains all the data models, interfaces, and enums
 * used throughout the Kafè reservation system.
 */

// Enum for restaurant regions/seating areas
export enum Region {
  MAIN_DINING = 'main_dining',
  BAR_AREA = 'bar_area',
  OUTDOOR_PATIO = 'outdoor_patio',
  PRIVATE_ROOM = 'private_room'
}

// Enum for time slots (30-minute intervals from 6:00 PM to 10:00 PM)
export enum TimeSlot {
  SIX_PM = '18:00',
  SIX_THIRTY_PM = '18:30',
  SEVEN_PM = '19:00',
  SEVEN_THIRTY_PM = '19:30',
  EIGHT_PM = '20:00',
  EIGHT_THIRTY_PM = '20:30',
  NINE_PM = '21:00',
  NINE_THIRTY_PM = '21:30',
  TEN_PM = '22:00'
}

// Interface for reservation form data
export interface ReservationFormData {
  date: Date | null;
  timeSlot: TimeSlot | null;
  partySize: number;
  region: Region | null;
  customerName: string;
  email: string;
  phone: string;
  hasChildren: boolean;
  smokingRequested: boolean;
}

// Interface for reservation validation errors
export interface ReservationValidationErrors {
  date?: string;
  timeSlot?: string;
  partySize?: string;
  region?: string;
  customerName?: string;
  email?: string;
  phone?: string;
}

// Interface for time slot availability
export interface TimeSlotAvailability {
  timeSlot: TimeSlot;
  available: boolean;
  remainingCapacity: number;
  maxCapacity: number;
}

// Interface for date availability
export interface DateAvailability {
  date: Date;
  timeSlots: TimeSlotAvailability[];
  isFullyBooked: boolean;
}

// Interface for region information
export interface RegionInfo {
  id: Region;
  name: string;
  description: string;
  maxPartySize: number;
  hasSmoking: boolean;
  isOutdoor: boolean;
}

// Interface for reservation confirmation
export interface ReservationConfirmation {
  reservationId: string;
  customerName: string;
  date: Date;
  timeSlot: TimeSlot;
  partySize: number;
  region: Region;
  email: string;
  phone: string;
  hasChildren: boolean;
  smokingRequested: boolean;
  confirmationCode: string;
  createdAt: Date;
}

// Constants for validation rules
export const RESERVATION_CONSTRAINTS = {
  MIN_PARTY_SIZE: 1,
  MAX_PARTY_SIZE: 12,
  MIN_NAME_LENGTH: 2,
  MAX_NAME_LENGTH: 50,
  PHONE_REGEX: /^[\+]?[1-9][\d]{0,15}$/,
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  AVAILABLE_DATES: {
    START_DATE: new Date(2025, 6, 24), // Month is 0-indexed, so 6 = July
    END_DATE: new Date(2025, 6, 31)    // Month is 0-indexed, so 6 = July
  }
} as const;

// Helper function to get all time slots
export function getAllTimeSlots(): TimeSlot[] {
  return Object.values(TimeSlot);
}

// Helper function to get all regions
export function getAllRegions(): Region[] {
  return Object.values(Region);
}

// Helper function to format time slot for display
export function formatTimeSlot(timeSlot: TimeSlot): string {
  const timeMap: Record<TimeSlot, string> = {
    [TimeSlot.SIX_PM]: '6:00 PM',
    [TimeSlot.SIX_THIRTY_PM]: '6:30 PM',
    [TimeSlot.SEVEN_PM]: '7:00 PM',
    [TimeSlot.SEVEN_THIRTY_PM]: '7:30 PM',
    [TimeSlot.EIGHT_PM]: '8:00 PM',
    [TimeSlot.EIGHT_THIRTY_PM]: '8:30 PM',
    [TimeSlot.NINE_PM]: '9:00 PM',
    [TimeSlot.NINE_THIRTY_PM]: '9:30 PM',
    [TimeSlot.TEN_PM]: '10:00 PM'
  };
  return timeMap[timeSlot];
}

// Helper function to get region display name
export function getRegionDisplayName(region: Region): string {
  const regionMap: Record<Region, string> = {
    [Region.MAIN_DINING]: 'Main Dining Room',
    [Region.BAR_AREA]: 'Bar Area',
    [Region.OUTDOOR_PATIO]: 'Outdoor Patio',
    [Region.PRIVATE_ROOM]: 'Private Room'
  };
  return regionMap[region];
} 
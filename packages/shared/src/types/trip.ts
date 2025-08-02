/**
 * Trip Types
 * Shared TypeScript types for trip-related data structures
 */

import type { BaseUser, MediaFile } from './user';

export type TripStatus = 
  | 'planning'
  | 'confirmed'
  | 'in-progress'
  | 'completed'
  | 'cancelled';

export type TripType = 
  | 'business'
  | 'leisure'
  | 'mixed'
  | 'urgent'
  | 'group'
  | 'solo';

export interface Location {
  id?: string;
  name: string;
  country: string;
  city: string;
  address?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  timezone?: string;
  airport_code?: string;
}

export interface TripItinerary {
  id: string;
  day: number;
  date: string;
  activities: TripActivity[];
  notes?: string;
}

export interface TripActivity {
  id: string;
  title: string;
  description?: string;
  startTime: string;
  endTime?: string;
  location?: Location;
  type: 'flight' | 'accommodation' | 'meeting' | 'meal' | 'transport' | 'activity' | 'other';
  status: 'pending' | 'confirmed' | 'cancelled';
  cost?: number;
  currency?: string;
  bookingReference?: string;
  notes?: string;
  attachments?: MediaFile[];
}

export interface TripDestination {
  city: string;
  country: string;
  airport?: string;
}

export interface TripBudget {
  total?: number;
  currency: 'USD' | 'EUR' | 'GBP' | 'JPY';
}

export interface TripTraveler {
  name: string;
  dateOfBirth?: string;
  relationship: 'self' | 'spouse' | 'child' | 'parent' | 'sibling' | 'friend' | 'colleague' | 'other';
}

export interface TripItineraryDetails {
  flightDetails?: string;
  hotelDetails?: string;
  activityDetails?: string;
  diningDetails?: string;
  transportationDetails?: string;
}

export interface PayloadTripDocument {
  title: string;
  type: 'passport' | 'visa' | 'insurance' | 'boarding-pass' | 'hotel-confirmation' | 'other';
  file?: string; // relationship to media
  notes?: string;
}

export interface BaseTrip {
  id: string;
  title: string;
  description?: string;
  client: string; // relationship to clients
  startDate: string;
  endDate: string;
  status: TripStatus;
  destination: TripDestination;
  budget?: TripBudget;
  travelers?: TripTraveler[];
  itinerary?: TripItineraryDetails;
  documents?: PayloadTripDocument[];
  specialRequests?: string;
  internalNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TripPreferences {
  // Flight preferences
  preferredAirlines?: string[];
  seatPreference: 'aisle' | 'window' | 'no-preference';
  mealPreference: 'standard' | 'vegetarian' | 'vegan' | 'kosher' | 'halal' | 'diabetic' | 'gluten-free';
  
  // Hotel preferences
  roomType: 'single' | 'double' | 'suite' | 'connecting';
  floorPreference: 'low' | 'high' | 'no-preference';
  amenities?: string[]; // ['gym', 'pool', 'spa', 'business-center', 'wifi']
  
  // Transportation preferences
  groundTransportation: 'rental-car' | 'taxi' | 'ride-share' | 'public-transit' | 'private-car';
  
  // Special requirements
  accessibilityNeeds?: string[];
  dietaryRestrictions?: string[];
  medicalConsiderations?: string[];
  
  // Communication preferences
  preferredContactMethod: 'email' | 'sms' | 'phone' | 'app';
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
}

export interface TripDocument {
  id: string;
  tripId: string;
  title: string;
  description?: string;
  type: 'passport' | 'visa' | 'boarding-pass' | 'hotel-confirmation' | 'rental-agreement' | 'receipt' | 'other';
  file: MediaFile;
  expirationDate?: string;
  isRequired: boolean;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

// Utility types
export type TripCreationData = Omit<BaseTrip, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'lastModifiedBy'>;
export type TripUpdateData = Partial<Omit<BaseTrip, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>>;
export type TripSummary = Pick<BaseTrip, 'id' | 'title' | 'status' | 'startDate' | 'endDate' | 'destination' | 'client'>;

// Type guards and utilities
export const isActiveTripStatus = (status: TripStatus): boolean => 
  ['planning', 'confirmed', 'in-progress'].includes(status);

export const isCompletedTripStatus = (status: TripStatus): boolean => 
  ['completed', 'cancelled'].includes(status);

export const canEditTrip = (status: TripStatus): boolean => 
  ['draft', 'planning'].includes(status);

export const tripRequiresApproval = (status: TripStatus): boolean => 
  status === 'planning';

export const getTripDuration = (startDate: string, endDate: string): number => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
};

export const formatTripDateRange = (startDate: string, endDate: string): string => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const duration = getTripDuration(startDate, endDate);
  
  const options: Intl.DateTimeFormatOptions = { 
    month: 'short', 
    day: 'numeric',
    year: start.getFullYear() !== end.getFullYear() ? 'numeric' : undefined
  };
  
  return `${start.toLocaleDateString('en-US', options)} - ${end.toLocaleDateString('en-US', options)} (${duration} days)`;
};
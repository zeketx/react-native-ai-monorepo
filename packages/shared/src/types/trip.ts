/**
 * Trip Types
 * Shared TypeScript types for trip-related data structures
 */

import type { BaseUser, MediaFile } from './user';

export type TripStatus = 
  | 'draft'
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

export interface BaseTrip {
  id: string;
  title: string;
  description?: string;
  
  // Participants
  client: string | BaseUser; // User ID or populated user object
  organizer?: string | BaseUser;
  travelers?: string[] | BaseUser[];
  
  // Trip details
  type: TripType;
  status: TripStatus;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  
  // Dates and locations
  startDate: string;
  endDate: string;
  destinations: Location[];
  
  // Budget
  estimatedBudget?: number;
  actualBudget?: number;
  currency: string;
  
  // Travel preferences
  accommodationPreference?: 'budget' | 'mid-range' | 'luxury' | 'premium';
  transportationPreference?: 'economy' | 'business' | 'first-class';
  
  // Documentation
  itinerary?: TripItinerary[];
  documents?: MediaFile[];
  notes?: string;
  
  // Metadata
  createdAt: string;
  updatedAt: string;
  createdBy: string | BaseUser;
  lastModifiedBy?: string | BaseUser;
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
export type TripSummary = Pick<BaseTrip, 'id' | 'title' | 'status' | 'startDate' | 'endDate' | 'destinations' | 'client'>;

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
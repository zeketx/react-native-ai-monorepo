/**
 * Client Types
 * Shared TypeScript types for client-specific data structures
 */

import type { BaseUser, UserPreferences } from './user';
import type { BaseTrip, TripPreferences } from './trip';

export type ClientTier = 'standard' | 'premium' | 'platinum';
export type ClientStatus = 'active' | 'inactive' | 'pending';

export interface EmergencyContact {
  name?: string;
  phone?: string;
  relationship?: string;
}

export interface ClientProfile {
  id: string;
  user: string; // Reference to User (relationship)
  name: string;
  email: string;
  phone?: string;
  dateOfBirth?: string;
  emergencyContact?: EmergencyContact;
  tier: ClientTier;
  status: ClientStatus;
  preferences?: ClientPreferences;
  notes?: string; // Internal notes
  
  createdAt: string;
  updatedAt: string;
}

export interface ClientPreferences {
  flightPreferences?: string; // relationship to flight-preferences
  hotelPreferences?: string; // relationship to hotel-preferences
  activityPreferences?: string; // relationship to activity-preferences
  diningPreferences?: string; // relationship to dining-preferences
}

export interface Address {
  street1: string;
  street2?: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
  type?: 'home' | 'business' | 'billing' | 'shipping';
}

export interface PaymentMethod {
  id: string;
  type: 'credit-card' | 'debit-card' | 'bank-account' | 'corporate-account';
  provider: string; // 'visa', 'mastercard', 'amex', etc.
  lastFourDigits: string;
  expirationDate?: string;
  isDefault: boolean;
  isVerified: boolean;
  billingAddress?: Address;
  createdAt: string;
}

export interface ClientContract {
  id: string;
  clientId: string;
  
  // Contract details
  title: string;
  description?: string;
  type: 'standard' | 'corporate' | 'enterprise' | 'custom';
  
  // Terms
  startDate: string;
  endDate?: string;
  autoRenewal: boolean;
  paymentTerms: 'monthly' | 'quarterly' | 'annually' | 'per-trip';
  
  // Services included
  servicesIncluded: string[];
  tripLimit?: number; // trips per period
  travelerLimit?: number; // max travelers per trip
  
  // Pricing
  baseRate?: number;
  currency: string;
  discountRate?: number;
  
  // Status
  status: 'draft' | 'pending' | 'active' | 'expired' | 'terminated';
  
  // Metadata
  createdAt: string;
  updatedAt: string;
  signedAt?: string;
  signedBy?: string; // User ID
}

export interface ClientActivityLog {
  id: string;
  clientId: string;
  
  // Activity details
  type: 'login' | 'trip-created' | 'trip-updated' | 'profile-updated' | 'payment' | 'support-ticket';
  description: string;
  
  // Context
  tripId?: string;
  userId?: string;
  metadata?: Record<string, any>;
  
  // Location/device info
  ipAddress?: string;
  userAgent?: string;
  location?: string;
  
  // Timestamp
  createdAt: string;
}

export interface ClientMetrics {
  clientId: string;
  period: 'monthly' | 'quarterly' | 'yearly';
  startDate: string;
  endDate: string;
  
  // Trip metrics
  totalTrips: number;
  completedTrips: number;
  cancelledTrips: number;
  averageTripDuration: number;
  
  // Financial metrics
  totalSpent: number;
  averageTripCost: number;
  outstandingBalance?: number;
  
  // Engagement metrics
  loginCount: number;
  lastLoginAt?: string;
  supportTickets: number;
  
  // Satisfaction metrics
  averageRating?: number;
  npsScore?: number;
  
  // Generated at
  generatedAt: string;
}

// Extended client data combining user and client information
export interface FullClientProfile extends BaseUser {
  clientProfile?: ClientProfile;
  activeContract?: ClientContract;
  travelPreferences?: TravelPreferences;
  recentTrips?: BaseTrip[];
  metrics?: ClientMetrics;
}

export interface TravelPreferences extends TripPreferences {
  // Additional client-specific preferences
  budgetRange: {
    min?: number;
    max?: number;
    currency: string;
  };
  advanceBookingDays: number;
  flexibleDates: boolean;
  corporateDiscountsEnabled: boolean;
  expenseReportingRequired: boolean;
  approvalRequired: boolean;
  approvers?: string[]; // User IDs of people who can approve trips
}

// Utility types
export type ClientCreationData = Omit<ClientProfile, 'id' | 'createdAt' | 'updatedAt' | 'lastActivityAt'>;
export type ClientUpdateData = Partial<Omit<ClientProfile, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>;
export type ClientSummary = Pick<ClientProfile, 'id' | 'name' | 'tier' | 'status'>;

// Type guards and utilities
export const isPremiumClient = (client: ClientProfile): boolean => 
  client.tier === 'premium' || client.tier === 'platinum';

export const isActiveClient = (client: ClientProfile): boolean => 
  client.status === 'active';

export const canCreateTrips = (client: ClientProfile): boolean => 
  client.status === 'active';

export const clientRequiresApproval = (client: ClientProfile): boolean => 
  client.tier === 'platinum' || client.status === 'pending';

export const getClientTierDisplayName = (tier: ClientTier): string => {
  const displayNames: Record<ClientTier, string> = {
    'standard': 'Standard',
    'premium': 'Premium',
    'platinum': 'Platinum'
  };
  return displayNames[tier];
};

export const getClientStatusDisplayName = (status: ClientStatus): string => {
  const displayNames: Record<ClientStatus, string> = {
    'active': 'Active',
    'inactive': 'Inactive',
    'pending': 'Pending'
  };
  return displayNames[status];
};
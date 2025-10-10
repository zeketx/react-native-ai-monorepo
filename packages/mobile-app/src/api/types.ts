/**
 * API Types for Payload CMS Integration
 *
 * This file contains all TypeScript type definitions for API requests and responses.
 * These types will be replaced with shared types when CS-SHARED-002 is completed.
 */

import type { AuthUser } from '../auth/index.js';

// Base API Response Types
export interface APIResponse<T = any> {
  data?: T;
  error?: string;
  errors?: Array<{
    field: string;
    message: string;
  }>;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T = any> {
  docs: Array<T>;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  limit: number;
  nextPage: number | null;
  page: number;
  prevPage: number | null;
  totalDocs: number;
  totalPages: number;
}

// User Related Types
export interface User extends AuthUser {
  address?: Address;
  bio?: string;
  createdAt: string;
  dateOfBirth?: string;
  phoneNumber?: string;
  preferences?: UserPreferences;
  profileImage?: Media;
  trips?: Array<Trip>;
  updatedAt: string;
}

export interface UserPreferences {
  currency?: string;
  dateFormat?: string;
  language: string;
  location: boolean;
  notifications: NotificationPreferences;
  theme: 'light' | 'dark';
  timezone?: string;
}

export interface NotificationPreferences {
  email: boolean;
  promotions: boolean;
  push: boolean;
  reminders: boolean;
  sms: boolean;
  tripUpdates: boolean;
}

export interface Address {
  city: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  country: string;
  state: string;
  street: string;
  zipCode: string;
}

// Trip Related Types
export interface Trip {
  budget?: TripBudget;
  createdAt: string;
  description?: string;
  destination: Destination;
  documents?: Array<Media>;
  endDate: string;
  id: string;
  isPublic: boolean;
  itinerary?: Array<ItineraryItem>;
  notes?: string;
  participants?: Array<TripParticipant>;
  startDate: string;
  status: TripStatus;
  tags?: Array<string>;
  title: string;
  updatedAt: string;
  user: string | User;
}

export type TripStatus =
  | 'planning'
  | 'booked'
  | 'active'
  | 'completed'
  | 'cancelled';

export interface Destination {
  city: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  country: string;
  description?: string;
  image?: Media;
  name: string;
  region?: string;
  timezone?: string;
}

export interface ItineraryItem {
  attachments?: Array<Media>;
  confirmationNumber?: string;
  cost?: {
    amount: number;
    currency: string;
  };
  description?: string;
  endDate?: string;
  id: string;
  location?: {
    address: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
    name: string;
  };
  notes?: string;
  startDate: string;
  status: 'planned' | 'booked' | 'confirmed' | 'cancelled';
  title: string;
  type: 'flight' | 'hotel' | 'activity' | 'restaurant' | 'transport' | 'other';
}

export interface TripParticipant {
  id: string;
  joinedAt?: string;
  permissions: {
    canDelete: boolean;
    canEdit: boolean;
    canInvite: boolean;
  };
  role: 'organizer' | 'participant';
  status: 'invited' | 'accepted' | 'declined';
  user: string | User;
}

export interface TripBudget {
  categories: Array<BudgetCategory>;
  currency: string;
  remaining: number;
  spent: number;
  total: number;
}

export interface BudgetCategory {
  budgeted: number;
  color?: string;
  name: string;
  spent: number;
}

// Media Related Types
export interface Media {
  alt?: string;
  caption?: string;
  createdAt: string;
  filename: string;
  filesize: number;
  height?: number;
  id: string;
  mimeType: string;
  originalName: string;
  thumbnailUrl?: string;
  updatedAt: string;
  uploadedBy?: string | User;
  url: string;
  width?: number;
}

export interface MediaUploadResponse {
  filename: string;
  id: string;
  thumbnailUrl?: string;
  url: string;
}

// Request/Response DTOs
export interface UpdateProfileDTO {
  address?: Address;
  bio?: string;
  dateOfBirth?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  profileImage?: string;
}

export interface UpdatePreferencesDTO {
  currency?: string;
  dateFormat?: string;
  language?: string;
  location?: boolean;
  notifications?: Partial<NotificationPreferences>;
  theme?: 'light' | 'dark';
  timezone?: string;
}

export interface CreateTripDTO {
  budget?: Omit<TripBudget, 'spent' | 'remaining'>;
  description?: string;
  destination: Omit<Destination, 'image'>;
  endDate: string;
  isPublic?: boolean;
  startDate: string;
  tags?: Array<string>;
  title: string;
}

export interface UpdateTripDTO {
  budget?: Partial<TripBudget>;
  description?: string;
  destination?: Partial<Destination>;
  endDate?: string;
  isPublic?: boolean;
  notes?: string;
  startDate?: string;
  status?: TripStatus;
  tags?: Array<string>;
  title?: string;
}

export interface CreateItineraryItemDTO {
  confirmationNumber?: string;
  cost?: ItineraryItem['cost'];
  description?: string;
  endDate?: string;
  location?: ItineraryItem['location'];
  notes?: string;
  startDate: string;
  title: string;
  tripId: string;
  type: ItineraryItem['type'];
}

export interface UpdateItineraryItemDTO {
  confirmationNumber?: string;
  cost?: ItineraryItem['cost'];
  description?: string;
  endDate?: string;
  location?: ItineraryItem['location'];
  notes?: string;
  startDate?: string;
  status?: ItineraryItem['status'];
  title?: string;
  type?: ItineraryItem['type'];
}

export interface InviteParticipantDTO {
  email: string;
  permissions: TripParticipant['permissions'];
  role: 'participant';
  tripId: string;
}

// Search and Filter Types
export interface SearchQuery {
  limit?: number;
  order?: 'asc' | 'desc';
  page?: number;
  q?: string;
  sort?: string;
}

export interface TripSearchQuery extends SearchQuery {
  destination?: string;
  endDate?: string;
  startDate?: string;
  status?: TripStatus;
  tags?: Array<string>;
  userId?: string;
}

export interface UserSearchQuery extends SearchQuery {
  role?: string;
  verified?: boolean;
}

// Notification Types
export interface Notification {
  actionUrl?: string;
  createdAt: string;
  data?: Record<string, any>;
  expiresAt?: string;
  id: string;
  message: string;
  read: boolean;
  recipient: string | User;
  title: string;
  type: 'trip_invite' | 'trip_update' | 'reminder' | 'system';
}

export interface CreateNotificationDTO {
  actionUrl?: string;
  data?: Record<string, any>;
  expiresAt?: string;
  message: string;
  recipient: string;
  title: string;
  type: Notification['type'];
}

// Analytics Types
export interface UserAnalytics {
  completedTrips: number;
  favoriteDestinations: Array<{
    count: number;
    name: string;
  }>;
  totalTrips: number;
  travelStatistics: {
    totalCities: number;
    totalCountries: number;
    totalDays: number;
  };
  upcomingTrips: number;
}

export interface TripAnalytics {
  averageRating?: number;
  budgetUtilization: number;
  completedItems: number;
  participantCount: number;
  totalItems: number;
}

// WebSocket Types
export interface WebSocketMessage {
  data: any;
  timestamp: string;
  tripId?: string;
  type: 'trip_update' | 'user_update' | 'notification' | 'sync';
  userId?: string;
}

// Sync Types
export interface SyncStatus {
  conflicts: number;
  lastSync: string;
  pendingDownloads: number;
  pendingUploads: number;
  status: 'synced' | 'syncing' | 'error' | 'offline';
}

export interface ConflictResolution {
  localData: any;
  remoteData: any;
  resolution: 'local' | 'remote' | 'merge';
  timestamp: string;
  type: 'user' | 'trip' | 'media';
}

/**
 * API Types for Payload CMS Integration
 *
 * This file contains all TypeScript type definitions for API requests and responses.
 * These types will be replaced with shared types when CS-SHARED-002 is completed.
 */

import type { AuthUser } from '../auth/index.js';

// Base API Response Types
export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  errors?: Array<{
    field: string;
    message: string;
  }>;
}

export interface PaginatedResponse<T = any> {
  docs: T[];
  totalDocs: number;
  limit: number;
  page: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  nextPage: number | null;
  prevPage: number | null;
}

// User Related Types
export interface User extends AuthUser {
  preferences?: UserPreferences;
  trips?: Trip[];
  createdAt: string;
  updatedAt: string;
  profileImage?: Media;
  bio?: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  address?: Address;
}

export interface UserPreferences {
  language: string;
  theme: 'light' | 'dark';
  notifications: NotificationPreferences;
  location: boolean;
  timezone?: string;
  dateFormat?: string;
  currency?: string;
}

export interface NotificationPreferences {
  push: boolean;
  email: boolean;
  sms: boolean;
  tripUpdates: boolean;
  promotions: boolean;
  reminders: boolean;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

// Trip Related Types
export interface Trip {
  id: string;
  title: string;
  description?: string;
  status: TripStatus;
  startDate: string;
  endDate: string;
  destination: Destination;
  itinerary?: ItineraryItem[];
  participants?: TripParticipant[];
  budget?: TripBudget;
  documents?: Media[];
  notes?: string;
  tags?: string[];
  isPublic: boolean;
  createdAt: string;
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
  name: string;
  country: string;
  city: string;
  region?: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  timezone?: string;
  description?: string;
  image?: Media;
}

export interface ItineraryItem {
  id: string;
  title: string;
  description?: string;
  type: 'flight' | 'hotel' | 'activity' | 'restaurant' | 'transport' | 'other';
  startDate: string;
  endDate?: string;
  location?: {
    name: string;
    address: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  cost?: {
    amount: number;
    currency: string;
  };
  confirmationNumber?: string;
  notes?: string;
  attachments?: Media[];
  status: 'planned' | 'booked' | 'confirmed' | 'cancelled';
}

export interface TripParticipant {
  id: string;
  user: string | User;
  role: 'organizer' | 'participant';
  status: 'invited' | 'accepted' | 'declined';
  joinedAt?: string;
  permissions: {
    canEdit: boolean;
    canInvite: boolean;
    canDelete: boolean;
  };
}

export interface TripBudget {
  total: number;
  currency: string;
  categories: BudgetCategory[];
  spent: number;
  remaining: number;
}

export interface BudgetCategory {
  name: string;
  budgeted: number;
  spent: number;
  color?: string;
}

// Media Related Types
export interface Media {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  filesize: number;
  width?: number;
  height?: number;
  url: string;
  thumbnailUrl?: string;
  alt?: string;
  caption?: string;
  createdAt: string;
  updatedAt: string;
  uploadedBy?: string | User;
}

export interface MediaUploadResponse {
  id: string;
  filename: string;
  url: string;
  thumbnailUrl?: string;
}

// Request/Response DTOs
export interface UpdateProfileDTO {
  firstName?: string;
  lastName?: string;
  email?: string;
  bio?: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  address?: Address;
  profileImage?: string;
}

export interface UpdatePreferencesDTO {
  language?: string;
  theme?: 'light' | 'dark';
  notifications?: Partial<NotificationPreferences>;
  location?: boolean;
  timezone?: string;
  dateFormat?: string;
  currency?: string;
}

export interface CreateTripDTO {
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  destination: Omit<Destination, 'image'>;
  isPublic?: boolean;
  budget?: Omit<TripBudget, 'spent' | 'remaining'>;
  tags?: string[];
}

export interface UpdateTripDTO {
  title?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  destination?: Partial<Destination>;
  status?: TripStatus;
  isPublic?: boolean;
  budget?: Partial<TripBudget>;
  tags?: string[];
  notes?: string;
}

export interface CreateItineraryItemDTO {
  tripId: string;
  title: string;
  description?: string;
  type: ItineraryItem['type'];
  startDate: string;
  endDate?: string;
  location?: ItineraryItem['location'];
  cost?: ItineraryItem['cost'];
  confirmationNumber?: string;
  notes?: string;
}

export interface UpdateItineraryItemDTO {
  title?: string;
  description?: string;
  type?: ItineraryItem['type'];
  startDate?: string;
  endDate?: string;
  location?: ItineraryItem['location'];
  cost?: ItineraryItem['cost'];
  confirmationNumber?: string;
  notes?: string;
  status?: ItineraryItem['status'];
}

export interface InviteParticipantDTO {
  tripId: string;
  email: string;
  role: 'participant';
  permissions: TripParticipant['permissions'];
}

// Search and Filter Types
export interface SearchQuery {
  q?: string;
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface TripSearchQuery extends SearchQuery {
  status?: TripStatus;
  startDate?: string;
  endDate?: string;
  destination?: string;
  tags?: string[];
  userId?: string;
}

export interface UserSearchQuery extends SearchQuery {
  role?: string;
  verified?: boolean;
}

// Notification Types
export interface Notification {
  id: string;
  type: 'trip_invite' | 'trip_update' | 'reminder' | 'system';
  title: string;
  message: string;
  data?: Record<string, any>;
  read: boolean;
  createdAt: string;
  expiresAt?: string;
  actionUrl?: string;
  recipient: string | User;
}

export interface CreateNotificationDTO {
  type: Notification['type'];
  title: string;
  message: string;
  data?: Record<string, any>;
  recipient: string;
  expiresAt?: string;
  actionUrl?: string;
}

// Analytics Types
export interface UserAnalytics {
  totalTrips: number;
  completedTrips: number;
  upcomingTrips: number;
  favoriteDestinations: Array<{
    name: string;
    count: number;
  }>;
  travelStatistics: {
    totalDays: number;
    totalCountries: number;
    totalCities: number;
  };
}

export interface TripAnalytics {
  budgetUtilization: number;
  completedItems: number;
  totalItems: number;
  participantCount: number;
  averageRating?: number;
}

// WebSocket Types
export interface WebSocketMessage {
  type: 'trip_update' | 'user_update' | 'notification' | 'sync';
  data: any;
  timestamp: string;
  userId?: string;
  tripId?: string;
}

// Sync Types
export interface SyncStatus {
  lastSync: string;
  pendingUploads: number;
  pendingDownloads: number;
  conflicts: number;
  status: 'synced' | 'syncing' | 'error' | 'offline';
}

export interface ConflictResolution {
  type: 'user' | 'trip' | 'media';
  localData: any;
  remoteData: any;
  resolution: 'local' | 'remote' | 'merge';
  timestamp: string;
}

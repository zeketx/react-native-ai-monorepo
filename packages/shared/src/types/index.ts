/**
 * Types Index
 * Exports all shared TypeScript types
 */

// User-related types
export * from './user';

// Trip-related types  
export * from './trip';

// Client-related types
export * from './client';

// Preferences types
export * from './preferences';

// Common utility types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string | number;
    details?: Record<string, any>;
  };
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    timestamp?: string;
  };
}

export interface PaginatedResponse<T = any> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface SearchFilters {
  query?: string;
  dateRange?: {
    start: string;
    end: string;
  };
  status?: string[];
  tags?: string[];
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface AuditLog {
  id: string;
  entityType: string;
  entityId: string;
  action: 'create' | 'update' | 'delete' | 'view';
  userId: string;
  changes?: Record<string, { from: any; to: any }>;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  timestamp: string;
}

export interface SystemNotification {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  userId?: string; // If null, it's a system-wide notification
  read: boolean;
  actionable: boolean;
  actionUrl?: string;
  actionLabel?: string;
  expiresAt?: string;
  createdAt: string;
}

// Environment and configuration types
export interface AppConfig {
  app: {
    name: string;
    version: string;
    environment: 'development' | 'staging' | 'production';
    debugMode: boolean;
  };
  api: {
    baseUrl: string;
    timeout: number;
    retryAttempts: number;
  };
  auth: {
    tokenKey: string;
    refreshTokenKey: string;
    sessionTimeout: number;
  };
  features: {
    [key: string]: boolean;
  };
}

// Form and validation types
export interface ValidationError {
  field: string;
  message: string;
  code?: string;
}

export interface FormState<T = any> {
  data: T;
  errors: ValidationError[];
  isValid: boolean;
  isSubmitting: boolean;
  isDirty: boolean;
}

// File upload types
export interface FileUploadProgress {
  fileId: string;
  fileName: string;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  error?: string;
}

// Geolocation types
export interface GeolocationCoordinates {
  latitude: number;
  longitude: number;
  accuracy?: number;
  altitude?: number;
  altitudeAccuracy?: number;
  heading?: number;
  speed?: number;
}

// Time and date utilities
export type DateString = string; // ISO 8601 format
export type TimeString = string; // HH:MM format
export type DateTimeString = string; // ISO 8601 datetime format

// Generic ID types
export type EntityId = string;
export type UserId = EntityId;
export type TripId = EntityId;
export type ClientId = EntityId;
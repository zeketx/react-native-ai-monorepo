/**
 * API Constants
 * Shared constants for API endpoints, HTTP methods, and API configuration
 */

// Base API configuration
export const API_CONFIG = {
  BASE_URL: process.env.EXPO_PUBLIC_CMS_API_URL || 'http://localhost:3001/api',
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
} as const;

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
} as const;

// API Endpoints
export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    VERIFY_EMAIL: '/auth/verify-email',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    CHECK_ALLOWLIST: '/auth/check-allowlist',
  },
  
  // Users
  USERS: {
    BASE: '/users',
    ME: '/users/me',
    BY_ID: (id: string) => `/users/${id}`,
    PROFILE: '/users/me/profile',
    PREFERENCES: '/users/me/preferences',
    AVATAR: '/users/me/avatar',
    CHANGE_PASSWORD: '/users/me/change-password',
    DELETE_ACCOUNT: '/users/me/delete',
  },
  
  // Trips
  TRIPS: {
    BASE: '/trips',
    BY_ID: (id: string) => `/trips/${id}`,
    BY_CLIENT: (clientId: string) => `/trips/client/${clientId}`,
    SEARCH: '/trips/search',
    EXPORT: '/trips/export',
    DOCUMENTS: (tripId: string) => `/trips/${tripId}/documents`,
    ITINERARY: (tripId: string) => `/trips/${tripId}/itinerary`,
    ACTIVITIES: (tripId: string) => `/trips/${tripId}/activities`,
    APPROVE: (tripId: string) => `/trips/${tripId}/approve`,
    CANCEL: (tripId: string) => `/trips/${tripId}/cancel`,
    DUPLICATE: (tripId: string) => `/trips/${tripId}/duplicate`,
  },
  
  // Clients
  CLIENTS: {
    BASE: '/clients',
    BY_ID: (id: string) => `/clients/${id}`,
    PROFILE: (clientId: string) => `/clients/${clientId}/profile`,
    CONTRACTS: (clientId: string) => `/clients/${clientId}/contracts`,
    METRICS: (clientId: string) => `/clients/${clientId}/metrics`,
    ACTIVITY_LOG: (clientId: string) => `/clients/${clientId}/activity`,
    BILLING: (clientId: string) => `/clients/${clientId}/billing`,
    PAYMENT_METHODS: (clientId: string) => `/clients/${clientId}/payment-methods`,
  },
  
  // Preferences
  PREFERENCES: {
    BASE: '/preferences',
    TRAVEL: '/preferences/travel',
    NOTIFICATION: '/preferences/notification',
    PRIVACY: '/preferences/privacy',
    SECURITY: '/preferences/security',
    DISPLAY: '/preferences/display',
    LANGUAGE: '/preferences/language',
  },
  
  // Media/Files
  MEDIA: {
    BASE: '/media',
    UPLOAD: '/media/upload',
    BY_ID: (id: string) => `/media/${id}`,
    DELETE: (id: string) => `/media/${id}`,
    BULK_UPLOAD: '/media/bulk-upload',
    RESIZE: (id: string) => `/media/${id}/resize`,
  },
  
  // Notifications
  NOTIFICATIONS: {
    BASE: '/notifications',
    BY_ID: (id: string) => `/notifications/${id}`,
    MARK_READ: (id: string) => `/notifications/${id}/read`,
    MARK_ALL_READ: '/notifications/mark-all-read',
    SETTINGS: '/notifications/settings',
    SUBSCRIBE: '/notifications/subscribe',
    UNSUBSCRIBE: '/notifications/unsubscribe',
  },
  
  // Admin/System
  ADMIN: {
    DASHBOARD: '/admin/dashboard',
    USERS: '/admin/users',
    CLIENTS: '/admin/clients', 
    TRIPS: '/admin/trips',
    SYSTEM_CONFIG: '/admin/config',
    AUDIT_LOGS: '/admin/audit-logs',
    METRICS: '/admin/metrics',
    HEALTH_CHECK: '/admin/health',
  },
  
  // Search
  SEARCH: {
    GLOBAL: '/search',
    USERS: '/search/users',
    TRIPS: '/search/trips',
    CLIENTS: '/search/clients',
    SUGGESTIONS: '/search/suggestions',
  },
  
  // External integrations
  INTEGRATIONS: {
    CALENDAR: '/integrations/calendar',
    EXPENSE_REPORTING: '/integrations/expenses',
    TRAVEL_PROGRAMS: '/integrations/travel-programs',
    WEBHOOKS: '/integrations/webhooks',
  },
} as const;

// Request headers
export const REQUEST_HEADERS = {
  CONTENT_TYPE: 'Content-Type',
  AUTHORIZATION: 'Authorization',
  USER_AGENT: 'User-Agent',
  ACCEPT: 'Accept',
  CACHE_CONTROL: 'Cache-Control',
  IF_MATCH: 'If-Match',
  IF_NONE_MATCH: 'If-None-Match',
} as const;

// Content types
export const CONTENT_TYPES = {
  JSON: 'application/json',
  FORM_DATA: 'multipart/form-data',
  FORM_URLENCODED: 'application/x-www-form-urlencoded',
  TEXT: 'text/plain',
  HTML: 'text/html',
  XML: 'application/xml',
  PDF: 'application/pdf',
} as const;

// Cache control values
export const CACHE_CONTROL = {
  NO_CACHE: 'no-cache',
  NO_STORE: 'no-store',
  MUST_REVALIDATE: 'must-revalidate',
  PUBLIC: 'public',
  PRIVATE: 'private',
  MAX_AGE: (seconds: number) => `max-age=${seconds}`,
} as const;

// API Error Codes
export const API_ERROR_CODES = {
  // Authentication errors
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  TOKEN_INVALID: 'TOKEN_INVALID',
  ACCOUNT_LOCKED: 'ACCOUNT_LOCKED',
  EMAIL_NOT_VERIFIED: 'EMAIL_NOT_VERIFIED',
  PASSWORD_EXPIRED: 'PASSWORD_EXPIRED',
  
  // Authorization errors
  INSUFFICIENT_PERMISSIONS: 'INSUFFICIENT_PERMISSIONS',
  RESOURCE_ACCESS_DENIED: 'RESOURCE_ACCESS_DENIED',
  ROLE_REQUIRED: 'ROLE_REQUIRED',
  
  // Validation errors
  VALIDATION_FAILED: 'VALIDATION_FAILED',
  REQUIRED_FIELD_MISSING: 'REQUIRED_FIELD_MISSING',
  INVALID_FORMAT: 'INVALID_FORMAT',
  DUPLICATE_ENTRY: 'DUPLICATE_ENTRY',
  
  // Resource errors
  RESOURCE_NOT_FOUND: 'RESOURCE_NOT_FOUND',
  RESOURCE_CONFLICT: 'RESOURCE_CONFLICT',
  RESOURCE_EXPIRED: 'RESOURCE_EXPIRED',
  RESOURCE_LOCKED: 'RESOURCE_LOCKED',
  
  // Rate limiting
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  QUOTA_EXCEEDED: 'QUOTA_EXCEEDED',
  
  // System errors
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  DATABASE_ERROR: 'DATABASE_ERROR',
  EXTERNAL_SERVICE_ERROR: 'EXTERNAL_SERVICE_ERROR',
  
  // File upload errors
  FILE_TOO_LARGE: 'FILE_TOO_LARGE',
  INVALID_FILE_TYPE: 'INVALID_FILE_TYPE',
  UPLOAD_FAILED: 'UPLOAD_FAILED',
  STORAGE_FULL: 'STORAGE_FULL',
} as const;

// Rate limiting
export const RATE_LIMITS = {
  DEFAULT: {
    REQUESTS_PER_MINUTE: 60,
    REQUESTS_PER_HOUR: 1000,
  },
  AUTH: {
    LOGIN_ATTEMPTS_PER_HOUR: 10,
    PASSWORD_RESET_PER_DAY: 3,
  },
  UPLOAD: {
    FILES_PER_HOUR: 100,
    TOTAL_SIZE_MB_PER_HOUR: 500,
  },
} as const;

// Pagination defaults
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
  MIN_LIMIT: 1,
} as const;
/**
 * App Constants  
 * Shared constants for application configuration, UI, and business logic
 */

// Application information
export const APP_INFO = {
  NAME: 'ClientSync',
  DESCRIPTION: 'Professional Travel Management Platform',
  VERSION: '1.0.0',
  BUILD_NUMBER: '1',
  COMPANY: 'ClientSync Inc.',
  SUPPORT_EMAIL: 'support@clientsync.com',
  WEBSITE: 'https://clientsync.com',
} as const;

// Environment configuration
export const ENVIRONMENT = {
  DEVELOPMENT: 'development',
  STAGING: 'staging', 
  PRODUCTION: 'production',
} as const;

// User roles and permissions
export const USER_ROLES = {
  SUPER_ADMIN: 'super-admin',
  ADMIN: 'admin',
  ORGANIZER: 'organizer',
  PREMIUM_CLIENT: 'premium-client',
  CLIENT: 'client',
} as const;

export const ROLE_PERMISSIONS = {
  [USER_ROLES.SUPER_ADMIN]: [
    'system.manage',
    'users.manage',
    'clients.manage', 
    'trips.manage',
    'settings.manage',
    'audit.view',
    'analytics.view',
  ],
  [USER_ROLES.ADMIN]: [
    'users.manage',
    'clients.manage',
    'trips.manage',
    'analytics.view',
  ],
  [USER_ROLES.ORGANIZER]: [
    'clients.view',
    'trips.create',
    'trips.update',
    'trips.view',
    'preferences.manage',
  ],
  [USER_ROLES.PREMIUM_CLIENT]: [
    'trips.create',
    'trips.view',
    'profile.manage',
    'preferences.manage',
    'documents.manage',
  ],
  [USER_ROLES.CLIENT]: [
    'trips.view',
    'profile.manage',
    'preferences.manage',
  ],
} as const;

// Trip statuses and types
export const TRIP_STATUS = {
  DRAFT: 'draft',
  PLANNING: 'planning',
  CONFIRMED: 'confirmed',
  IN_PROGRESS: 'in-progress', 
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const;

export const TRIP_TYPES = {
  BUSINESS: 'business',
  LEISURE: 'leisure',
  MIXED: 'mixed',
  URGENT: 'urgent',
  GROUP: 'group',
  SOLO: 'solo',
} as const;

export const TRIP_PRIORITIES = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent',
} as const;

// Activity types
export const ACTIVITY_TYPES = {
  FLIGHT: 'flight',
  ACCOMMODATION: 'accommodation',
  MEETING: 'meeting',
  MEAL: 'meal',
  TRANSPORT: 'transport',
  ACTIVITY: 'activity',
  OTHER: 'other',
} as const;

// Client tiers and statuses
export const CLIENT_TIERS = {
  STANDARD: 'standard',
  PREMIUM: 'premium', 
  ENTERPRISE: 'enterprise',
} as const;

export const CLIENT_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  SUSPENDED: 'suspended',
  PENDING_APPROVAL: 'pending-approval',
} as const;

// Notification types and priorities
export const NOTIFICATION_TYPES = {
  INFO: 'info',
  WARNING: 'warning',
  ERROR: 'error',
  SUCCESS: 'success',
} as const;

export const NOTIFICATION_PRIORITIES = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent',
} as const;

// File and media constants
export const FILE_TYPES = {
  IMAGE: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  DOCUMENT: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  SPREADSHEET: ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
  ARCHIVE: ['application/zip', 'application/x-rar-compressed', 'application/x-7z-compressed'],
} as const;

export const FILE_SIZE_LIMITS = {
  AVATAR: 5 * 1024 * 1024, // 5MB
  DOCUMENT: 10 * 1024 * 1024, // 10MB
  IMAGE: 5 * 1024 * 1024, // 5MB
  BULK_UPLOAD: 50 * 1024 * 1024, // 50MB
} as const;

// Date and time formats
export const DATE_FORMATS = {
  SHORT: 'MM/DD/YYYY',
  LONG: 'MMMM Do, YYYY', 
  ISO: 'YYYY-MM-DD',
  DISPLAY: 'MMM DD, YYYY',
  COMPACT: 'M/D/YY',
} as const;

export const TIME_FORMATS = {
  '12H': 'h:mm A',
  '24H': 'HH:mm',
  FULL_12H: 'h:mm:ss A',
  FULL_24H: 'HH:mm:ss',
} as const;

// Currency codes (ISO 4217)
export const CURRENCIES = {
  USD: 'USD',
  EUR: 'EUR',
  GBP: 'GBP',
  JPY: 'JPY',
  CAD: 'CAD',
  AUD: 'AUD',
  CHF: 'CHF',
  CNY: 'CNY',
  INR: 'INR',
  KRW: 'KRW',
} as const;

// Language codes (ISO 639-1)
export const LANGUAGES = {
  ENGLISH: 'en',
  SPANISH: 'es',
  FRENCH: 'fr',
  GERMAN: 'de',
  ITALIAN: 'it',
  PORTUGUESE: 'pt',
  JAPANESE: 'ja',
  KOREAN: 'ko',
  CHINESE: 'zh',
  HINDI: 'hi',
} as const;

// Country codes (ISO 3166-1 alpha-2)
export const COUNTRIES = {
  US: 'US',
  CA: 'CA',
  GB: 'GB',
  FR: 'FR',
  DE: 'DE',
  IT: 'IT',
  ES: 'ES',
  JP: 'JP',
  KR: 'KR',
  CN: 'CN',
  IN: 'IN',
  AU: 'AU',
  BR: 'BR',
  MX: 'MX',
} as const;

// Time zones (commonly used)
export const TIMEZONES = {
  UTC: 'UTC',
  EST: 'America/New_York',
  CST: 'America/Chicago',
  MST: 'America/Denver',
  PST: 'America/Los_Angeles',
  GMT: 'Europe/London',
  CET: 'Europe/Paris',
  JST: 'Asia/Tokyo',
  AEST: 'Australia/Sydney',
  IST: 'Asia/Kolkata',
} as const;

// UI Constants
export const UI = {
  // Screen sizes (breakpoints)
  BREAKPOINTS: {
    XS: 320,
    SM: 640,
    MD: 768,
    LG: 1024,
    XL: 1280,
    XXL: 1536,
  },
  
  // Z-index layers
  Z_INDEX: {
    DROPDOWN: 1000,
    STICKY: 1020,
    MODAL_BACKDROP: 1040,
    MODAL: 1050,
    POPOVER: 1060,
    TOOLTIP: 1070,
    TOAST: 1080,
  },
  
  // Animation durations (ms)
  ANIMATION: {
    FAST: 150,
    MEDIUM: 300,
    SLOW: 500,
    LOADING: 1000,
  },
  
  // Theme colors
  COLORS: {
    PRIMARY: '#3B82F6',
    SECONDARY: '#64748B', 
    SUCCESS: '#10B981',
    WARNING: '#F59E0B',
    ERROR: '#EF4444',
    INFO: '#3B82F6',
  },
  
  // Spacing scale
  SPACING: {
    XS: 4,
    SM: 8,
    MD: 16,
    LG: 24,
    XL: 32,
    XXL: 48,
  },
} as const;

// Regular expressions for validation
export const REGEX = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE_US: /^\+?1?[-.\s]?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}$/,
  PHONE_INTERNATIONAL: /^\+[1-9]\d{1,14}$/,
  PASSWORD_STRONG: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  POSTAL_CODE_US: /^\d{5}(-\d{4})?$/,
  POSTAL_CODE_CA: /^[A-Z]\d[A-Z] \d[A-Z]\d$/,
  CREDIT_CARD: /^\d{13,19}$/,
  URL: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
} as const;

// Storage keys
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'clientsync_access_token',
  REFRESH_TOKEN: 'clientsync_refresh_token',
  USER_PREFERENCES: 'clientsync_user_preferences',
  THEME: 'clientsync_theme',
  LANGUAGE: 'clientsync_language',
  LAST_SYNC: 'clientsync_last_sync',
  OFFLINE_DATA: 'clientsync_offline_data',
  ONBOARDING_COMPLETED: 'clientsync_onboarding_completed',
} as const;

// External service limits
export const EXTERNAL_LIMITS = {
  GOOGLE_MAPS_REQUESTS_PER_DAY: 25000,
  STRIPE_WEBHOOK_TOLERANCE: 300, // seconds
  SENDGRID_REQUESTS_PER_MONTH: 100000,
  TWILIO_SMS_PER_MONTH: 200,
} as const;
// ClientSync Travel Platform - Shared Constants and Configuration

import { ClientTier, ActivityType, DietaryRestriction } from './types.js'

// ================================
// Tier-Based Options
// ================================

export const FLIGHT_CLASSES_BY_TIER = {
  [ClientTier.STANDARD]: ['economy'],
  [ClientTier.PREMIUM]: ['economy', 'premium_economy', 'business'],
  [ClientTier.ELITE]: ['business', 'first']
} as const

export const HOTEL_CATEGORIES_BY_TIER = {
  [ClientTier.STANDARD]: ['budget', 'mid_range'],
  [ClientTier.PREMIUM]: ['mid_range', 'luxury'],
  [ClientTier.ELITE]: ['luxury', 'ultra_luxury']
} as const

export const TRIP_DURATION_LIMITS_BY_TIER = {
  [ClientTier.STANDARD]: 7,
  [ClientTier.PREMIUM]: 14,
  [ClientTier.ELITE]: 30
} as const

// ================================
// API Routes
// ================================

export const API_ROUTES = {
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REGISTER: '/auth/register',
    VERIFY_EMAIL: '/auth/verify-email',
    RESET_PASSWORD: '/auth/reset-password',
    CHANGE_PASSWORD: '/auth/change-password'
  },
  CLIENTS: {
    LIST: '/clients',
    DETAIL: '/clients/:id',
    PROFILE: '/clients/:id/profile',
    PREFERENCES: '/clients/:id/preferences',
    TRIPS: '/clients/:id/trips'
  },
  TRIPS: {
    LIST: '/trips',
    CREATE: '/trips',
    DETAIL: '/trips/:id',
    UPDATE: '/trips/:id',
    DELETE: '/trips/:id',
    ITINERARY: '/trips/:id/itinerary',
    PARTICIPANTS: '/trips/:id/participants'
  },
  ORGANIZERS: {
    LIST: '/organizers',
    DETAIL: '/organizers/:id',
    PERMISSIONS: '/organizers/:id/permissions'
  },
  ALLOWLIST: {
    LIST: '/allowlist',
    ADD: '/allowlist',
    UPDATE: '/allowlist/:id',
    DELETE: '/allowlist/:id',
    INVITE: '/allowlist/:id/invite'
  },
  REPORTS: {
    OVERVIEW: '/reports/overview',
    TRIPS: '/reports/trips',
    CLIENTS: '/reports/clients',
    AUDIT_LOGS: '/reports/audit-logs'
  }
} as const

// ================================
// Validation Patterns
// ================================

export const VALIDATION = {
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE_REGEX: /^\+?[1-9]\d{1,14}$/,
  NAME_REGEX: /^[a-zA-Z\s'-]{2,50}$/,
  MIN_PASSWORD_LENGTH: 8,
  MAX_PASSWORD_LENGTH: 128,
  MIN_NAME_LENGTH: 2,
  MAX_NAME_LENGTH: 50,
  MAX_EMAIL_LENGTH: 255,
  MAX_PHONE_LENGTH: 20
} as const

// ================================
// Default Preference Values
// ================================

export const DEFAULT_PREFERENCES = {
  FLIGHT: {
    class: 'economy' as const,
    airlines: { preferred: [], avoided: [] },
    seat_preference: 'no_preference' as const
  },
  HOTEL: {
    category: 'mid_range' as const,
    room_type: 'standard' as const,
    bed_preference: 'no_preference' as const,
    floor_preference: 'no_preference' as const,
    amenities: []
  },
  ACTIVITIES: {
    types: [ActivityType.CULTURAL, ActivityType.RELAXATION],
    intensity: 'moderate' as const,
    interests: [],
    group_size_preference: 'no_preference' as const
  },
  DINING: {
    cuisines: [],
    dietary_restrictions: [],
    dining_style: 'mixed' as const
  }
} as const

// ================================
// Date/Time Formats
// ================================

export const DATE_FORMATS = {
  DISPLAY_DATE: 'MMM DD, YYYY',
  DISPLAY_DATETIME: 'MMM DD, YYYY HH:mm',
  API_DATE: 'YYYY-MM-DD',
  API_DATETIME: 'YYYY-MM-DDTHH:mm:ssZ',
  TIME_ONLY: 'HH:mm',
  DAY_MONTH: 'MMM DD',
  YEAR_MONTH: 'YYYY-MM'
} as const

// ================================
// Error Messages
// ================================

export const ERROR_MESSAGES = {
  GENERIC: 'An unexpected error occurred. Please try again.',
  NETWORK: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  NOT_FOUND: 'The requested resource was not found.',
  VALIDATION: {
    REQUIRED_FIELD: 'This field is required.',
    INVALID_EMAIL: 'Please enter a valid email address.',
    INVALID_PHONE: 'Please enter a valid phone number.',
    INVALID_NAME: 'Please enter a valid name (2-50 characters).',
    PASSWORD_TOO_SHORT: `Password must be at least ${VALIDATION.MIN_PASSWORD_LENGTH} characters.`,
    PASSWORD_TOO_LONG: `Password must not exceed ${VALIDATION.MAX_PASSWORD_LENGTH} characters.`,
    PASSWORDS_DONT_MATCH: 'Passwords do not match.',
    INVALID_DATE: 'Please enter a valid date.',
    DATE_IN_PAST: 'Date cannot be in the past.',
    END_BEFORE_START: 'End date must be after start date.'
  },
  TIER_RESTRICTION: 'This feature is not available for your tier.',
  TRIP_DURATION_EXCEEDED: 'Trip duration exceeds the limit for your tier.',
  ALLOWLIST_NOT_FOUND: 'Email not found in allowlist.',
  ALLOWLIST_ALREADY_REGISTERED: 'This email is already registered.'
} as const

// ================================
// Feature Flags
// ================================

export const FEATURE_FLAGS = {
  ALLOWLIST_ENABLED: true,
  TIER_RESTRICTIONS_ENABLED: true,
  AUDIT_LOGGING_ENABLED: true,
  TRIP_SHARING_ENABLED: false,
  ADVANCED_REPORTING_ENABLED: false,
  MULTI_LANGUAGE_ENABLED: false,
  PUSH_NOTIFICATIONS_ENABLED: false,
  OFFLINE_MODE_ENABLED: false
} as const

// ================================
// UI Constants
// ================================

export const UI_CONSTANTS = {
  DEBOUNCE_DELAY: 300,
  TOAST_DURATION: 3000,
  MODAL_ANIMATION_DURATION: 200,
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  SEARCH_MIN_LENGTH: 3,
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
  ACTIVITY_COLORS: {
    [ActivityType.ADVENTURE]: '#FF6B6B',
    [ActivityType.CULTURAL]: '#4ECDC4',
    [ActivityType.RELAXATION]: '#95E1D3',
    [ActivityType.ENTERTAINMENT]: '#FFA502',
    [ActivityType.SHOPPING]: '#FF6348',
    [ActivityType.NIGHTLIFE]: '#5F27CD',
    [ActivityType.NATURE]: '#00D2D3',
    [ActivityType.SPORTS]: '#54A0FF',
    [ActivityType.WELLNESS]: '#48DBFB',
    [ActivityType.EDUCATIONAL]: '#0ABDE3'
  }
} as const

// ================================
// Business Rules
// ================================

export const BUSINESS_RULES = {
  MAX_TRIP_PARTICIPANTS: 10,
  MIN_TRIP_DURATION_DAYS: 1,
  MAX_TRIP_DURATION_DAYS: 365,
  ADVANCE_BOOKING_DAYS: 14,
  CANCELLATION_WINDOW_HOURS: 48,
  ALLOWLIST_EXPIRY_DAYS: 30,
  SESSION_TIMEOUT_MINUTES: 30,
  MAX_LOGIN_ATTEMPTS: 5,
  LOGIN_LOCKOUT_MINUTES: 15,
  PASSWORD_RESET_EXPIRY_HOURS: 24,
  EMAIL_VERIFICATION_EXPIRY_DAYS: 7
} as const

// ================================
// Currency & Localization
// ================================

export const SUPPORTED_CURRENCIES = ['USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD'] as const

export const DEFAULT_CURRENCY = 'USD'

export const SUPPORTED_LOCALES = ['en-US', 'es-ES', 'fr-FR', 'de-DE', 'ja-JP'] as const

export const DEFAULT_LOCALE = 'en-US'

// ================================
// External Service URLs
// ================================

export const EXTERNAL_SERVICES = {
  MAPS_API: 'https://maps.googleapis.com/maps/api',
  WEATHER_API: 'https://api.openweathermap.org/data/2.5',
  CURRENCY_API: 'https://api.exchangerate-api.com/v4',
  ANALYTICS_API: 'https://www.google-analytics.com/collect'
} as const
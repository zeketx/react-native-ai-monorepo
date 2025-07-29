// Authentication module (already implemented)
export * from './auth/index';

// API Client module
export * from './api/payload-client';

// Services module
export * from './services/index';

// Types module - specific exports to avoid conflicts
export type {
  // User types
  BaseUser,
  PayloadUser,
  SupabaseUser,
  UserProfile,
  UserPreferences,
  MediaFile,
  UserWithoutSensitive,
  UserCreationData,
  UserUpdateData,
  
  // Trip types
  TripStatus,
  TripType,
  Location,
  TripItinerary,
  TripActivity,
  BaseTrip,
  TripPreferences,
  TripDocument,
  TripCreationData,
  TripUpdateData,
  TripSummary,
  
  // Client types
  ClientTier,
  ClientStatus,
  ClientProfile,
  Address,
  PaymentMethod,
  ClientContract,
  ClientActivityLog,
  ClientMetrics,
  FullClientProfile,
  TravelPreferences,
  ClientCreationData,
  ClientUpdateData,
  ClientSummary,
  
  // Preference types
  NotificationPreferences,
  DisplayPreferences,
  PrivacyPreferences,
  SecurityPreferences,
  SecurityQuestion,
  LanguagePreferences,
  TravelPreferencesDetailed,
  AppPreferences,
  UserAllPreferences,
  
  // Common types
  ApiResponse,
  PaginatedResponse,
  SearchFilters,
  AuditLog,
  SystemNotification,
  AppConfig,
  ValidationError,
  FormState,
  FileUploadProgress,
  GeolocationCoordinates,
  DateString,
  TimeString,
  DateTimeString,
  EntityId,
  UserId,
  TripId,
  ClientId,
} from './types/index';

// Type utility functions that don't conflict
export {
  // Trip utilities (renamed to avoid conflicts)
  isActiveTripStatus,
  isCompletedTripStatus,
  canEditTrip,
  getTripDuration,
  formatTripDateRange,
  tripRequiresApproval,
  
  // Client utilities (renamed to avoid conflicts) 
  isActiveClient,
  canCreateTrips,
  clientRequiresApproval,
  getClientTierDisplayName,
  getClientStatusDisplayName,
  
  // Default preferences
  DEFAULT_NOTIFICATION_PREFERENCES,
  DEFAULT_DISPLAY_PREFERENCES,
  DEFAULT_PRIVACY_PREFERENCES,
} from './types/index';

// Constants module  
export * from './constants/index';

// Utils module - specific exports to avoid conflicts
export {
  // Validation utilities (excluding conflicting ones)
  validateEmailWithMessage,
  validatePasswordWithMessage,
  validatePhone,
  validatePhoneWithMessage,
  validateName,
  validateDate,
  validateDateRange,
  validateUrl,
  validateFile,
  validateRequired,
  validateLength,
  validateNumber,
  validateCreditCard,
  validateForm,
  
  // Formatting utilities
  formatDate,
  formatTime,
  formatDateTime,
  formatRelativeTime,
  formatDuration,
  formatCurrency,
  formatNumber,
  formatPercentage,
  formatPhoneNumber,
  formatName,
  formatInitials,
  truncateText,
  capitalizeFirst,
  capitalizeWords,
  slugify,
  formatAddress,
  formatFileSize,
  hexToRgb,
  rgbToHex,
  formatStatus,
  formatEnumValue,
  
  // General utilities
  debounce,
  throttle,
  deepClone,
  omit,
  pick,
  groupBy,
  unique,
  uniqueBy,
  sortBy,
  chunk,
  range,
  randomId,
  sleep,
  isEmptyObject,
  isValidUrl,
  parseUrlParams,
  buildUrl,
} from './utils/index';
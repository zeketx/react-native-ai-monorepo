/**
 * Preferences Types
 * Shared TypeScript types for user and system preferences
 */

export interface NotificationPreferences {
  // Email notifications
  emailEnabled: boolean;
  emailTripUpdates: boolean;
  emailDocumentReminders: boolean;
  emailMarketingUpdates: boolean;
  emailSystemNotifications: boolean;
  
  // SMS notifications  
  smsEnabled: boolean;
  smsTripAlerts: boolean;
  smsEmergencyOnly: boolean;
  
  // Push notifications
  pushEnabled: boolean;
  pushTripUpdates: boolean;
  pushDocumentReminders: boolean;
  pushSystemAlerts: boolean;
  
  // Timing preferences
  quietHoursStart?: string; // HH:MM format
  quietHoursEnd?: string;
  timeZone: string;
  
  // Frequency
  summaryFrequency: 'daily' | 'weekly' | 'monthly' | 'never';
  reminderLeadTime: number; // hours before event
}

export interface DisplayPreferences {
  // Theme
  theme: 'light' | 'dark' | 'system';
  colorScheme: 'blue' | 'green' | 'purple' | 'orange';
  
  // Typography
  fontSize: 'small' | 'medium' | 'large' | 'extra-large';
  fontFamily?: 'system' | 'sans-serif' | 'serif';
  
  // Layout
  compactMode: boolean;
  showAvatars: boolean;
  dateFormat: 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD';
  timeFormat: '12h' | '24h';
  
  // Accessibility
  highContrast: boolean;
  reduceMotion: boolean;
  screenReaderOptimized: boolean;
  keyboardNavigationEnabled: boolean;
}

export interface PrivacyPreferences {
  // Profile visibility
  profileVisibility: 'public' | 'contacts' | 'private';
  showEmail: boolean;
  showPhone: boolean;
  showLastSeen: boolean;
  
  // Location sharing
  locationSharingEnabled: boolean;
  shareLocationWithOrganizer: boolean;
  shareLocationInEmergency: boolean;
  
  // Data usage
  analyticsOptOut: boolean;
  crashReportingEnabled: boolean;
  performanceDataSharing: boolean;
  
  // Marketing and communications
  marketingOptIn: boolean;
  thirdPartyDataSharing: boolean;
  personalizedAdvertising: boolean;
}

export interface SecurityPreferences {
  // Authentication
  twoFactorEnabled: boolean;
  biometricLoginEnabled: boolean;
  sessionTimeout: number; // minutes
  
  // Login security
  loginNotifications: boolean;
  suspiciousActivityAlerts: boolean;
  passwordExpirationDays?: number;
  
  // Data protection
  automaticLogout: boolean;
  screenLockRequired: boolean;
  
  // Account recovery
  backupEmail?: string;
  backupPhone?: string;
  recoveryQuestions?: SecurityQuestion[];
}

export interface SecurityQuestion {
  id: string;
  question: string;
  answerHash: string; // Never store plain text answers
  createdAt: string;
}

export interface LanguagePreferences {
  primaryLanguage: string; // ISO 639-1 code (e.g., 'en', 'es', 'fr')
  secondaryLanguages?: string[];
  region: string; // ISO 3166-1 alpha-2 code (e.g., 'US', 'GB', 'CA')
  
  // Currency and formatting
  currency: string; // ISO 4217 code (e.g., 'USD', 'EUR', 'GBP')
  numberFormat: 'US' | 'EU' | 'UK' | 'custom';
  measurementUnit: 'metric' | 'imperial';
  
  // Translation preferences
  autoTranslate: boolean;
  translateFrom?: string[];
  translateTo: string;
}

export interface TravelPreferencesDetailed {
  // Flight preferences
  preferredAirlines: string[];
  avoidedAirlines: string[];
  seatPreference: 'aisle' | 'window' | 'no-preference';
  classPreference: 'economy' | 'premium-economy' | 'business' | 'first';
  
  // Meal and dietary
  mealPreference: 'standard' | 'vegetarian' | 'vegan' | 'kosher' | 'halal' | 'diabetic' | 'gluten-free' | 'low-sodium';
  dietaryRestrictions: string[];
  foodAllergies: string[];
  
  // Accommodation preferences
  roomType: 'single' | 'double' | 'suite' | 'connecting-rooms';
  bedType: 'single' | 'double' | 'queen' | 'king' | 'twin';
  floorPreference: 'low' | 'high' | 'no-preference';
  smokingRoom: boolean;
  
  // Hotel amenities (preferred)
  amenities: {
    wifi: boolean;
    gym: boolean;
    pool: boolean;
    spa: boolean;
    businessCenter: boolean;
    concierge: boolean;
    roomService: boolean;
    laundry: boolean;
    parking: boolean;
    petFriendly: boolean;
  };
  
  // Transportation
  groundTransportation: 'rental-car' | 'taxi' | 'ride-share' | 'public-transit' | 'private-car' | 'walk';
  carRentalPreferences?: {
    carType: 'economy' | 'compact' | 'mid-size' | 'full-size' | 'luxury' | 'suv';
    transmission: 'automatic' | 'manual' | 'no-preference';
    fuelType: 'gasoline' | 'diesel' | 'hybrid' | 'electric' | 'no-preference';
    insuranceLevel: 'basic' | 'comprehensive' | 'premium';
  };
  
  // Special requirements
  accessibilityNeeds: string[];
  medicalConditions: string[];
  medications: string[];
  
  // Travel style
  travelStyle: 'business-focused' | 'leisure-focused' | 'mixed' | 'adventure' | 'luxury' | 'budget';
  flexibilityLevel: 'rigid' | 'somewhat-flexible' | 'very-flexible';
  riskTolerance: 'conservative' | 'moderate' | 'adventurous';
}

export interface AppPreferences {
  // Feature toggles
  features: {
    darkMode: boolean;
    betaFeatures: boolean;
    advancedSearch: boolean;
    calendarIntegration: boolean;
    offlineMode: boolean;
  };
  
  // Default values
  defaults: {
    tripType: 'business' | 'leisure' | 'mixed';
    currency: string;
    bookingLeadTime: number; // days
    reminderSettings: {
      departure: number; // hours before
      documents: number; // days before
      checkin: number; // hours before
    };
  };
  
  // Integration preferences
  integrations: {
    calendar: 'none' | 'google' | 'outlook' | 'apple';
    expenseReporting: 'none' | 'expense' | 'concur' | 'custom';
    travelPrograms: string[]; // airline/hotel loyalty program IDs
  };
}

// Combined preferences interface
export interface UserAllPreferences {
  notifications: NotificationPreferences;
  display: DisplayPreferences;
  privacy: PrivacyPreferences;
  security: SecurityPreferences;
  language: LanguagePreferences;
  travel: TravelPreferencesDetailed;
  app: AppPreferences;
  
  // Metadata
  lastUpdated: string;
  version: string; // for preferences schema versioning
}

// Default preference values
export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  emailEnabled: true,
  emailTripUpdates: true,
  emailDocumentReminders: true,
  emailMarketingUpdates: false,
  emailSystemNotifications: true,
  smsEnabled: false,
  smsTripAlerts: true,
  smsEmergencyOnly: true,
  pushEnabled: true,
  pushTripUpdates: true,
  pushDocumentReminders: true,
  pushSystemAlerts: true,
  timeZone: 'America/New_York',
  summaryFrequency: 'weekly',
  reminderLeadTime: 24,
};

export const DEFAULT_DISPLAY_PREFERENCES: DisplayPreferences = {
  theme: 'system',
  colorScheme: 'blue',
  fontSize: 'medium',
  fontFamily: 'system',
  compactMode: false,
  showAvatars: true,
  dateFormat: 'MM/DD/YYYY',
  timeFormat: '12h',
  highContrast: false,
  reduceMotion: false,
  screenReaderOptimized: false,
  keyboardNavigationEnabled: false,
};

export const DEFAULT_PRIVACY_PREFERENCES: PrivacyPreferences = {
  profileVisibility: 'contacts',
  showEmail: false,
  showPhone: false,
  showLastSeen: true,
  locationSharingEnabled: false,
  shareLocationWithOrganizer: true,
  shareLocationInEmergency: true,
  analyticsOptOut: false,
  crashReportingEnabled: true,
  performanceDataSharing: true,
  marketingOptIn: false,
  thirdPartyDataSharing: false,
  personalizedAdvertising: false,
};
// ClientSync Travel Platform - Core TypeScript Types and Interfaces

// ================================
// Client Tier Definitions
// ================================

export enum ClientTier {
  STANDARD = 'standard',
  PREMIUM = 'premium',
  ELITE = 'elite'
}

export enum UserRole {
  CLIENT = 'client',
  ORGANIZER = 'organizer',
  ADMIN = 'admin'
}

// ================================
// User Types
// ================================

export interface Client {
  id: string
  email: string
  tier: ClientTier
  profile: ClientProfile
  preferences: ClientPreferences
  created_at: string
  updated_at: string
}

export interface ClientProfile {
  first_name: string
  last_name: string
  phone: string
  emergency_contact: {
    name: string
    phone: string
    relationship: string
  }
}

export interface ClientPreferences {
  flight: FlightPreferences
  hotel: HotelPreferences
  activities: ActivityPreferences
  dining: DiningPreferences
}

// ================================
// Preference Types
// ================================

export interface FlightPreferences {
  class: 'economy' | 'premium_economy' | 'business' | 'first'
  airlines: {
    preferred: string[]
    avoided: string[]
  }
  seat_preference: 'aisle' | 'window' | 'middle' | 'no_preference'
  meal_preference?: string
  special_requests?: string[]
}

export interface HotelPreferences {
  category: 'budget' | 'mid_range' | 'luxury' | 'ultra_luxury'
  room_type: 'standard' | 'suite' | 'premium' | 'presidential'
  bed_preference: 'single' | 'double' | 'king' | 'twin' | 'no_preference'
  floor_preference: 'low' | 'high' | 'no_preference'
  amenities: string[]
  special_requests?: string[]
}

export interface ActivityPreferences {
  types: ActivityType[]
  intensity: 'low' | 'moderate' | 'high' | 'extreme'
  interests: string[]
  accessibility_needs?: string[]
  group_size_preference: 'solo' | 'small_group' | 'large_group' | 'no_preference'
}

export interface DiningPreferences {
  cuisines: string[]
  dietary_restrictions: DietaryRestriction[]
  allergy_info?: string[]
  dining_style: 'casual' | 'fine_dining' | 'local_authentic' | 'mixed'
  special_requests?: string[]
}

// ================================
// Activity & Dining Enums
// ================================

export enum ActivityType {
  ADVENTURE = 'adventure',
  CULTURAL = 'cultural',
  RELAXATION = 'relaxation',
  ENTERTAINMENT = 'entertainment',
  SHOPPING = 'shopping',
  NIGHTLIFE = 'nightlife',
  NATURE = 'nature',
  SPORTS = 'sports',
  WELLNESS = 'wellness',
  EDUCATIONAL = 'educational'
}

export enum DietaryRestriction {
  VEGETARIAN = 'vegetarian',
  VEGAN = 'vegan',
  GLUTEN_FREE = 'gluten_free',
  DAIRY_FREE = 'dairy_free',
  KOSHER = 'kosher',
  HALAL = 'halal',
  KETO = 'keto',
  PALEO = 'paleo',
  LOW_SODIUM = 'low_sodium',
  DIABETIC = 'diabetic'
}

// ================================
// Trip Types
// ================================

export enum TripStatus {
  PLANNING = 'planning',
  CONFIRMED = 'confirmed',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export interface Trip {
  id: string
  client_id: string
  title: string
  description?: string
  destination: Destination
  start_date: string
  end_date: string
  status: TripStatus
  budget_range: BudgetRange
  itinerary: Itinerary
  participants: Participant[]
  created_at: string
  updated_at: string
}

export interface Destination {
  city: string
  country: string
  region?: string
  coordinates?: {
    latitude: number
    longitude: number
  }
  timezone: string
}

export interface BudgetRange {
  min: number
  max: number
  currency: string
  breakdown?: {
    flights?: number
    hotels?: number
    activities?: number
    dining?: number
    miscellaneous?: number
  }
}

export interface Participant {
  id: string
  name: string
  relationship: string
  age?: number
  special_needs?: string[]
}

// ================================
// Itinerary Types
// ================================

export interface Itinerary {
  id: string
  trip_id: string
  days: ItineraryDay[]
  notes?: string
  created_at: string
  updated_at: string
}

export interface ItineraryDay {
  date: string
  activities: ItineraryActivity[]
  flights?: Flight[]
  hotel?: Hotel
  meals?: Meal[]
  notes?: string
}

export interface ItineraryActivity {
  id: string
  name: string
  description?: string
  type: ActivityType
  start_time: string
  end_time: string
  location: Location
  cost?: number
  booking_reference?: string
  supplier?: string
  notes?: string
}

// ================================
// Travel Component Types
// ================================

export interface Flight {
  id: string
  airline: string
  flight_number: string
  departure: FlightSegment
  arrival: FlightSegment
  aircraft_type?: string
  class: string
  seat?: string
  meal?: string
  booking_reference: string
  cost?: number
  status: 'booked' | 'confirmed' | 'checked_in' | 'completed' | 'cancelled'
}

export interface FlightSegment {
  airport_code: string
  airport_name: string
  city: string
  terminal?: string
  gate?: string
  datetime: string
}

export interface Hotel {
  id: string
  name: string
  category: string
  location: Location
  check_in: string
  check_out: string
  room_type: string
  booking_reference: string
  cost?: number
  amenities: string[]
  contact: ContactInfo
  notes?: string
}

export interface Meal {
  id: string
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack'
  restaurant_name?: string
  cuisine_type?: string
  location?: Location
  time?: string
  cost?: number
  booking_reference?: string
  notes?: string
}

// ================================
// Common Types
// ================================

export interface Location {
  name: string
  address: string
  city: string
  country: string
  coordinates?: {
    latitude: number
    longitude: number
  }
  postal_code?: string
}

export interface ContactInfo {
  phone?: string
  email?: string
  website?: string
}

// ================================
// Organizer Types
// ================================

export interface Organizer {
  id: string
  email: string
  profile: OrganizerProfile
  permissions: OrganizerPermissions
  is_active: boolean
  created_at: string
  updated_at: string
  last_login?: string
}

export interface OrganizerProfile {
  first_name: string
  last_name: string
  phone?: string
  department?: string
  role: string
}

export interface OrganizerPermissions {
  can_manage_clients: boolean
  can_manage_trips: boolean
  can_manage_organizers: boolean
  can_view_reports: boolean
  can_manage_allowlist: boolean
  tier_access: ClientTier[]
}

// ================================
// Allowlist Types
// ================================

export interface AllowlistEntry {
  id: string
  email: string
  tier: ClientTier
  invited_by: string
  created_at: string
  invited_at?: string
  registered_at?: string
  status: 'pending' | 'invited' | 'registered' | 'expired'
  notes?: string
}

// ================================
// Audit & Logging Types
// ================================

export interface AuditLog {
  id: string
  entity_type: 'client' | 'trip' | 'organizer' | 'allowlist'
  entity_id: string
  action: AuditAction
  performed_by: string
  performed_by_type: 'client' | 'organizer' | 'system'
  details?: Record<string, any>
  ip_address?: string
  user_agent?: string
  created_at: string
}

export enum AuditAction {
  CREATED = 'created',
  UPDATED = 'updated',
  DELETED = 'deleted',
  VIEWED = 'viewed',
  LOGIN = 'login',
  LOGOUT = 'logout',
  PASSWORD_CHANGED = 'password_changed',
  TRIP_BOOKED = 'trip_booked',
  TRIP_CANCELLED = 'trip_cancelled',
  ALLOWLIST_INVITED = 'allowlist_invited',
  TIER_CHANGED = 'tier_changed'
}

// ================================
// API Response Types
// ================================

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
    details?: Record<string, any>
  }
  meta?: {
    page?: number
    limit?: number
    total?: number
    total_pages?: number
  }
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  meta: {
    page: number
    limit: number
    total: number
    total_pages: number
  }
}

// ================================
// Form & Validation Types
// ================================

export interface ValidationError {
  field: string
  message: string
  code: string
}

export interface FormState<T> {
  data: T
  errors: ValidationError[]
  isSubmitting: boolean
  isDirty: boolean
  isValid: boolean
}

// ================================
// Configuration Types
// ================================

export interface AppConfig {
  environment: 'development' | 'staging' | 'production'
  api: {
    base_url: string
    timeout: number
    retry_attempts: number
  }
  features: {
    allowlist_enabled: boolean
    tier_restrictions_enabled: boolean
    audit_logging_enabled: boolean
  }
  limits: {
    max_trip_duration_days: number
    max_participants_per_trip: number
    max_activities_per_day: number
  }
}
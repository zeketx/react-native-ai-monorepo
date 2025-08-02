/**
 * User Types
 * Shared TypeScript types for user-related data structures
 */

export type UserRole = 
  | 'super-admin' 
  | 'admin' 
  | 'organizer' 
  | 'premium-client' 
  | 'client';

export interface BaseUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: UserRole;
  profileImage?: string | MediaFile;
  bio?: string;
  preferences?: UserNotificationPreferences;
  mobileSettings?: MobileSettings;
  status?: UserStatus;
  createdAt: string;
  updatedAt: string;
  emailVerified?: boolean;
  lastLoginAt?: string;
}

export interface PayloadUser extends BaseUser {
  // Payload CMS specific fields
  loginAttempts?: number;
  lockUntil?: string;
  password?: string; // Only present during creation/update
  salt?: string;
  hash?: string;
  resetPasswordToken?: string;
  resetPasswordExpiration?: string;
  emailVerificationToken?: string;
  emailVerificationExpiration?: string;
}

export interface SupabaseUser extends BaseUser {
  // Supabase specific fields  
  auth_user_id?: string;
  email_confirmed_at?: string;
  phone_confirmed_at?: string;
  last_sign_in_at?: string;
  raw_user_meta_data?: Record<string, any>;
  raw_app_meta_data?: Record<string, any>;
}

export interface UserProfile {
  id: string;
  user_id: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: UserRole;
  profileImage?: string;
  bio?: string;
  preferences?: UserPreferences;
  createdAt: string;
  updatedAt: string;
}

export type UserStatus = 'active' | 'inactive' | 'suspended';

export interface UserNotificationPreferences {
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  privacy: {
    profilePublic: boolean;
    shareData: boolean;
  };
}

export interface DeviceToken {
  token: string;
  platform: 'ios' | 'android' | 'web';
  active: boolean;
}

export interface MobileSettings {
  deviceTokens?: DeviceToken[];
  lastLoginAt?: string;
}

export interface UserPreferences {
  // Communication preferences
  emailNotifications: boolean;
  smsNotifications: boolean;
  pushNotifications: boolean;
  
  // Travel preferences
  preferredCurrency: string;
  timeZone: string;
  language: string;
  
  // Accessibility
  darkMode: boolean;
  fontSize: 'small' | 'medium' | 'large';
  reduceMotion: boolean;
  
  // Privacy
  profileVisibility: 'public' | 'private' | 'contacts';
  locationSharing: boolean;
  analyticsOptOut: boolean;
}

export interface MediaFile {
  id: string;
  filename: string;
  mimeType: string;
  filesize: number;
  width?: number;
  height?: number;
  url: string;
  thumbnailURL?: string;
  alt?: string;
  createdAt: string;
  updatedAt: string;
}

// Utility types
export type UserWithoutSensitive = Omit<BaseUser, 'password' | 'salt' | 'hash'>;
export type UserCreationData = Omit<BaseUser, 'id' | 'createdAt' | 'updatedAt'>;
export type UserUpdateData = Partial<Omit<BaseUser, 'id' | 'email' | 'createdAt' | 'updatedAt'>>;

// Role-based type guards
export const isAdmin = (user: BaseUser): boolean => 
  user.role === 'super-admin' || user.role === 'admin';

export const isOrganizer = (user: BaseUser): boolean => 
  user.role === 'organizer' || isAdmin(user);

export const isClient = (user: BaseUser): boolean => 
  user.role === 'client' || user.role === 'premium-client';

export const isUserPremiumClient = (user: BaseUser): boolean => 
  user.role === 'premium-client';

export const canManageTrips = (user: BaseUser): boolean => 
  isAdmin(user) || isOrganizer(user);

export const canViewAllTrips = (user: BaseUser): boolean => 
  isAdmin(user) || isOrganizer(user);

export const canEditProfile = (user: BaseUser, targetUserId: string): boolean => 
  isAdmin(user) || user.id === targetUserId;
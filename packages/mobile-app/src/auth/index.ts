// Mobile app authentication exports
export * from './service.js';

// Authentication Types for Payload CMS Integration
export interface LoginData {
  email: string;
  password: string;
}

export interface RegistrationData {
  email: string;
  password: string;
  confirmPassword: string;
  firstName?: string;
  lastName?: string;
}

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  emailVerified: boolean;
}

export interface AuthSession {
  token: string;
  refreshToken?: string;
  expiresAt: Date;
}

// Authentication result types
export interface LoginResult {
  success: boolean;
  error?: string;
  user?: AuthUser;
  session?: AuthSession;
}

export interface RegistrationResult {
  success: boolean;
  error?: string;
  message?: string;
}

// Utility functions
export function formatAuthError(error: any): string {
  if (typeof error === 'string') {
    return error;
  }

  if (error?.message) {
    return error.message;
  }

  if (error?.error) {
    return error.error;
  }

  return 'An unknown authentication error occurred';
}

export function getUserDisplayName(user: AuthUser): string {
  if (user.firstName && user.lastName) {
    return `${user.firstName} ${user.lastName}`.trim();
  }

  if (user.firstName) {
    return user.firstName;
  }

  return user.email;
}

export function getUserRole(user: AuthUser): string {
  return user.role || 'user';
}

export function isUserEmailVerified(user: AuthUser): boolean {
  return user.emailVerified || false;
}

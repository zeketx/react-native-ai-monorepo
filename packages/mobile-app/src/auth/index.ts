// Mobile app authentication exports
export * from './service.js';

// Authentication Types for Payload CMS Integration
export interface LoginData {
  email: string;
  password: string;
}

export interface RegistrationData {
  confirmPassword: string;
  email: string;
  firstName?: string;
  lastName?: string;
  password: string;
}

export interface AuthUser {
  email: string;
  emailVerified: boolean;
  firstName: string;
  id: string;
  lastName: string;
  role: string;
}

export interface AuthSession {
  expiresAt: Date;
  refreshToken?: string;
  token: string;
}

// Authentication result types
export interface LoginResult {
  error?: string;
  session?: AuthSession;
  success: boolean;
  user?: AuthUser;
}

export interface RegistrationResult {
  error?: string;
  message?: string;
  success: boolean;
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

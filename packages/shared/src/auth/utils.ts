import type { AuthUser, AuthSession, UserRole } from './types';

export function isAuthenticated(session: AuthSession | null): boolean {
  return !!(session?.access_token && session?.user);
}

export function hasRole(user: AuthUser | null, role: UserRole): boolean {
  return user?.profile?.role === role;
}

export function hasAnyRole(user: AuthUser | null, roles: UserRole[]): boolean {
  if (!user?.profile?.role) return false;
  return roles.includes(user.profile.role);
}

export function isAdmin(user: AuthUser | null): boolean {
  return hasRole(user, 'admin');
}

export function isOrganizer(user: AuthUser | null): boolean {
  return hasRole(user, 'organizer');
}

export function isClient(user: AuthUser | null): boolean {
  return hasRole(user, 'client');
}

export function canAccessAdminFeatures(user: AuthUser | null): boolean {
  return isAdmin(user);
}

export function canManageTrips(user: AuthUser | null): boolean {
  return hasAnyRole(user, ['admin', 'organizer']);
}

export function canViewTrips(user: AuthUser | null): boolean {
  return hasAnyRole(user, ['admin', 'organizer', 'client']);
}

export function getUserDisplayName(user: AuthUser | null): string {
  if (!user) return 'Guest';
  
  if (user.profile?.first_name && user.profile?.last_name) {
    return `${user.profile.first_name} ${user.profile.last_name}`;
  }
  
  if (user.profile?.first_name) {
    return user.profile.first_name;
  }
  
  return user.email || 'User';
}

export function getUserInitials(user: AuthUser | null): string {
  if (!user) return 'G';
  
  const firstName = user.profile?.first_name;
  const lastName = user.profile?.last_name;
  
  if (firstName && lastName) {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  }
  
  if (firstName) {
    return firstName.charAt(0).toUpperCase();
  }
  
  if (user.email) {
    return user.email.charAt(0).toUpperCase();
  }
  
  return 'U';
}

export function isSessionExpired(session: AuthSession | null): boolean {
  if (!session) return true;
  
  const now = Math.floor(Date.now() / 1000);
  return session.expires_at ? now >= session.expires_at : false;
}

export function getTimeUntilExpiry(session: AuthSession | null): number | null {
  if (!session?.expires_at) return null;
  
  const now = Math.floor(Date.now() / 1000);
  const timeLeft = session.expires_at - now;
  
  return timeLeft > 0 ? timeLeft : 0;
}

export function shouldRefreshSession(session: AuthSession | null, thresholdMinutes: number = 5): boolean {
  const timeLeft = getTimeUntilExpiry(session);
  if (timeLeft === null) return false;
  
  const thresholdSeconds = thresholdMinutes * 60;
  return timeLeft <= thresholdSeconds;
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validatePassword(password: string): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
}
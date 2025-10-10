import {
  canAccessAdminFeatures,
  canManageTrips,
  canViewTrips,
  getUserDisplayName,
  getUserInitials,
  hasAnyRole,
  hasRole,
  isAdmin,
  isAuthenticated,
  isClient,
  isOrganizer,
  isSessionExpired,
  shouldRefreshSession,
} from '@clientsync/shared/auth';
import type { UserRole } from '@clientsync/shared/auth';
import { useAuth } from './AuthContext';

export function useAuthState() {
  const { user, session, loading, initialized } = useAuth();

  return {
    user,
    session,
    loading,
    initialized,
    isAuthenticated: isAuthenticated(session),
  };
}

export function useAuthActions() {
  const { login, register, logout, refreshSession } = useAuth();

  return {
    login,
    register,
    logout,
    refreshSession,
  };
}

export function useUserPermissions() {
  const { user } = useAuth();

  return {
    hasRole: (role: UserRole) => hasRole(user, role),
    hasAnyRole: (roles: UserRole[]) => hasAnyRole(user, roles),
    isAdmin: () => isAdmin(user),
    isOrganizer: () => isOrganizer(user),
    isClient: () => isClient(user),
    canAccessAdminFeatures: () => canAccessAdminFeatures(user),
    canManageTrips: () => canManageTrips(user),
    canViewTrips: () => canViewTrips(user),
  };
}

export function useUserProfile() {
  const { user } = useAuth();

  return {
    user,
    displayName: getUserDisplayName(user),
    initials: getUserInitials(user),
    email: user?.email,
    role: user?.profile?.role,
    profile: user?.profile,
  };
}

export function useSessionManager() {
  const { session, refreshSession } = useAuth();

  return {
    session,
    isExpired: isSessionExpired(session),
    shouldRefresh: shouldRefreshSession(session),
    refresh: refreshSession,
  };
}

// Higher-order hook that combines common auth needs
export function useAuthStatus() {
  const authState = useAuthState();
  const permissions = useUserPermissions();
  const profile = useUserProfile();
  const sessionManager = useSessionManager();

  return {
    ...authState,
    ...permissions,
    ...profile,
    ...sessionManager,
  };
}

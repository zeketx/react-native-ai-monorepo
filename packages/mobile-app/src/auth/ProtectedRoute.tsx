import { isAuthenticated } from '@clientsync/shared';
import type { UserRole } from '@clientsync/shared';
import { Redirect } from 'expo-router';
import { View } from 'react-native';
import Text from '../ui/Text.js';
import { useAuth } from './AuthContext.js';

interface ProtectedRouteProps {
  children: React.ReactNode;
  roles?: UserRole[];
  fallbackRoute?: string;
  loadingComponent?: React.ReactNode;
  unauthorizedComponent?: React.ReactNode;
}

export function ProtectedRoute({
  children,
  roles,
  fallbackRoute = '/login',
  loadingComponent,
  unauthorizedComponent,
}: ProtectedRouteProps) {
  const { user, session, loading, initialized } = useAuth();

  // Show loading state while initializing
  if (!initialized || loading) {
    return (
      loadingComponent || (
        <View className="flex-1 items-center justify-center bg-white">
          <Text className="text-gray-600">Loading...</Text>
        </View>
      )
    );
  }

  // Redirect if not authenticated
  if (!isAuthenticated(session)) {
    return <Redirect href={fallbackRoute as any} />;
  }

  // Check role-based permissions
  if (roles && roles.length > 0) {
    const userRole = user?.profile?.role;

    if (!userRole || !roles.includes(userRole)) {
      if (unauthorizedComponent) {
        return <>{unauthorizedComponent}</>;
      }

      return (
        <View className="flex-1 items-center justify-center bg-white px-6">
          <Text className="text-gray-900 mb-4 text-center text-xl font-semibold">
            Access Denied
          </Text>
          <Text className="text-gray-600 text-center">
            You don't have permission to access this page.
          </Text>
        </View>
      );
    }
  }

  return <>{children}</>;
}

// Convenience components for specific roles
export function AdminRoute({
  children,
  ...props
}: Omit<ProtectedRouteProps, 'roles'>) {
  return (
    <ProtectedRoute roles={['admin']} {...props}>
      {children}
    </ProtectedRoute>
  );
}

export function OrganizerRoute({
  children,
  ...props
}: Omit<ProtectedRouteProps, 'roles'>) {
  return (
    <ProtectedRoute roles={['admin', 'organizer']} {...props}>
      {children}
    </ProtectedRoute>
  );
}

export function ClientRoute({
  children,
  ...props
}: Omit<ProtectedRouteProps, 'roles'>) {
  return (
    <ProtectedRoute roles={['admin', 'organizer', 'client']} {...props}>
      {children}
    </ProtectedRoute>
  );
}

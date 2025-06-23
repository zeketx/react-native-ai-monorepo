# Task: Create Protected Routes System

**ID:** CS-P4-006  
**Phase:** Web Dashboard  
**Dependencies:** CS-P4-005, CS-P4-003

## Objective
Implement a comprehensive protected routes system with role-based access control, permission checking, and proper redirect handling for unauthorized access attempts.

## Context
The dashboard contains sensitive client data requiring granular access control. Different organizer roles (admin, manager, viewer) need different levels of access. The system must handle authorization failures gracefully while maintaining security.

## Requirements
- Route-level protection
- Role-based access control
- Permission-based features
- Redirect to login on auth failure
- Remember intended destination
- Loading states during auth check

## Technical Guidance
- Create HOC for protection
- Implement permission matrix
- Use React Router guards
- Handle async auth checks
- Store redirect location
- Apply progressive enhancement

## Permission Matrix
```typescript
enum Permission {
  // Client permissions
  VIEW_CLIENTS = 'clients.view',
  EDIT_CLIENTS = 'clients.edit',
  DELETE_CLIENTS = 'clients.delete',
  
  // Trip permissions
  VIEW_TRIPS = 'trips.view',
  EDIT_TRIPS = 'trips.edit',
  CREATE_TRIPS = 'trips.create',
  
  // Allowlist permissions
  VIEW_ALLOWLIST = 'allowlist.view',
  MANAGE_ALLOWLIST = 'allowlist.manage',
  
  // Admin permissions
  VIEW_SETTINGS = 'settings.view',
  MANAGE_USERS = 'users.manage',
  VIEW_ANALYTICS = 'analytics.view',
}

interface RolePermissions {
  admin: Permission[];
  manager: Permission[];
  viewer: Permission[];
}

const ROLE_PERMISSIONS: RolePermissions = {
  admin: Object.values(Permission), // All permissions
  manager: [
    Permission.VIEW_CLIENTS,
    Permission.EDIT_CLIENTS,
    Permission.VIEW_TRIPS,
    Permission.EDIT_TRIPS,
    Permission.CREATE_TRIPS,
    Permission.VIEW_ALLOWLIST,
    Permission.MANAGE_ALLOWLIST,
  ],
  viewer: [
    Permission.VIEW_CLIENTS,
    Permission.VIEW_TRIPS,
    Permission.VIEW_ALLOWLIST,
  ],
};
```

## Protected Route Component
```typescript
// src/components/auth/ProtectedRoute.tsx
interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermissions?: Permission[];
  requiredRole?: UserRole;
  fallback?: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredPermissions = [],
  requiredRole,
  fallback = <LoadingSpinner />,
}) => {
  const { user, isLoading, checkPermissions } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!isLoading && !user) {
      // Save intended destination
      navigate('/login', {
        state: { from: location },
        replace: true,
      });
    }
  }, [user, isLoading, location, navigate]);
  
  if (isLoading) {
    return <>{fallback}</>;
  }
  
  if (!user) {
    return null; // Redirect handled by useEffect
  }
  
  // Check role requirement
  if (requiredRole && user.role !== requiredRole) {
    return <UnauthorizedPage />;
  }
  
  // Check permissions
  if (requiredPermissions.length > 0) {
    const hasPermissions = checkPermissions(requiredPermissions);
    if (!hasPermissions) {
      return <UnauthorizedPage />;
    }
  }
  
  return <>{children}</>;
};
```

## Route Configuration with Protection
```typescript
// src/routes/protectedRoutes.tsx
export const protectedRoutes = [
  {
    path: 'dashboard',
    element: <DashboardLayout />,
    children: [
      {
        index: true,
        element: (
          <ProtectedRoute requiredPermissions={[Permission.VIEW_CLIENTS]}>
            <DashboardHome />
          </ProtectedRoute>
        ),
      },
      {
        path: 'clients',
        children: [
          {
            index: true,
            element: (
              <ProtectedRoute requiredPermissions={[Permission.VIEW_CLIENTS]}>
                <ClientListPage />
              </ProtectedRoute>
            ),
          },
          {
            path: ':clientId',
            element: (
              <ProtectedRoute requiredPermissions={[Permission.VIEW_CLIENTS]}>
                <ClientDetailPage />
              </ProtectedRoute>
            ),
          },
          {
            path: ':clientId/edit',
            element: (
              <ProtectedRoute requiredPermissions={[Permission.EDIT_CLIENTS]}>
                <ClientEditPage />
              </ProtectedRoute>
            ),
          },
        ],
      },
      {
        path: 'allowlist',
        element: (
          <ProtectedRoute requiredPermissions={[Permission.VIEW_ALLOWLIST]}>
            <AllowlistPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'settings',
        element: (
          <ProtectedRoute requiredRole="admin">
            <SettingsPage />
          </ProtectedRoute>
        ),
      },
    ],
  },
];
```

## Permission Hook
```typescript
// src/hooks/usePermissions.ts
export const usePermissions = () => {
  const { user } = useAuth();
  
  const hasPermission = useCallback((permission: Permission): boolean => {
    if (!user) return false;
    
    const rolePermissions = ROLE_PERMISSIONS[user.role] || [];
    return rolePermissions.includes(permission);
  }, [user]);
  
  const hasAnyPermission = useCallback(
    (permissions: Permission[]): boolean => {
      return permissions.some(permission => hasPermission(permission));
    },
    [hasPermission]
  );
  
  const hasAllPermissions = useCallback(
    (permissions: Permission[]): boolean => {
      return permissions.every(permission => hasPermission(permission));
    },
    [hasPermission]
  );
  
  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    permissions: user ? ROLE_PERMISSIONS[user.role] : [],
  };
};
```

## Conditional UI Rendering
```typescript
// src/components/auth/CanAccess.tsx
interface CanAccessProps {
  permissions?: Permission[];
  role?: UserRole;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export const CanAccess: React.FC<CanAccessProps> = ({
  permissions,
  role,
  fallback = null,
  children,
}) => {
  const { user } = useAuth();
  const { hasAllPermissions } = usePermissions();
  
  if (role && user?.role !== role) {
    return <>{fallback}</>;
  }
  
  if (permissions && !hasAllPermissions(permissions)) {
    return <>{fallback}</>;
  }
  
  return <>{children}</>;
};

// Usage
<CanAccess permissions={[Permission.EDIT_CLIENTS]}>
  <EditButton onClick={handleEdit} />
</CanAccess>
```

## Unauthorized Page
```typescript
// src/pages/UnauthorizedPage.tsx
export const UnauthorizedPage: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900">403</h1>
        <p className="mt-2 text-lg text-gray-600">
          You don't have permission to access this page
        </p>
        <div className="mt-6 space-x-4">
          <Button onClick={() => navigate(-1)}>
            Go Back
          </Button>
          <Button onClick={() => navigate('/dashboard')} variant="outline">
            Go to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
};
```

## Acceptance Criteria
- [ ] Routes enforce permissions
- [ ] Unauthorized access redirects
- [ ] Login redirect preserves destination
- [ ] Role checks work correctly
- [ ] UI elements hide based on permissions
- [ ] Loading states display properly

## Where to Create
- `packages/web-dashboard/src/components/auth/ProtectedRoute.tsx`
- `packages/web-dashboard/src/hooks/usePermissions.ts`
- `packages/web-dashboard/src/constants/permissions.ts`

## Security Considerations
- Server-side validation required
- Don't expose all permissions to client
- Audit unauthorized access attempts
- Regular permission reviews

## Estimated Effort
2.5 hours
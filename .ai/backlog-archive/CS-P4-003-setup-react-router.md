# Task: Setup React Router for Dashboard

**ID:** CS-P4-003  
**Phase:** Web Dashboard  
**Dependencies:** CS-P4-001

## Objective
Implement React Router v6 with a comprehensive routing structure, authentication guards, lazy loading, and type-safe navigation for the web dashboard application.

## Context
The dashboard requires sophisticated routing to handle authentication flows, protected routes, nested layouts, and dynamic client pages. React Router v6 provides powerful routing capabilities with improved type safety and performance.

## Requirements
- React Router v6 setup
- Protected route implementation
- Role-based access control
- Lazy loading for code splitting
- Type-safe route parameters
- Breadcrumb navigation support

## Technical Guidance
- Use createBrowserRouter API
- Implement route guards
- Apply lazy loading patterns
- Create typed route helpers
- Handle 404 and errors
- Support deep linking

## Route Structure
```typescript
// src/routes/index.tsx
const routes = [
  {
    path: '/',
    element: <RootLayout />,
    errorElement: <ErrorBoundary />,
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard" replace />
      },
      {
        path: 'login',
        element: <LoginPage />,
      },
      {
        path: 'dashboard',
        element: <ProtectedRoute><DashboardLayout /></ProtectedRoute>,
        children: [
          {
            index: true,
            element: <DashboardHome />
          },
          {
            path: 'clients',
            children: [
              {
                index: true,
                element: <ClientListPage />
              },
              {
                path: ':clientId',
                element: <ClientDetailPage />,
                loader: clientDetailLoader
              }
            ]
          },
          {
            path: 'trips',
            element: <TripManagementPage />
          },
          {
            path: 'allowlist',
            element: <AllowlistPage />
          },
          {
            path: 'settings',
            element: <SettingsPage />
          }
        ]
      }
    ]
  }
];
```

## Protected Route Implementation
```typescript
// src/components/auth/ProtectedRoute.tsx
interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole 
}) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();
  
  if (isLoading) {
    return <LoadingSpinner />;
  }
  
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/unauthorized" replace />;
  }
  
  return <>{children}</>;
};
```

## Type-Safe Routes
```typescript
// src/routes/types.ts
export const ROUTES = {
  home: '/',
  login: '/login',
  dashboard: {
    home: '/dashboard',
    clients: {
      list: '/dashboard/clients',
      detail: (id: string) => `/dashboard/clients/${id}` as const,
    },
    trips: '/dashboard/trips',
    allowlist: '/dashboard/allowlist',
    settings: '/dashboard/settings',
  },
} as const;

// Type-safe navigation hook
export const useTypedNavigate = () => {
  const navigate = useNavigate();
  
  return {
    toClientDetail: (id: string) => 
      navigate(ROUTES.dashboard.clients.detail(id)),
    toDashboard: () => 
      navigate(ROUTES.dashboard.home),
    toLogin: (from?: Location) => 
      navigate(ROUTES.login, { state: { from } }),
  };
};
```

## Lazy Loading Setup
```typescript
// src/routes/lazy.ts
import { lazy } from 'react';

// Lazy load heavy pages
export const ClientListPage = lazy(() => 
  import('../pages/clients/ClientListPage')
);

export const ClientDetailPage = lazy(() => 
  import('../pages/clients/ClientDetailPage')
);

export const TripManagementPage = lazy(() => 
  import('../pages/trips/TripManagementPage')
);

// Wrap with Suspense in route config
<Suspense fallback={<PageLoader />}>
  <ClientListPage />
</Suspense>
```

## Breadcrumb Support
```typescript
// src/hooks/useBreadcrumbs.ts
export const useBreadcrumbs = () => {
  const location = useLocation();
  const params = useParams();
  
  const breadcrumbs = useMemo(() => {
    const paths = location.pathname.split('/').filter(Boolean);
    
    return paths.map((path, index) => {
      const url = `/${paths.slice(0, index + 1).join('/')}`;
      const label = path.charAt(0).toUpperCase() + path.slice(1);
      
      return { label, url, isActive: index === paths.length - 1 };
    });
  }, [location.pathname]);
  
  return breadcrumbs;
};
```

## Error Handling
```typescript
// src/components/ErrorBoundary.tsx
export const ErrorBoundary = () => {
  const error = useRouteError();
  
  if (isRouteErrorResponse(error)) {
    if (error.status === 404) {
      return <NotFoundPage />;
    }
    
    if (error.status === 401) {
      return <Navigate to="/login" replace />;
    }
  }
  
  return <ErrorPage error={error} />;
};
```

## Acceptance Criteria
- [ ] All routes navigate correctly
- [ ] Protected routes enforce auth
- [ ] Lazy loading reduces bundle
- [ ] Type safety prevents errors
- [ ] Breadcrumbs display properly
- [ ] Error pages handle failures

## Where to Create
- `packages/web-dashboard/src/routes/`
- `packages/web-dashboard/src/components/auth/`
- `packages/web-dashboard/src/hooks/navigation/`

## Performance Metrics
- Route transition < 100ms
- Lazy chunk load < 500ms
- No layout shifts
- Smooth navigation

## Estimated Effort
2 hours
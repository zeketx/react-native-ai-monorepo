# Task: Implement Organizer Authentication

**ID:** CS-P4-005  
**Phase:** Web Dashboard  
**Dependencies:** CS-P4-003, CS-P1-004

## Objective
Create a secure authentication system for travel organizers with role-based access control, session management, and integration with Supabase Auth.

## Context
The dashboard requires robust authentication to ensure only authorized organizers can access client data. The system must support secure login, session persistence, role verification, and proper security headers while providing a smooth user experience.

## Requirements
- Email/password authentication
- Role-based access control (RBAC)
- Secure session management
- Remember me functionality
- Password reset flow
- Two-factor authentication ready

## Technical Guidance
- Use Supabase Auth
- Implement auth context
- Apply JWT best practices
- Handle refresh tokens
- Secure cookie storage
- Add CSRF protection

## Authentication Flow
```typescript
interface AuthFlow {
  login: (credentials: LoginCredentials) => Promise<AuthResult>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<AuthResult>;
  resetPassword: (email: string) => Promise<void>;
  verifyRole: (user: User) => Promise<boolean>;
}

interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

interface AuthResult {
  user: OrganizerUser;
  session: Session;
  error?: AuthError;
}
```

## Auth Context Implementation
```typescript
// src/contexts/AuthContext.tsx
interface AuthContextValue {
  user: OrganizerUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  checkRole: (requiredRole: UserRole) => boolean;
}

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ 
  children 
}) => {
  const [user, setUser] = useState<OrganizerUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          const organizer = await verifyOrganizerRole(session.user);
          if (organizer) {
            setUser(organizer);
          }
        }
      } catch (error) {
        console.error('Auth initialization failed:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    initAuth();
    
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          const organizer = await verifyOrganizerRole(session.user);
          setUser(organizer);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
        }
      }
    );
    
    return () => subscription.unsubscribe();
  }, []);
  
  const login = async (credentials: LoginCredentials) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password,
    });
    
    if (error) throw error;
    
    // Verify organizer role
    const organizer = await verifyOrganizerRole(data.user);
    if (!organizer) {
      await supabase.auth.signOut();
      throw new Error('Unauthorized: Organizer access required');
    }
    
    // Handle remember me
    if (credentials.rememberMe) {
      await supabase.auth.updateUser({
        data: { remember_me: true }
      });
    }
  };
  
  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      isAuthenticated: !!user,
      login,
      logout,
      checkRole,
    }}>
      {children}
    </AuthContext.Provider>
  );
};
```

## Login Page Component
```tsx
// src/pages/auth/LoginPage.tsx
export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const from = location.state?.from?.pathname || '/dashboard';
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<LoginFormData>();
  
  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data);
      navigate(from, { replace: true });
    } catch (error) {
      toast.error(error.message);
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="text-3xl font-bold text-center">
            Organizer Login
          </h2>
          <p className="mt-2 text-center text-gray-600">
            Sign in to manage your clients
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            <Input
              {...register('email', {
                required: 'Email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Invalid email address'
                }
              })}
              type="email"
              placeholder="Email address"
              error={errors.email?.message}
            />
            
            <Input
              {...register('password', {
                required: 'Password is required',
                minLength: {
                  value: 8,
                  message: 'Password must be at least 8 characters'
                }
              })}
              type="password"
              placeholder="Password"
              error={errors.password?.message}
            />
            
            <div className="flex items-center justify-between">
              <Checkbox
                {...register('rememberMe')}
                label="Remember me"
              />
              
              <Link
                to="/auth/reset-password"
                className="text-sm text-primary-600 hover:underline"
              >
                Forgot password?
              </Link>
            </div>
          </div>
          
          <Button
            type="submit"
            fullWidth
            loading={isSubmitting}
          >
            Sign in
          </Button>
        </form>
      </div>
    </div>
  );
};
```

## Role Verification
```typescript
// src/services/auth/roleVerification.ts
export const verifyOrganizerRole = async (
  user: User
): Promise<OrganizerUser | null> => {
  const { data, error } = await supabase
    .from('organizers')
    .select('*')
    .eq('user_id', user.id)
    .single();
  
  if (error || !data) return null;
  
  return {
    ...user,
    organizerId: data.id,
    role: data.role,
    permissions: data.permissions,
  };
};
```

## Security Measures
- HTTPS only cookies
- CSRF token validation
- Rate limiting on login
- Account lockout after failures
- Secure password requirements
- Session timeout handling

## Acceptance Criteria
- [ ] Login works with valid credentials
- [ ] Invalid credentials show error
- [ ] Remember me persists session
- [ ] Role verification prevents access
- [ ] Password reset flow works
- [ ] Session refresh handles expiry

## Where to Create
- `packages/web-dashboard/src/contexts/AuthContext.tsx`
- `packages/web-dashboard/src/pages/auth/`
- `packages/web-dashboard/src/services/auth/`

## Security Checklist
- [ ] Passwords hashed with bcrypt
- [ ] Sessions expire appropriately
- [ ] CSRF protection enabled
- [ ] Rate limiting implemented
- [ ] Audit logs capture auth events

## Estimated Effort
3 hours
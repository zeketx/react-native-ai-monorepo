import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { authService } from '../services/auth';
import type { User, LoginCredentials } from '../services/auth';

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const isAuthenticated = user !== null && authService.isAuthenticated();

  // Initialize auth state on mount
  useEffect(() => {
    initializeAuth();
  }, []);

  // Set up token refresh interval
  useEffect(() => {
    if (isAuthenticated) {
      const interval = setInterval(async () => {
        try {
          await refreshAuthSilently();
        } catch (error) {
          console.error('Silent token refresh failed:', error);
          // Token refresh failed, user will be logged out on next API call
        }
      }, 10 * 60 * 1000); // Refresh every 10 minutes

      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  const initializeAuth = async () => {
    try {
      setLoading(true);
      
      // Check if we have a stored token
      const storedUser = authService.getStoredUser();
      
      if (storedUser && authService.isAuthenticated()) {
        setUser(storedUser);
      } else if (storedUser && !authService.isTokenExpired()) {
        // Token exists but might need refresh
        try {
          const refreshed = await authService.refreshToken();
          if (refreshed) {
            setUser(refreshed.user);
          } else {
            setUser(null);
          }
        } catch {
          setUser(null);
        }
      } else {
        // No valid token, clear any stale data
        await authService.logout();
        setUser(null);
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials: LoginCredentials) => {
    try {
      setLoading(true);
      const response = await authService.login(credentials);
      setUser(response.user);
    } catch (error) {
      console.error('Login error:', error);
      setUser(null);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      await authService.logout();
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear user state even if logout call fails
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const refreshAuth = async () => {
    try {
      const refreshed = await authService.refreshToken();
      if (refreshed) {
        setUser(refreshed.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Auth refresh error:', error);
      setUser(null);
      throw error;
    }
  };

  const refreshAuthSilently = async () => {
    try {
      const refreshed = await authService.refreshToken();
      if (refreshed) {
        setUser(refreshed.user);
      }
    } catch (error) {
      // Silent refresh failure - don't throw, just log
      console.warn('Silent auth refresh failed:', error);
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    isAuthenticated,
    login,
    logout,
    refreshAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Hook for accessing auth state without the provider requirement (useful for testing)
export function useOptionalAuth(): AuthContextType | undefined {
  return useContext(AuthContext);
}
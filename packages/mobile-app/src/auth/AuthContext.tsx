import {
  AuthContextType,
  authService,
  AuthState,
  LoginCredentials,
  RegisterCredentials,
} from '@clientsync/shared';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { supabase } from '../lib/supabase.js';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const SESSION_STORAGE_KEY = 'clientsync-auth-session';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
    initialized: false,
  });

  const updateAuthState = useCallback((updates: Partial<AuthState>) => {
    setAuthState((prev: AuthState) => ({ ...prev, ...updates }));
  }, []);

  const login = useCallback(
    async (credentials: LoginCredentials) => {
      updateAuthState({ loading: true });

      try {
        const result = await authService.login(credentials);

        if (result.error) {
          updateAuthState({ loading: false });
          return { error: result.error };
        }

        if (result.data) {
          const { user } = result.data;

          // Store session in AsyncStorage
          await (AsyncStorage as any).setItem(
            SESSION_STORAGE_KEY,
            JSON.stringify(result.data),
          );

          updateAuthState({
            user,
            session: result.data,
            loading: false,
            initialized: true,
          });
        }

        return {};
      } catch (error) {
        updateAuthState({ loading: false });
        return { error: { message: 'Login failed', code: 'UNKNOWN_ERROR' } };
      }
    },
    [updateAuthState],
  );

  const register = useCallback(
    async (credentials: RegisterCredentials) => {
      updateAuthState({ loading: true });

      try {
        const result = await authService.register(credentials);

        if (result.error) {
          updateAuthState({ loading: false });
          return { error: result.error };
        }

        if (result.data) {
          const { user } = result.data;

          // Store session in AsyncStorage
          await (AsyncStorage as any).setItem(
            SESSION_STORAGE_KEY,
            JSON.stringify(result.data),
          );

          updateAuthState({
            user,
            session: result.data,
            loading: false,
            initialized: true,
          });
        } else {
          // Registration successful but needs email verification
          updateAuthState({ loading: false });
        }

        return {};
      } catch (error) {
        updateAuthState({ loading: false });
        return {
          error: { message: 'Registration failed', code: 'UNKNOWN_ERROR' },
        };
      }
    },
    [updateAuthState],
  );

  const logout = useCallback(async () => {
    updateAuthState({ loading: true });

    try {
      await authService.logout();
      await (AsyncStorage as any).removeItem(SESSION_STORAGE_KEY);

      updateAuthState({
        user: null,
        session: null,
        loading: false,
        initialized: true,
      });

      return {};
    } catch (error) {
      updateAuthState({ loading: false });
      return { error: { message: 'Logout failed', code: 'UNKNOWN_ERROR' } };
    }
  }, [updateAuthState]);

  const refreshSession = useCallback(async () => {
    try {
      const result = await authService.refreshSession();

      if (result.error) {
        // Session refresh failed, clear stored session
        await (AsyncStorage as any).removeItem(SESSION_STORAGE_KEY);
        updateAuthState({
          user: null,
          session: null,
          loading: false,
          initialized: true,
        });
        return { error: result.error };
      }

      if (result.data) {
        const { user } = result.data;

        // Update stored session
        await (AsyncStorage as any).setItem(
          SESSION_STORAGE_KEY,
          JSON.stringify(result.data),
        );

        updateAuthState({
          user,
          session: result.data,
          loading: false,
          initialized: true,
        });
      }

      return {};
    } catch (error) {
      await (AsyncStorage as any).removeItem(SESSION_STORAGE_KEY);
      updateAuthState({
        user: null,
        session: null,
        loading: false,
        initialized: true,
      });
      return {
        error: { message: 'Session refresh failed', code: 'UNKNOWN_ERROR' },
      };
    }
  }, [updateAuthState]);

  // Initialize authentication state
  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        // Try to get session from AsyncStorage first
        const storedSession = await (AsyncStorage as any).getItem(SESSION_STORAGE_KEY);

        if (storedSession) {
          try {
            JSON.parse(storedSession);

            // Verify the session is still valid
            const { data: currentSession } =
              await authService.getCurrentSession();

            if (currentSession && mounted) {
              updateAuthState({
                user: currentSession.user,
                session: currentSession,
                loading: false,
                initialized: true,
              });
              return;
            }
          } catch (parseError) {
            // Invalid stored session, remove it
            await (AsyncStorage as any).removeItem(SESSION_STORAGE_KEY);
          }
        }

        // Try to get current session from Supabase
        const { data: currentSession } = await authService.getCurrentSession();

        if (mounted) {
          if (currentSession) {
            const { user } = currentSession;
            await (AsyncStorage as any).setItem(
              SESSION_STORAGE_KEY,
              JSON.stringify(currentSession),
            );

            updateAuthState({
              user,
              session: currentSession,
              loading: false,
              initialized: true,
            });
          } else {
            updateAuthState({
              user: null,
              session: null,
              loading: false,
              initialized: true,
            });
          }
        }
      } catch (error) {
        if (mounted) {
          updateAuthState({
            user: null,
            session: null,
            loading: false,
            initialized: true,
          });
        }
      }
    };

    initializeAuth();

    return () => {
      mounted = false;
    };
  }, [updateAuthState]);

  // Listen for auth state changes
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event: any, session: any) => {
      if (event === 'SIGNED_OUT') {
        await (AsyncStorage as any).removeItem(SESSION_STORAGE_KEY);
        updateAuthState({
          user: null,
          session: null,
          loading: false,
          initialized: true,
        });
      } else if (session) {
        // Get user with profile
        const { data: currentSession } = await authService.getCurrentSession();

        if (currentSession) {
          const { user } = currentSession;
          await (AsyncStorage as any).setItem(
            SESSION_STORAGE_KEY,
            JSON.stringify(currentSession),
          );

          updateAuthState({
            user,
            session: currentSession,
            loading: false,
            initialized: true,
          });
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [updateAuthState]);

  const contextValue: AuthContextType = {
    ...authState,
    login,
    register,
    logout,
    refreshSession,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

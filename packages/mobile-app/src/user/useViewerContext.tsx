import createContextHook from '@nkzw/create-context-hook';
import UntypedAsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  formatAuthError,
  getAuthService,
  getUserDisplayName,
  getUserRole,
  type AuthSession,
  type AuthUser,
  type LoginData,
  type RegistrationData,
} from 'src/auth/index.js';
import getLocale, { setClientLocale } from 'src/i18n/getLocale.tsx';

// The type of AsyncStorage is not correctly exported when using `"type": "module"` 🤷‍♂️.
const AsyncStorage = UntypedAsyncStorage as unknown as Readonly<{
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<void>;
}>;

type LocalSettings = Readonly<{
  localSettingExample: string | null;
}>;

type ViewerContext = Readonly<{
  user: AuthUser;
  session: AuthSession;
}>;

const getLocalStorageKey = (userID: string) =>
  `$userData${userID}$localSettings`;

const initialLocalSettings = {
  localSettingExample: null,
} as const;

const [ViewerContext, useViewerContext] = createContextHook(() => {
  const router = useRouter();

  const [viewerContext, setViewerContext] = useState<ViewerContext | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  const user = viewerContext?.user;
  const session = viewerContext?.session;

  const [locale, _setLocale] = useState(getLocale);

  const setLocale = useCallback((locale: string) => {
    setClientLocale(locale, async () => ({}));
    _setLocale(locale);
  }, []);

  const [localSettings, setLocalSettings] =
    useState<LocalSettings>(initialLocalSettings);

  // Initialize authentication service and check existing session
  useEffect(() => {
    let authService: ReturnType<typeof getAuthService> | undefined;
    let unsubscribe: (() => void) | undefined;

    const initializeAuth = async () => {
      try {
        setIsLoading(true);
        setAuthError(null);

        // Get authentication service
        authService = getAuthService();

        // Check for existing session
        const { session: existingSession, error } =
          await authService.getSession();

        if (error) {
          console.warn(
            'Failed to get existing session:',
            formatAuthError(error),
          );
          setAuthError(formatAuthError(error));
        } else if (existingSession?.user) {
          setViewerContext({
            user: existingSession.user,
            session: existingSession,
          });

          // Load user's local settings
          try {
            const storedSettings = await AsyncStorage.getItem(
              getLocalStorageKey(existingSession.user.id),
            );
            if (storedSettings) {
              setLocalSettings(JSON.parse(storedSettings));
            }
          } catch (error) {
            console.warn('Failed to load local settings:', error);
          }
        }

        // Set up auth state change listener
        if (authService) {
          unsubscribe = authService.onAuthStateChange((event) => {
            if (event.session?.user) {
              setViewerContext({
                user: event.user!,
                session: event.session,
              });
              setAuthError(null);
            } else {
              setViewerContext(null);
              setLocalSettings(initialLocalSettings);
            }
          });
        }
      } catch (error) {
        console.error('Failed to initialize authentication:', error);
        setAuthError(
          error instanceof Error
            ? error.message
            : 'Authentication initialization failed',
        );
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    return () => {
      unsubscribe?.();
    };
  }, []);

  const updateLocalSettings = useCallback(
    (settings: Partial<LocalSettings>) => {
      const newSettings = {
        ...localSettings,
        ...settings,
      };

      setLocalSettings(newSettings);

      if (user?.id) {
        AsyncStorage.setItem(
          getLocalStorageKey(user.id),
          JSON.stringify(newSettings),
        );
      }
    },
    [localSettings, user],
  );

  const login = useCallback(
    async (loginData: LoginData) => {
      try {
        setIsLoading(true);
        setAuthError(null);

        const authService = getAuthService();
        const {
          user: authUser,
          session: authSession,
          error,
        } = await authService.signIn(loginData);

        if (error) {
          setAuthError(formatAuthError(error));
          return { success: false, error: formatAuthError(error) };
        }

        if (authUser && authSession) {
          setViewerContext({
            user: authUser,
            session: authSession,
          });
          router.replace('/');
          return { success: true };
        }

        return { success: false, error: 'Login failed - no user returned' };
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Login failed';
        setAuthError(errorMessage);
        return { success: false, error: errorMessage };
      } finally {
        setIsLoading(false);
      }
    },
    [router],
  );

  const register = useCallback(async (registrationData: RegistrationData) => {
    try {
      setIsLoading(true);
      setAuthError(null);

      const authService = getAuthService();
      const { user: authUser, error } =
        await authService.signUp(registrationData);

      if (error) {
        setAuthError(formatAuthError(error));
        return { success: false, error: formatAuthError(error) };
      }

      if (authUser) {
        // Note: User will need to confirm email before they can sign in
        return {
          success: true,
          message:
            'Registration successful! Please check your email to confirm your account.',
        };
      }

      return {
        success: false,
        error: 'Registration failed - no user returned',
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Registration failed';
      setAuthError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      setIsLoading(true);
      setAuthError(null);

      const authService = getAuthService();
      const { error } = await authService.signOut();

      if (error) {
        console.warn('Logout error:', formatAuthError(error));
        setAuthError(formatAuthError(error));
      }

      // Clear local state regardless of logout result
      setViewerContext(null);
      setLocalSettings(initialLocalSettings);
      router.replace('/login');
    } catch (error) {
      console.error('Logout failed:', error);
      setAuthError(error instanceof Error ? error.message : 'Logout failed');
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  return {
    // Authentication state
    isAuthenticated: !!user,
    isLoading,
    authError,
    user,
    session,

    // Authentication methods
    login,
    register,
    logout,

    // App state
    locale,
    localSettings,
    setLocale,
    updateLocalSettings,

    // User utilities
    userDisplayName: user ? getUserDisplayName(user) : null,
    userRole: user ? getUserRole(user) : null,
  };
});

export function useLocalSettings() {
  const { localSettings, updateLocalSettings } = useViewerContext();
  return [localSettings, updateLocalSettings] as const;
}

export { ViewerContext };
export default useViewerContext;

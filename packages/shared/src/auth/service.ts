import { getSupabaseClient } from './client';
import type { 
  AuthUser, 
  AuthSession, 
  AuthError, 
  LoginCredentials, 
  RegisterCredentials,
  UserRole 
} from './types';

export class AuthService {
  private supabase = getSupabaseClient();

  async login(credentials: LoginCredentials): Promise<{ data?: AuthSession; error?: AuthError }> {
    try {
      const { data, error } = await this.supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });

      if (error) {
        return { error: { message: error.message, code: error.message } };
      }

      if (!data.session || !data.user) {
        return { error: { message: 'Authentication failed' } };
      }

      // Fetch user profile
      const userWithProfile = await this.fetchUserProfile(data.user.id);
      
      const authSession: AuthSession = {
        ...data.session,
        user: userWithProfile || data.user as AuthUser,
      };

      return { data: authSession };
    } catch (err) {
      return { error: { message: 'Login failed', code: 'UNKNOWN_ERROR' } };
    }
  }

  async register(credentials: RegisterCredentials): Promise<{ data?: AuthSession; error?: AuthError }> {
    try {
      // Check email allowlist first
      const isAllowed = await this.checkEmailAllowlist(credentials.email);
      if (!isAllowed) {
        return { 
          error: { 
            message: 'Email not authorized. Please contact support for access.',
            code: 'EMAIL_NOT_ALLOWED'
          } 
        };
      }

      // Register user
      const { data, error } = await this.supabase.auth.signUp({
        email: credentials.email,
        password: credentials.password,
        options: {
          data: {
            first_name: credentials.firstName,
            last_name: credentials.lastName,
            phone: credentials.phone,
            role: credentials.role || 'client',
          },
        },
      });

      if (error) {
        return { error: { message: error.message, code: error.message } };
      }

      if (!data.user) {
        return { error: { message: 'Registration failed' } };
      }

      // Initialize user data using database helper function
      if (data.session) {
        await this.initializeUserData(data.user.id, {
          email: credentials.email,
          firstName: credentials.firstName,
          lastName: credentials.lastName,
          phone: credentials.phone,
          role: credentials.role || 'client',
        });

        // Fetch the created profile
        const userWithProfile = await this.fetchUserProfile(data.user.id);
        
        const authSession: AuthSession = {
          ...data.session,
          user: userWithProfile || data.user as AuthUser,
        };

        return { data: authSession };
      }

      // User registered but needs email verification
      return { data: undefined };
    } catch (err) {
      return { error: { message: 'Registration failed', code: 'UNKNOWN_ERROR' } };
    }
  }

  async logout(): Promise<{ error?: AuthError }> {
    try {
      const { error } = await this.supabase.auth.signOut();
      
      if (error) {
        return { error: { message: error.message, code: error.message } };
      }

      return {};
    } catch (err) {
      return { error: { message: 'Logout failed', code: 'UNKNOWN_ERROR' } };
    }
  }

  async getCurrentSession(): Promise<{ data?: AuthSession; error?: AuthError }> {
    try {
      const { data, error } = await this.supabase.auth.getSession();

      if (error) {
        return { error: { message: error.message, code: error.message } };
      }

      if (!data.session) {
        return { data: undefined };
      }

      // Fetch user profile
      const userWithProfile = await this.fetchUserProfile(data.session.user.id);
      
      const authSession: AuthSession = {
        ...data.session,
        user: userWithProfile || data.session.user as AuthUser,
      };

      return { data: authSession };
    } catch (err) {
      return { error: { message: 'Session retrieval failed', code: 'UNKNOWN_ERROR' } };
    }
  }

  async refreshSession(): Promise<{ data?: AuthSession; error?: AuthError }> {
    try {
      const { data, error } = await this.supabase.auth.refreshSession();

      if (error) {
        return { error: { message: error.message, code: error.message } };
      }

      if (!data.session) {
        return { data: undefined };
      }

      // Fetch user profile
      const userWithProfile = await this.fetchUserProfile(data.session.user.id);
      
      const authSession: AuthSession = {
        ...data.session,
        user: userWithProfile || data.session.user as AuthUser,
      };

      return { data: authSession };
    } catch (err) {
      return { error: { message: 'Session refresh failed', code: 'UNKNOWN_ERROR' } };
    }
  }

  private async checkEmailAllowlist(email: string): Promise<boolean> {
    try {
      const { data, error } = await this.supabase.rpc('check_email_allowlist', {
        email_to_check: email,
      });

      if (error) {
        console.warn('Email allowlist check failed:', error);
        return false;
      }

      return data === true;
    } catch (err) {
      console.warn('Email allowlist check error:', err);
      return false;
    }
  }

  private async initializeUserData(userId: string, userData: {
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
    role: UserRole;
  }): Promise<void> {
    try {
      await this.supabase.rpc('initialize_user_data', {
        user_id: userId,
        user_email: userData.email,
        first_name: userData.firstName,
        last_name: userData.lastName,
        user_phone: userData.phone || null,
        user_role: userData.role,
      });
    } catch (err) {
      console.error('Failed to initialize user data:', err);
      throw err;
    }
  }

  private async fetchUserProfile(userId: string): Promise<AuthUser | null> {
    try {
      const { data: profile, error } = await this.supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error || !profile) {
        return null;
      }

      const { data: user } = await this.supabase.auth.getUser();
      
      if (!user.user) {
        return null;
      }

      return {
        ...user.user,
        profile,
      } as AuthUser;
    } catch (err) {
      console.warn('Failed to fetch user profile:', err);
      return null;
    }
  }

  onAuthStateChange(callback: (session: AuthSession | null) => void) {
    return this.supabase.auth.onAuthStateChange(async (event, session) => {
      if (session) {
        const userWithProfile = await this.fetchUserProfile(session.user.id);
        const authSession: AuthSession = {
          ...session,
          user: userWithProfile || session.user as AuthUser,
        };
        callback(authSession);
      } else {
        callback(null);
      }
    });
  }
}

export const authService = new AuthService();
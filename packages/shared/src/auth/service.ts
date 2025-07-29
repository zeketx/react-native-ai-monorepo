import { createPayloadClient, type PayloadClient, type PayloadAPIResponse } from '../api/payload-client';
import type { 
  AuthUser, 
  AuthSession, 
  AuthError, 
  LoginCredentials, 
  RegisterCredentials,
  UserRole 
} from './types';

export class AuthService {
  private payloadClient: PayloadClient;

  constructor() {
    this.payloadClient = createPayloadClient();
  }

  async login(credentials: LoginCredentials): Promise<{ data?: AuthSession; error?: AuthError }> {
    try {
      const response = await this.payloadClient.auth.login(credentials);

      if (!response.success || !response.data) {
        return { 
          error: { 
            message: response.error?.message || 'Login failed',
            code: response.error?.code || 'UNKNOWN_ERROR'
          } 
        };
      }

      const authSession: AuthSession = {
        access_token: response.data.session.access_token,
        refresh_token: response.data.session.refresh_token,
        expires_at: response.data.session.expires_at,
        token_type: 'bearer',
        user: response.data.user,
      };

      return { data: authSession };
    } catch (err) {
      return { error: { message: 'Login failed', code: 'UNKNOWN_ERROR' } };
    }
  }

  async register(credentials: RegisterCredentials): Promise<{ data?: AuthSession; error?: AuthError }> {
    try {
      const response = await this.payloadClient.auth.register(credentials);

      if (!response.success) {
        return { 
          error: { 
            message: response.error?.message || 'Registration failed',
            code: response.error?.code || 'UNKNOWN_ERROR'
          } 
        };
      }

      // Registration successful, return undefined for data since user needs email verification
      return { data: undefined };
    } catch (err) {
      return { error: { message: 'Registration failed', code: 'UNKNOWN_ERROR' } };
    }
  }

  async logout(): Promise<{ error?: AuthError }> {
    try {
      const response = await this.payloadClient.auth.logout();
      
      if (!response.success) {
        return { 
          error: { 
            message: response.error?.message || 'Logout failed',
            code: response.error?.code || 'UNKNOWN_ERROR'
          } 
        };
      }

      return {};
    } catch (err) {
      return { error: { message: 'Logout failed', code: 'UNKNOWN_ERROR' } };
    }
  }

  async getCurrentSession(): Promise<{ data?: AuthSession; error?: AuthError }> {
    try {
      const response = await this.payloadClient.users.getCurrentUser();

      if (!response.success || !response.data) {
        return { data: undefined };
      }

      // Since we have the current user, we need to construct a session
      // This would typically be managed by stored auth data in the mobile app
      return { data: undefined }; // Session management handled at app level
    } catch (err) {
      return { error: { message: 'Session retrieval failed', code: 'UNKNOWN_ERROR' } };
    }
  }

  async refreshSession(refreshToken: string): Promise<{ data?: AuthSession; error?: AuthError }> {
    try {
      const response = await this.payloadClient.auth.refreshToken(refreshToken);

      if (!response.success || !response.data) {
        return { 
          error: { 
            message: response.error?.message || 'Session refresh failed',
            code: response.error?.code || 'UNKNOWN_ERROR'
          } 
        };
      }

      const authSession: AuthSession = {
        access_token: response.data.session.access_token,
        refresh_token: response.data.session.refresh_token,
        expires_at: response.data.session.expires_at,
        token_type: 'bearer',
        user: response.data.user,
      };

      return { data: authSession };
    } catch (err) {
      return { error: { message: 'Session refresh failed', code: 'UNKNOWN_ERROR' } };
    }
  }

  async getCurrentUser(): Promise<{ data?: AuthUser; error?: AuthError }> {
    try {
      const response = await this.payloadClient.users.getCurrentUser();

      if (!response.success || !response.data) {
        return { 
          error: { 
            message: response.error?.message || 'Failed to get current user',
            code: response.error?.code || 'UNKNOWN_ERROR'
          } 
        };
      }

      return { data: response.data };
    } catch (err) {
      return { error: { message: 'Failed to get current user', code: 'UNKNOWN_ERROR' } };
    }
  }

  async forgotPassword(email: string): Promise<{ error?: AuthError }> {
    try {
      const response = await this.payloadClient.auth.forgotPassword(email);

      if (!response.success) {
        return { 
          error: { 
            message: response.error?.message || 'Failed to send password reset email',
            code: response.error?.code || 'UNKNOWN_ERROR'
          } 
        };
      }

      return {};
    } catch (err) {
      return { error: { message: 'Failed to send password reset email', code: 'UNKNOWN_ERROR' } };
    }
  }

  async resetPassword(token: string, password: string, passwordConfirm: string): Promise<{ error?: AuthError }> {
    try {
      const response = await this.payloadClient.auth.resetPassword(token, password, passwordConfirm);

      if (!response.success) {
        return { 
          error: { 
            message: response.error?.message || 'Failed to reset password',
            code: response.error?.code || 'UNKNOWN_ERROR'
          } 
        };
      }

      return {};
    } catch (err) {
      return { error: { message: 'Failed to reset password', code: 'UNKNOWN_ERROR' } };
    }
  }

  // Auth state change is handled at the application level with Payload CMS
  // since Payload doesn't provide a built-in listener like Supabase
  onAuthStateChange(callback: (session: AuthSession | null) => void) {
    // In Payload CMS, auth state changes are managed through token refresh
    // and local storage. This method is kept for compatibility but should
    // be implemented by the consuming application using their preferred
    // state management solution (Context, Redux, etc.)
    console.warn('onAuthStateChange is not implemented for Payload CMS. Handle auth state in your app-level context.');
    return () => {}; // Return empty unsubscribe function
  }
}

export const authService = new AuthService();
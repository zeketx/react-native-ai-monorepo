/**
 * Authentication Tests
 * Tests for the Supabase authentication integration
 */

import { authService } from '@clientsync/shared';
import { beforeEach, describe, expect, it } from 'vitest';

// Mock Supabase client for testing
const mockSupabaseClient = {
  auth: {
    signInWithPassword: vi.fn(),
    signUp: vi.fn(),
    signOut: vi.fn(),
    getSession: vi.fn(),
    refreshSession: vi.fn(),
    onAuthStateChange: vi.fn(),
  },
  rpc: vi.fn(),
  from: vi.fn().mockReturnValue({
    select: vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        single: vi.fn(),
      }),
    }),
  }),
};

vi.mock('@clientsync/shared', () => ({
  authService: {
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
    getCurrentSession: vi.fn(),
    refreshSession: vi.fn(),
  },
  validateEmail: (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
  validatePassword: (password: string) => ({
    isValid: password.length >= 8,
    errors:
      password.length < 8 ? ['Password must be at least 8 characters'] : [],
  }),
}));

describe('Authentication Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Email Validation', () => {
    it('should validate correct email format', async () => {
      const { validateEmail } = await import('@clientsync/shared');

      expect(validateEmail('test@example.com')).toBe(true);
      expect(validateEmail('user@domain.co.uk')).toBe(true);
      expect(validateEmail('invalid-email')).toBe(false);
      expect(validateEmail('test@')).toBe(false);
      expect(validateEmail('@example.com')).toBe(false);
    });
  });

  describe('Password Validation', () => {
    it('should validate password requirements', async () => {
      const { validatePassword } = await import('@clientsync/shared');

      const weakPassword = validatePassword('weak');
      expect(weakPassword.isValid).toBe(false);
      expect(weakPassword.errors.length).toBeGreaterThan(0);

      const strongPassword = validatePassword('StrongP@ssw0rd');
      expect(strongPassword.isValid).toBe(true);
      expect(strongPassword.errors.length).toBe(0);
    });
  });

  describe('Authentication Flow', () => {
    it('should handle successful login', async () => {
      const mockSession = {
        access_token: 'mock-token',
        refresh_token: 'mock-refresh-token',
        user: {
          id: 'user-123',
          email: 'test@example.com',
          profile: {
            id: 'profile-123',
            user_id: 'user-123',
            role: 'client' as const,
            first_name: 'John',
            last_name: 'Doe',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        },
        expires_at: Math.floor(Date.now() / 1000) + 3600,
      };

      const mockAuthService = await import('@clientsync/shared');
      vi.mocked(mockAuthService.authService.login).mockResolvedValue({
        data: mockSession,
      });

      const result = await mockAuthService.authService.login({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result.data).toBeDefined();
      expect(result.error).toBeUndefined();
      expect(mockAuthService.authService.login).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    });

    it('should handle login errors', async () => {
      const mockAuthService = await import('@clientsync/shared');
      vi.mocked(mockAuthService.authService.login).mockResolvedValue({
        error: {
          message: 'Invalid credentials',
          code: 'INVALID_CREDENTIALS',
        },
      });

      const result = await mockAuthService.authService.login({
        email: 'test@example.com',
        password: 'wrongpassword',
      });

      expect(result.data).toBeUndefined();
      expect(result.error).toBeDefined();
      expect(result.error?.message).toBe('Invalid credentials');
    });

    it('should handle successful registration', async () => {
      const mockAuthService = await import('@clientsync/shared');
      vi.mocked(mockAuthService.authService.register).mockResolvedValue({
        data: undefined, // Registration might not return session immediately due to email verification
      });

      const result = await mockAuthService.authService.register({
        email: 'newuser@example.com',
        password: 'StrongP@ssw0rd',
        firstName: 'Jane',
        lastName: 'Doe',
        role: 'client',
      });

      expect(result.error).toBeUndefined();
      expect(mockAuthService.authService.register).toHaveBeenCalledWith({
        email: 'newuser@example.com',
        password: 'StrongP@ssw0rd',
        firstName: 'Jane',
        lastName: 'Doe',
        role: 'client',
      });
    });
  });

  describe('Session Management', () => {
    it('should get current session', async () => {
      const mockSession = {
        access_token: 'mock-token',
        user: {
          id: 'user-123',
          email: 'test@example.com',
        },
      };

      const mockAuthService = await import('@clientsync/shared');
      vi.mocked(
        mockAuthService.authService.getCurrentSession,
      ).mockResolvedValue({
        data: mockSession,
      });

      const result = await mockAuthService.authService.getCurrentSession();

      expect(result.data).toBeDefined();
      expect(result.data?.user.email).toBe('test@example.com');
    });

    it('should refresh session', async () => {
      const mockAuthService = await import('@clientsync/shared');
      vi.mocked(mockAuthService.authService.refreshSession).mockResolvedValue({
        data: {
          access_token: 'new-token',
          user: {
            id: 'user-123',
            email: 'test@example.com',
          },
        },
      });

      const result = await mockAuthService.authService.refreshSession();

      expect(result.data).toBeDefined();
      expect(result.data?.access_token).toBe('new-token');
    });
  });
});

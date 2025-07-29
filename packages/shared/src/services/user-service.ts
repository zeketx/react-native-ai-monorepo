/**
 * User Service
 * 
 * Service for managing user profile operations using Payload CMS API.
 * Provides user profile management, preferences, and account operations.
 */

import { createPayloadClient, type PayloadClient, type PayloadAPIResponse } from '../api/payload-client';
import type { BaseUser, UserPreferences } from '../types/user';
import type { AuthUser } from '../auth/types';

export interface UserUpdateData {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
}

export interface PasswordChangeData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

/**
 * User Service for profile and preference management
 */
export class UserService {
  private payloadClient: PayloadClient;

  constructor() {
    this.payloadClient = createPayloadClient();
  }

  /**
   * Get current user profile
   */
  async getCurrentUser(): Promise<PayloadAPIResponse<AuthUser>> {
    try {
      return await this.payloadClient.users.getCurrentUser();
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: error instanceof Error ? error.message : 'Failed to get current user',
        },
      };
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(data: UserUpdateData): Promise<PayloadAPIResponse<AuthUser>> {
    try {
      // Validate email format if provided
      if (data.email && !this.isValidEmail(data.email)) {
        return {
          success: false,
          error: {
            code: 'VALIDATION_FAILED',
            message: 'Invalid email format',
          },
        };
      }

      // Validate names if provided
      if (data.firstName && !this.isValidName(data.firstName)) {
        return {
          success: false,
          error: {
            code: 'VALIDATION_FAILED',
            message: 'First name must be at least 2 characters long',
          },
        };
      }

      if (data.lastName && !this.isValidName(data.lastName)) {
        return {
          success: false,
          error: {
            code: 'VALIDATION_FAILED',
            message: 'Last name must be at least 2 characters long',
          },
        };
      }

      return await this.payloadClient.users.updateProfile(data);
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: error instanceof Error ? error.message : 'Failed to update profile',
        },
      };
    }
  }

  /**
   * Update user preferences
   */
  async updatePreferences(preferences: Partial<UserPreferences>): Promise<PayloadAPIResponse<UserPreferences>> {
    try {
      return await this.payloadClient.users.updatePreferences(preferences);
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: error instanceof Error ? error.message : 'Failed to update preferences',
        },
      };
    }
  }

  /**
   * Change user password
   */
  async changePassword(data: PasswordChangeData): Promise<PayloadAPIResponse<{ message: string }>> {
    try {
      // Validate password confirmation
      if (data.newPassword !== data.confirmPassword) {
        return {
          success: false,
          error: {
            code: 'VALIDATION_FAILED',
            message: 'New password and confirmation do not match',
          },
        };
      }

      // Validate password strength
      if (!this.isValidPassword(data.newPassword)) {
        return {
          success: false,
          error: {
            code: 'VALIDATION_FAILED',
            message: 'Password must be at least 8 characters long and contain letters and numbers',
          },
        };
      }

      return await this.payloadClient.users.changePassword(data.currentPassword, data.newPassword);
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: error instanceof Error ? error.message : 'Failed to change password',
        },
      };
    }
  }

  /**
   * Delete user account
   */
  async deleteAccount(): Promise<PayloadAPIResponse<{ message: string }>> {
    try {
      return await this.payloadClient.users.deleteAccount();
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: error instanceof Error ? error.message : 'Failed to delete account',
        },
      };
    }
  }

  /**
   * Upload user avatar
   */
  async uploadAvatar(file: File): Promise<PayloadAPIResponse<{ avatarUrl: string }>> {
    try {
      // Validate file type
      if (!this.isValidImageFile(file)) {
        return {
          success: false,
          error: {
            code: 'VALIDATION_FAILED',
            message: 'Invalid file type. Please upload a PNG, JPEG, or WebP image.',
          },
        };
      }

      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        return {
          success: false,
          error: {
            code: 'VALIDATION_FAILED',
            message: 'File size must be less than 5MB',
          },
        };
      }

      // This would need to be implemented in the PayloadClient
      // For now, return not implemented
      return {
        success: false,
        error: {
          code: 'NOT_IMPLEMENTED',
          message: 'Avatar upload not yet implemented',
        },
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: error instanceof Error ? error.message : 'Failed to upload avatar',
        },
      };
    }
  }

  /**
   * Get user activity history
   */
  async getUserActivity(params?: { 
    page?: number; 
    limit?: number; 
    type?: string 
  }): Promise<PayloadAPIResponse<{ 
    activities: any[]; 
    totalPages: number; 
    page: number; 
    limit: number 
  }>> {
    try {
      // This would need to be implemented in the PayloadClient
      // For now, return not implemented
      return {
        success: false,
        error: {
          code: 'NOT_IMPLEMENTED',
          message: 'User activity tracking not yet implemented',
        },
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: error instanceof Error ? error.message : 'Failed to get user activity',
        },
      };
    }
  }

  /**
   * Validation helpers
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private isValidName(name: string): boolean {
    return name.trim().length >= 2;
  }

  private isValidPassword(password: string): boolean {
    // At least 8 characters, contains letters and numbers
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
  }

  private isValidImageFile(file: File): boolean {
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    return validTypes.includes(file.type);
  }

  /**
   * Update client configuration
   */
  updateConfig(config: any): void {
    this.payloadClient.updateConfig(config);
  }
}

/**
 * Default user service instance
 */
export const userService = new UserService();
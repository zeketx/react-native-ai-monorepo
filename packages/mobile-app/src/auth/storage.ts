/**
 * Secure Token Storage Service
 *
 * This service handles secure storage of authentication tokens using Expo SecureStore.
 * It provides encryption and secure storage for sensitive authentication data.
 */

import * as SecureStore from 'expo-secure-store';
import type { AuthSession, AuthUser } from './index.js';

// Storage keys
const STORAGE_KEYS = {
  ACCESS_TOKEN: 'clientsync_access_token',
  REFRESH_TOKEN: 'clientsync_refresh_token',
  USER_DATA: 'clientsync_user_data',
  TOKEN_EXPIRY: 'clientsync_token_expiry',
  BIOMETRIC_PREFERENCES: 'clientsync_biometric_prefs',
} as const;

// Storage options for SecureStore
const STORAGE_OPTIONS: SecureStore.SecureStoreOptions = {
  keychainService: 'clientsync-auth',
  requireAuthentication: false, // Set to true for biometric authentication
};

export interface StoredAuthData {
  user: AuthUser;
  session: AuthSession;
}

export interface BiometricPreferences {
  enabled: boolean;
  promptTitle?: string;
  promptSubtitle?: string;
  fallbackLabel?: string;
}

/**
 * Secure Token Storage Service
 */
export class SecureTokenStorage {
  /**
   * Store authentication data securely
   */
  static async storeAuthData(data: StoredAuthData): Promise<void> {
    try {
      // Store tokens
      await SecureStore.setItemAsync(
        STORAGE_KEYS.ACCESS_TOKEN,
        data.session.token,
        STORAGE_OPTIONS,
      );

      if (data.session.refreshToken) {
        await SecureStore.setItemAsync(
          STORAGE_KEYS.REFRESH_TOKEN,
          data.session.refreshToken,
          STORAGE_OPTIONS,
        );
      }

      // Store expiry time
      await SecureStore.setItemAsync(
        STORAGE_KEYS.TOKEN_EXPIRY,
        data.session.expiresAt.toISOString(),
        STORAGE_OPTIONS,
      );

      // Store user data (encrypted by SecureStore)
      await SecureStore.setItemAsync(
        STORAGE_KEYS.USER_DATA,
        JSON.stringify(data.user),
        STORAGE_OPTIONS,
      );

      console.log('✅ Auth data stored securely');
    } catch (error) {
      console.error('❌ Failed to store auth data:', error);
      throw new Error('Failed to store authentication data');
    }
  }

  /**
   * Retrieve stored authentication data
   */
  static async getAuthData(): Promise<StoredAuthData | null> {
    try {
      const [accessToken, refreshToken, userDataStr, expiryStr] =
        await Promise.all([
          SecureStore.getItemAsync(STORAGE_KEYS.ACCESS_TOKEN, STORAGE_OPTIONS),
          SecureStore.getItemAsync(STORAGE_KEYS.REFRESH_TOKEN, STORAGE_OPTIONS),
          SecureStore.getItemAsync(STORAGE_KEYS.USER_DATA, STORAGE_OPTIONS),
          SecureStore.getItemAsync(STORAGE_KEYS.TOKEN_EXPIRY, STORAGE_OPTIONS),
        ]);

      if (!accessToken || !userDataStr || !expiryStr) {
        return null;
      }

      const user: AuthUser = JSON.parse(userDataStr);
      const expiresAt = new Date(expiryStr);

      const session: AuthSession = {
        token: accessToken,
        refreshToken: refreshToken || undefined,
        expiresAt,
      };

      return { user, session };
    } catch (error) {
      console.error('❌ Failed to retrieve auth data:', error);
      return null;
    }
  }

  /**
   * Check if the stored token is valid (not expired)
   */
  static async isTokenValid(): Promise<boolean> {
    try {
      const expiryStr = await SecureStore.getItemAsync(
        STORAGE_KEYS.TOKEN_EXPIRY,
        STORAGE_OPTIONS,
      );

      if (!expiryStr) {
        return false;
      }

      const expiryDate = new Date(expiryStr);
      const now = new Date();

      // Add 5-minute buffer for token refresh
      const bufferTime = 5 * 60 * 1000; // 5 minutes in milliseconds
      return expiryDate.getTime() > now.getTime() + bufferTime;
    } catch (error) {
      console.error('❌ Failed to check token validity:', error);
      return false;
    }
  }

  /**
   * Get just the access token
   */
  static async getAccessToken(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(
        STORAGE_KEYS.ACCESS_TOKEN,
        STORAGE_OPTIONS,
      );
    } catch (error) {
      console.error('❌ Failed to get access token:', error);
      return null;
    }
  }

  /**
   * Get just the refresh token
   */
  static async getRefreshToken(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(
        STORAGE_KEYS.REFRESH_TOKEN,
        STORAGE_OPTIONS,
      );
    } catch (error) {
      console.error('❌ Failed to get refresh token:', error);
      return null;
    }
  }

  /**
   * Update just the access token (for token refresh)
   */
  static async updateAccessToken(
    newToken: string,
    expiresAt: Date,
  ): Promise<void> {
    try {
      await Promise.all([
        SecureStore.setItemAsync(
          STORAGE_KEYS.ACCESS_TOKEN,
          newToken,
          STORAGE_OPTIONS,
        ),
        SecureStore.setItemAsync(
          STORAGE_KEYS.TOKEN_EXPIRY,
          expiresAt.toISOString(),
          STORAGE_OPTIONS,
        ),
      ]);
      console.log('✅ Access token updated');
    } catch (error) {
      console.error('❌ Failed to update access token:', error);
      throw new Error('Failed to update access token');
    }
  }

  /**
   * Clear all stored authentication data
   */
  static async clearAuthData(): Promise<void> {
    try {
      await Promise.all([
        SecureStore.deleteItemAsync(STORAGE_KEYS.ACCESS_TOKEN, STORAGE_OPTIONS),
        SecureStore.deleteItemAsync(
          STORAGE_KEYS.REFRESH_TOKEN,
          STORAGE_OPTIONS,
        ),
        SecureStore.deleteItemAsync(STORAGE_KEYS.USER_DATA, STORAGE_OPTIONS),
        SecureStore.deleteItemAsync(STORAGE_KEYS.TOKEN_EXPIRY, STORAGE_OPTIONS),
        // Note: We don't clear biometric preferences on logout
      ]);
      console.log('✅ Auth data cleared');
    } catch (error) {
      console.error('❌ Failed to clear auth data:', error);
      // Don't throw here - we want logout to succeed even if clear fails
    }
  }

  /**
   * Check if user has stored authentication data
   */
  static async hasStoredAuth(): Promise<boolean> {
    try {
      const accessToken = await SecureStore.getItemAsync(
        STORAGE_KEYS.ACCESS_TOKEN,
        STORAGE_OPTIONS,
      );
      return accessToken !== null;
    } catch (error) {
      console.error('❌ Failed to check stored auth:', error);
      return false;
    }
  }

  /**
   * Get stored user data only (without tokens)
   */
  static async getStoredUser(): Promise<AuthUser | null> {
    try {
      const userDataStr = await SecureStore.getItemAsync(
        STORAGE_KEYS.USER_DATA,
        STORAGE_OPTIONS,
      );

      if (!userDataStr) {
        return null;
      }

      return JSON.parse(userDataStr);
    } catch (error) {
      console.error('❌ Failed to get stored user:', error);
      return null;
    }
  }

  /**
   * Update stored user data (for profile updates)
   */
  static async updateStoredUser(user: AuthUser): Promise<void> {
    try {
      await SecureStore.setItemAsync(
        STORAGE_KEYS.USER_DATA,
        JSON.stringify(user),
        STORAGE_OPTIONS,
      );
      console.log('✅ User data updated');
    } catch (error) {
      console.error('❌ Failed to update user data:', error);
      throw new Error('Failed to update user data');
    }
  }

  /**
   * Store biometric preferences
   */
  static async setBiometricPreferences(
    preferences: BiometricPreferences,
  ): Promise<void> {
    try {
      await SecureStore.setItemAsync(
        STORAGE_KEYS.BIOMETRIC_PREFERENCES,
        JSON.stringify(preferences),
        STORAGE_OPTIONS,
      );
      console.log('✅ Biometric preferences updated');
    } catch (error) {
      console.error('❌ Failed to store biometric preferences:', error);
      throw new Error('Failed to store biometric preferences');
    }
  }

  /**
   * Get biometric preferences
   */
  static async getBiometricPreferences(): Promise<BiometricPreferences | null> {
    try {
      const preferencesStr = await SecureStore.getItemAsync(
        STORAGE_KEYS.BIOMETRIC_PREFERENCES,
        STORAGE_OPTIONS,
      );

      if (!preferencesStr) {
        return null;
      }

      return JSON.parse(preferencesStr);
    } catch (error) {
      console.error('❌ Failed to get biometric preferences:', error);
      return null;
    }
  }

  /**
   * Clear biometric preferences
   */
  static async clearBiometricPreferences(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(
        STORAGE_KEYS.BIOMETRIC_PREFERENCES,
        STORAGE_OPTIONS,
      );
      console.log('✅ Biometric preferences cleared');
    } catch (error) {
      console.error('❌ Failed to clear biometric preferences:', error);
      // Don't throw - this is not critical
    }
  }
}

export default SecureTokenStorage;

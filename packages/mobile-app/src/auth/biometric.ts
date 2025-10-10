/**
 * Biometric Authentication Service
 *
 * Handles Face ID, Touch ID, and other biometric authentication methods.
 */

import * as LocalAuthentication from 'expo-local-authentication';
import { Platform } from 'react-native';
import { SecureTokenStorage } from './storage.js';

export interface BiometricCapabilities {
  availableTypes: Array<LocalAuthentication.AuthenticationType>;
  hasHardware: boolean;
  isEnrolled: boolean;
  supportedTypes: Array<string>;
}

export interface BiometricAuthResult {
  error?: string;
  errorCode?: string;
  success: boolean;
}

export interface BiometricPreferences {
  enabled: boolean;
  fallbackLabel?: string;
  promptSubtitle?: string;
  promptTitle?: string;
}

class BiometricAuthService {
  private static instance: BiometricAuthService;
  private capabilities: BiometricCapabilities | null = null;

  private constructor() {}

  static getInstance(): BiometricAuthService {
    if (!BiometricAuthService.instance) {
      BiometricAuthService.instance = new BiometricAuthService();
    }
    return BiometricAuthService.instance;
  }

  /**
   * Check device biometric capabilities
   */
  async getCapabilities(): Promise<BiometricCapabilities> {
    if (this.capabilities) {
      return this.capabilities;
    }

    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      const availableTypes =
        await LocalAuthentication.supportedAuthenticationTypesAsync();

      const supportedTypes = availableTypes.map((type) => {
        switch (type) {
          case LocalAuthentication.AuthenticationType.FINGERPRINT:
            return Platform.OS === 'ios' ? 'Touch ID' : 'Fingerprint';
          case LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION:
            return Platform.OS === 'ios' ? 'Face ID' : 'Face Recognition';
          case LocalAuthentication.AuthenticationType.IRIS:
            return 'Iris Recognition';
          default:
            return 'Biometric';
        }
      });

      this.capabilities = {
        availableTypes,
        hasHardware,
        isEnrolled,
        supportedTypes,
      };

      return this.capabilities;
    } catch (error) {
      console.error('Error checking biometric capabilities:', error);

      this.capabilities = {
        availableTypes: [],
        hasHardware: false,
        isEnrolled: false,
        supportedTypes: [],
      };

      return this.capabilities;
    }
  }

  /**
   * Check if biometric authentication is available and set up
   */
  async isAvailable(): Promise<boolean> {
    const capabilities = await this.getCapabilities();
    return capabilities.hasHardware && capabilities.isEnrolled;
  }

  /**
   * Get the primary biometric type name for display
   */
  async getPrimaryBiometricType(): Promise<string> {
    const capabilities = await this.getCapabilities();

    if (capabilities.supportedTypes.length === 0) {
      return 'Biometric';
    }

    // Prefer Face ID/Face Recognition over fingerprint
    const faceTypes = capabilities.supportedTypes.filter(
      (type) => type.includes('Face') || type.includes('Facial'),
    );

    if (faceTypes.length > 0) {
      return faceTypes[0];
    }

    return capabilities.supportedTypes[0];
  }

  /**
   * Authenticate using biometrics
   */
  async authenticate(options?: {
    cancelLabel?: string;
    disableDeviceFallback?: boolean;
    fallbackLabel?: string;
    promptMessage?: string;
  }): Promise<BiometricAuthResult> {
    try {
      const isAvailable = await this.isAvailable();

      if (!isAvailable) {
        return {
          error: 'Biometric authentication is not available on this device',
          errorCode: 'NOT_AVAILABLE',
          success: false,
        };
      }

      const biometricType = await this.getPrimaryBiometricType();

      const result = await LocalAuthentication.authenticateAsync({
        cancelLabel: options?.cancelLabel || 'Cancel',
        disableDeviceFallback: options?.disableDeviceFallback || false,
        fallbackLabel: options?.fallbackLabel || 'Use Password',
        promptMessage:
          options?.promptMessage || `Use ${biometricType} to sign in`,
      });

      if (result.success) {
        return { success: true };
      }

      // Handle different error types
      let errorMessage = 'Biometric authentication failed';
      let errorCode = 'UNKNOWN';

      if (result.error === 'user_cancel') {
        errorMessage = 'Authentication was cancelled';
        errorCode = 'USER_CANCEL';
      } else if (result.error === 'user_fallback') {
        errorMessage = 'User chose to use password instead';
        errorCode = 'USER_FALLBACK';
      } else if (result.error === 'system_cancel') {
        errorMessage = 'Authentication was cancelled by the system';
        errorCode = 'SYSTEM_CANCEL';
      } else if (result.error === 'not_enrolled') {
        errorMessage = 'No biometric data is enrolled on this device';
        errorCode = 'NOT_ENROLLED';
      } else if (result.error === 'not_available') {
        errorMessage = 'Biometric authentication is not available';
        errorCode = 'NOT_AVAILABLE';
      }

      return {
        error: errorMessage,
        errorCode,
        success: false,
      };
    } catch (error) {
      console.error('Biometric authentication error:', error);
      return {
        error: error instanceof Error ? error.message : 'Authentication failed',
        errorCode: 'UNKNOWN',
        success: false,
      };
    }
  }

  /**
   * Check if user has biometric login enabled in preferences
   */
  async isBiometricLoginEnabled(): Promise<boolean> {
    try {
      const preferences = await SecureTokenStorage.getBiometricPreferences();
      return preferences?.enabled || false;
    } catch (error) {
      console.error('Error checking biometric preferences:', error);
      return false;
    }
  }

  /**
   * Enable biometric login
   */
  async enableBiometricLogin(options?: {
    fallbackLabel?: string;
    promptSubtitle?: string;
    promptTitle?: string;
  }): Promise<BiometricAuthResult> {
    try {
      const isAvailable = await this.isAvailable();

      if (!isAvailable) {
        return {
          error: 'Biometric authentication is not available on this device',
          errorCode: 'NOT_AVAILABLE',
          success: false,
        };
      }

      // Authenticate first to confirm user identity
      const authResult = await this.authenticate({
        disableDeviceFallback: false,
        promptMessage: 'Authenticate to enable biometric login',
      });

      if (!authResult.success) {
        return authResult;
      }

      // Save preferences
      const preferences: BiometricPreferences = {
        enabled: true,
        fallbackLabel: options?.fallbackLabel,
        promptSubtitle: options?.promptSubtitle,
        promptTitle: options?.promptTitle,
      };

      await SecureTokenStorage.setBiometricPreferences(preferences);

      return { success: true };
    } catch (error) {
      console.error('Error enabling biometric login:', error);
      return {
        error:
          error instanceof Error
            ? error.message
            : 'Failed to enable biometric login',
        errorCode: 'UNKNOWN',
        success: false,
      };
    }
  }

  /**
   * Disable biometric login
   */
  async disableBiometricLogin(): Promise<void> {
    try {
      const preferences: BiometricPreferences = {
        enabled: false,
      };

      await SecureTokenStorage.setBiometricPreferences(preferences);
    } catch (error) {
      console.error('Error disabling biometric login:', error);
      throw new Error('Failed to disable biometric login');
    }
  }

  /**
   * Get biometric preferences
   */
  async getBiometricPreferences(): Promise<BiometricPreferences | null> {
    try {
      return await SecureTokenStorage.getBiometricPreferences();
    } catch (error) {
      console.error('Error getting biometric preferences:', error);
      return null;
    }
  }

  /**
   * Authenticate for login if biometrics are enabled
   */
  async authenticateForLogin(): Promise<BiometricAuthResult> {
    try {
      const isEnabled = await this.isBiometricLoginEnabled();

      if (!isEnabled) {
        return {
          error: 'Biometric login is not enabled',
          errorCode: 'NOT_ENABLED',
          success: false,
        };
      }

      const preferences = await this.getBiometricPreferences();
      const biometricType = await this.getPrimaryBiometricType();

      return await this.authenticate({
        cancelLabel: 'Cancel',
        disableDeviceFallback: false,
        fallbackLabel: preferences?.fallbackLabel || 'Use Password',
        promptMessage:
          preferences?.promptTitle || `Use ${biometricType} to sign in`,
      });
    } catch (error) {
      console.error('Error authenticating for login:', error);
      return {
        error: error instanceof Error ? error.message : 'Authentication failed',
        errorCode: 'UNKNOWN',
        success: false,
      };
    }
  }

  /**
   * Reset capabilities cache (useful after system changes)
   */
  resetCapabilities(): void {
    this.capabilities = null;
  }
}

// Export singleton instance
export const biometricAuthService = BiometricAuthService.getInstance();

// Export types and service
export default biometricAuthService;

/**
 * Enhanced Login Screen
 *
 * A polished login screen with form validation, biometric authentication,
 * and integration with Payload CMS.
 */

import { Ionicons } from '@expo/vector-icons';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  View,
} from 'react-native';
import biometricAuthService from 'src/auth/biometric.js';
// Auth
import type {
  LoginFormData,
  RegistrationFormData,
} from 'src/auth/validation.js';
import { loginSchema, registrationSchema } from 'src/auth/validation.js';
// UI Components
import Alert from 'src/ui/Alert.tsx';
import Button from 'src/ui/Button.tsx';
import Checkbox from 'src/ui/Checkbox.tsx';
import Input from 'src/ui/Input.tsx';
import Text from 'src/ui/Text.tsx';
import useViewerContext from 'src/user/useViewerContext.tsx';

type FormMode = 'login' | 'register' | 'forgotPassword';

export default function EnhancedLogin() {
  const router = useRouter();
  const { authError, isAuthenticated, isLoading, login, register } =
    useViewerContext();

  const [formMode, setFormMode] = useState<FormMode>('login');
  const [showBiometricOption, setShowBiometricOption] = useState(false);
  const [biometricType, setBiometricType] = useState<string>('Biometric');
  const [alertMessage, setAlertMessage] = useState<{
    message: string;
    variant: 'success' | 'error' | 'warning' | 'info';
  } | null>(null);

  // Login form
  const loginForm = useForm<LoginFormData>({
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
    resolver: zodResolver(loginSchema),
  });

  // Registration form
  const registrationForm = useForm<RegistrationFormData>({
    defaultValues: {
      confirmPassword: '',
      email: '',
      firstName: '',
      lastName: '',
      password: '',
    },
    resolver: zodResolver(registrationSchema),
  });

  // Forgot password form
  const forgotPasswordForm = useForm<{ email: string }>({
    defaultValues: {
      email: '',
    },
    resolver: zodResolver(loginSchema.pick({ email: true })),
  });

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/');
    }
  }, [isAuthenticated, router]);

  // Check biometric availability
  useEffect(() => {
    const checkBiometricAvailability = async () => {
      try {
        const isAvailable = await biometricAuthService.isAvailable();
        const isEnabled = await biometricAuthService.isBiometricLoginEnabled();
        const primaryType =
          await biometricAuthService.getPrimaryBiometricType();

        setShowBiometricOption(isAvailable);
        setBiometricType(primaryType);

        // Auto-trigger biometric auth if enabled and available
        if (isEnabled && isAvailable && formMode === 'login') {
          handleBiometricLogin();
        }
      } catch (error) {
        console.error('Error checking biometric availability:', error);
      }
    };

    checkBiometricAvailability();
  }, [formMode]);

  // Clear alerts when switching forms
  useEffect(() => {
    setAlertMessage(null);
  }, [formMode]);

  // Handle biometric authentication
  const handleBiometricLogin = useCallback(async () => {
    try {
      const result = await biometricAuthService.authenticateForLogin();

      if (result.success) {
        // Biometric auth successful - perform automatic login
        // This would typically involve retrieving stored credentials
        // For now, we'll show a success message
        setAlertMessage({
          message:
            'Biometric authentication successful! Please complete login.',
          variant: 'success',
        });
      } else if (result.errorCode !== 'USER_CANCEL') {
        setAlertMessage({
          message: result.error || 'Biometric authentication failed',
          variant: 'error',
        });
      }
    } catch {
      setAlertMessage({
        message: 'Biometric authentication error',
        variant: 'error',
      });
    }
  }, []);

  // Handle login form submission
  const handleLogin = useCallback(
    async (data: LoginFormData) => {
      try {
        setAlertMessage(null);

        const result = await login({
          email: data.email,
          password: data.password,
        });

        if (result.success) {
          // Enable biometric login if remember me is checked and biometrics are available
          if (data.rememberMe && showBiometricOption) {
            try {
              await biometricAuthService.enableBiometricLogin();
            } catch (error) {
              console.warn('Failed to enable biometric login:', error);
            }
          }

          setAlertMessage({
            message: 'Login successful! Redirecting...',
            variant: 'success',
          });
        } else {
          setAlertMessage({
            message: result.error || 'Login failed',
            variant: 'error',
          });
        }
      } catch {
        setAlertMessage({
          message: 'An unexpected error occurred',
          variant: 'error',
        });
      }
    },
    [login, showBiometricOption],
  );

  // Handle registration form submission
  const handleRegistration = useCallback(
    async (data: RegistrationFormData) => {
      try {
        setAlertMessage(null);

        const result = await register({
          confirmPassword: data.confirmPassword,
          email: data.email,
          firstName: data.firstName,
          lastName: data.lastName,
          password: data.password,
        });

        if (result.success) {
          setAlertMessage({
            message:
              result.message ||
              'Registration successful! Please check your email to verify your account.',
            variant: 'success',
          });

          // Switch to login form after successful registration
          setTimeout(() => {
            setFormMode('login');
            registrationForm.reset();
          }, 3000);
        } else {
          setAlertMessage({
            message: result.error || 'Registration failed',
            variant: 'error',
          });
        }
      } catch {
        setAlertMessage({
          message: 'An unexpected error occurred',
          variant: 'error',
        });
      }
    },
    [register, registrationForm],
  );

  // Handle forgot password
  const handleForgotPassword = useCallback(
    async (data: { email: string }) => {
      try {
        setAlertMessage(null);

        // Import auth service and call forgot password
        const { getAuthService } = await import('src/auth/service.js');
        const authService = getAuthService();

        const result = await authService.requestPasswordReset(data.email);

        if (result.success) {
          setAlertMessage({
            message:
              result.message ||
              'If an account with this email exists, a password reset link has been sent.',
            variant: 'success',
          });

          // Switch back to login after showing message
          setTimeout(() => {
            setFormMode('login');
            forgotPasswordForm.reset();
          }, 3000);
        } else {
          setAlertMessage({
            message: result.error || 'Failed to send password reset email',
            variant: 'error',
          });
        }
      } catch {
        setAlertMessage({
          message: 'An unexpected error occurred while sending the reset email',
          variant: 'error',
        });
      }
    },
    [forgotPasswordForm],
  );

  // Render login form
  const renderLoginForm = () => (
    <View>
      <Controller
        control={loginForm.control}
        name="email"
        render={({
          field: { onBlur, onChange, value },
          fieldState: { error },
        }) => (
          <Input
            error={error?.message}
            keyboardType="email-address"
            label="Email Address"
            leftIcon="mail"
            onBlur={onBlur}
            onChangeText={onChange}
            onSubmitEditing={() => loginForm.setFocus('password')}
            placeholder="Enter your email"
            returnKeyType="next"
            testID="login-email-input"
            value={value}
          />
        )}
      />

      <Controller
        control={loginForm.control}
        name="password"
        render={({
          field: { onBlur, onChange, value },
          fieldState: { error },
        }) => (
          <Input
            error={error?.message}
            label="Password"
            leftIcon="lock-closed"
            onBlur={onBlur}
            onChangeText={onChange}
            onSubmitEditing={loginForm.handleSubmit(handleLogin)}
            placeholder="Enter your password"
            returnKeyType="go"
            secureTextEntry
            testID="login-password-input"
            value={value}
          />
        )}
      />

      <Controller
        control={loginForm.control}
        name="rememberMe"
        render={({ field: { onChange, value } }) => (
          <Checkbox
            checked={value || false}
            label="Remember me and enable biometric login"
            onPress={() => onChange(!value)}
            testID="login-remember-checkbox"
          />
        )}
      />

      <Button
        fullWidth
        loading={isLoading}
        onPress={loginForm.handleSubmit(handleLogin)}
        testID="login-submit-button"
      >
        Sign In
      </Button>

      {showBiometricOption && (
        <Button
          className="mt-3"
          fullWidth
          leftIcon="finger-print"
          onPress={handleBiometricLogin}
          testID="biometric-login-button"
          variant="outline"
        >
          Use {biometricType}
        </Button>
      )}

      <View className="mt-4 flex-row items-center justify-between">
        <TouchableOpacity
          onPress={() => setFormMode('forgotPassword')}
          testID="forgot-password-link"
        >
          <Text className="text-blue-600 text-sm">Forgot password?</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setFormMode('register')}
          testID="switch-to-register-link"
        >
          <Text className="text-blue-600 text-sm">Create account</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // Render registration form
  const renderRegistrationForm = () => (
    <View>
      <View className="flex-row space-x-3">
        <View className="flex-1">
          <Controller
            control={registrationForm.control}
            name="firstName"
            render={({
              field: { onBlur, onChange, value },
              fieldState: { error },
            }) => (
              <Input
                error={error?.message}
                label="First Name"
                leftIcon="person"
                onBlur={onBlur}
                onChangeText={onChange}
                onSubmitEditing={() => registrationForm.setFocus('lastName')}
                placeholder="First name"
                returnKeyType="next"
                testID="register-firstname-input"
                value={value}
              />
            )}
          />
        </View>

        <View className="flex-1">
          <Controller
            control={registrationForm.control}
            name="lastName"
            render={({
              field: { onBlur, onChange, value },
              fieldState: { error },
            }) => (
              <Input
                error={error?.message}
                label="Last Name"
                leftIcon="person"
                onBlur={onBlur}
                onChangeText={onChange}
                onSubmitEditing={() => registrationForm.setFocus('email')}
                placeholder="Last name"
                returnKeyType="next"
                testID="register-lastname-input"
                value={value}
              />
            )}
          />
        </View>
      </View>

      <Controller
        control={registrationForm.control}
        name="email"
        render={({
          field: { onBlur, onChange, value },
          fieldState: { error },
        }) => (
          <Input
            error={error?.message}
            keyboardType="email-address"
            label="Email Address"
            leftIcon="mail"
            onBlur={onBlur}
            onChangeText={onChange}
            onSubmitEditing={() => registrationForm.setFocus('password')}
            placeholder="Enter your email"
            returnKeyType="next"
            testID="register-email-input"
            value={value}
          />
        )}
      />

      <Controller
        control={registrationForm.control}
        name="password"
        render={({
          field: { onBlur, onChange, value },
          fieldState: { error },
        }) => (
          <Input
            error={error?.message}
            label="Password"
            leftIcon="lock-closed"
            onBlur={onBlur}
            onChangeText={onChange}
            onSubmitEditing={() => registrationForm.setFocus('confirmPassword')}
            placeholder="Create a password"
            returnKeyType="next"
            secureTextEntry
            testID="register-password-input"
            value={value}
          />
        )}
      />

      <Controller
        control={registrationForm.control}
        name="confirmPassword"
        render={({
          field: { onBlur, onChange, value },
          fieldState: { error },
        }) => (
          <Input
            error={error?.message}
            label="Confirm Password"
            leftIcon="lock-closed"
            onBlur={onBlur}
            onChangeText={onChange}
            onSubmitEditing={registrationForm.handleSubmit(handleRegistration)}
            placeholder="Confirm your password"
            returnKeyType="go"
            secureTextEntry
            testID="register-confirm-password-input"
            value={value}
          />
        )}
      />

      <Button
        fullWidth
        loading={isLoading}
        onPress={registrationForm.handleSubmit(handleRegistration)}
        testID="register-submit-button"
      >
        Create Account
      </Button>

      <TouchableOpacity
        className="mt-4"
        onPress={() => setFormMode('login')}
        testID="switch-to-login-link"
      >
        <Text className="text-blue-600 text-center text-sm">
          Already have an account? Sign in
        </Text>
      </TouchableOpacity>
    </View>
  );

  // Render forgot password form
  const renderForgotPasswordForm = () => (
    <View>
      <Controller
        control={forgotPasswordForm.control}
        name="email"
        render={({
          field: { onBlur, onChange, value },
          fieldState: { error },
        }) => (
          <Input
            error={error?.message}
            keyboardType="email-address"
            label="Email Address"
            leftIcon="mail"
            onBlur={onBlur}
            onChangeText={onChange}
            onSubmitEditing={forgotPasswordForm.handleSubmit(
              handleForgotPassword,
            )}
            placeholder="Enter your email"
            returnKeyType="go"
            testID="forgot-password-email-input"
            value={value}
          />
        )}
      />

      <Button
        fullWidth
        loading={isLoading}
        onPress={forgotPasswordForm.handleSubmit(handleForgotPassword)}
        testID="forgot-password-submit-button"
      >
        Send Reset Link
      </Button>

      <TouchableOpacity
        className="mt-4"
        onPress={() => setFormMode('login')}
        testID="back-to-login-link"
      >
        <Text className="text-blue-600 text-center text-sm">
          Back to sign in
        </Text>
      </TouchableOpacity>
    </View>
  );

  const getFormTitle = () => {
    switch (formMode) {
      case 'login':
        return 'Welcome back';
      case 'register':
        return 'Create your account';
      case 'forgotPassword':
        return 'Reset your password';
      default:
        return 'Welcome';
    }
  };

  const getFormSubtitle = () => {
    switch (formMode) {
      case 'login':
        return 'Sign in to your account';
      case 'register':
        return 'Join ClientSync today';
      case 'forgotPassword':
        return 'Enter your email to receive a reset link';
      default:
        return '';
    }
  };

  if (isAuthenticated) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#3b82f6" size="large" />
          <Text className="text-gray-600 mt-4">Redirecting...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <View className="flex-1 justify-center p-6">
            {/* Header */}
            <View className="mb-8 items-center">
              <Ionicons color="#3b82f6" name="shield-checkmark" size={64} />

              <Text className="text-gray-900 mb-2 mt-4 text-center text-3xl font-bold">
                ClientSync
              </Text>

              <Text className="text-gray-800 mb-1 text-center text-xl font-semibold">
                {getFormTitle()}
              </Text>

              <Text className="text-gray-600 text-center">
                {getFormSubtitle()}
              </Text>
            </View>

            {/* Alert Messages */}
            {alertMessage && (
              <Alert
                dismissible
                message={alertMessage.message}
                onDismiss={() => setAlertMessage(null)}
                testID="login-alert"
                variant={alertMessage.variant}
              />
            )}

            {/* Auth Error from Context */}
            {authError && !alertMessage && (
              <Alert
                message={authError}
                testID="auth-error-alert"
                variant="error"
              />
            )}

            {/* Form Content */}
            <View className="mb-6">
              {formMode === 'login' && renderLoginForm()}
              {formMode === 'register' && renderRegistrationForm()}
              {formMode === 'forgotPassword' && renderForgotPasswordForm()}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

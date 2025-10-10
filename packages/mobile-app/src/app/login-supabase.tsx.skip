/**
 * Supabase Authentication Login Screen
 *
 * Updated login screen that uses the new Supabase authentication system
 * with the shared authentication package.
 */

import { validateEmail, validatePassword } from '@clientsync/shared';
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
import { z } from 'zod';
// New Supabase Auth
import { useAuth } from '../auth/AuthContext.js';
// UI Components
import Alert from '../ui/Alert.js';
import Button from '../ui/Button.js';
import Checkbox from '../ui/Checkbox.js';
import Input from '../ui/Input.js';
import Text from '../ui/Text.js';

// Validation schemas
const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .refine(validateEmail, 'Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional(),
});

const registerSchema = z
  .object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    email: z
      .string()
      .min(1, 'Email is required')
      .refine(validateEmail, 'Please enter a valid email address'),
    password: z
      .string()
      .min(1, 'Password is required')
      .refine((val) => validatePassword(val).isValid, {
        message:
          'Password must be at least 8 characters with uppercase, lowercase, number, and special character',
      }),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type LoginFormData = z.infer<typeof loginSchema>;
type RegisterFormData = z.infer<typeof registerSchema>;
type FormMode = 'login' | 'register';

export default function SupabaseLogin() {
  const router = useRouter();
  const { user, session, loading, initialized, login, register } = useAuth();

  const [formMode, setFormMode] = useState<FormMode>('login');
  const [alertMessage, setAlertMessage] = useState<{
    variant: 'success' | 'error' | 'warning' | 'info';
    message: string;
  } | null>(null);

  // Login form
  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  // Registration form
  const registrationForm = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  // Redirect if already authenticated
  useEffect(() => {
    if (initialized && user && session) {
      router.replace('/');
    }
  }, [initialized, user, session, router]);

  // Clear alerts when switching forms
  useEffect(() => {
    setAlertMessage(null);
  }, [formMode]);

  // Handle login form submission
  const handleLogin = useCallback(
    async (data: LoginFormData) => {
      try {
        setAlertMessage(null);

        const result = await login({
          email: data.email,
          password: data.password,
        });

        if (result.error) {
          setAlertMessage({
            variant: 'error',
            message: result.error.message || 'Login failed',
          });
        } else {
          setAlertMessage({
            variant: 'success',
            message: 'Login successful! Redirecting...',
          });

          // Navigation will be handled by useEffect when auth state updates
        }
      } catch (error) {
        setAlertMessage({
          variant: 'error',
          message: 'An unexpected error occurred',
        });
      }
    },
    [login],
  );

  // Handle registration form submission
  const handleRegistration = useCallback(
    async (data: RegisterFormData) => {
      try {
        setAlertMessage(null);

        const result = await register({
          email: data.email,
          password: data.password,
          firstName: data.firstName,
          lastName: data.lastName,
          role: 'client', // Default role for new registrations
        });

        if (result.error) {
          setAlertMessage({
            variant: 'error',
            message: result.error.message || 'Registration failed',
          });
        } else {
          setAlertMessage({
            variant: 'success',
            message:
              'Registration successful! Please check your email to verify your account.',
          });

          // Switch to login form after successful registration
          setTimeout(() => {
            setFormMode('login');
            registrationForm.reset();
          }, 3000);
        }
      } catch (error) {
        setAlertMessage({
          variant: 'error',
          message: 'An unexpected error occurred',
        });
      }
    },
    [register, registrationForm],
  );

  // Render login form
  const renderLoginForm = () => (
    <View>
      <Controller
        control={loginForm.control}
        name="email"
        render={({
          field: { onChange, onBlur, value },
          fieldState: { error },
        }) => (
          <Input
            label="Email Address"
            placeholder="Enter your email"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            keyboardType="email-address"
            leftIcon="mail"
            error={error?.message}
            testID="login-email-input"
            returnKeyType="next"
            onSubmitEditing={() => loginForm.setFocus('password')}
          />
        )}
      />

      <Controller
        control={loginForm.control}
        name="password"
        render={({
          field: { onChange, onBlur, value },
          fieldState: { error },
        }) => (
          <Input
            label="Password"
            placeholder="Enter your password"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            secureTextEntry
            leftIcon="lock-closed"
            error={error?.message}
            testID="login-password-input"
            returnKeyType="go"
            onSubmitEditing={loginForm.handleSubmit(handleLogin)}
          />
        )}
      />

      <Controller
        control={loginForm.control}
        name="rememberMe"
        render={({ field: { onChange, value } }) => (
          <Checkbox
            label="Remember me"
            checked={value || false}
            onPress={() => onChange(!value)}
            testID="login-remember-checkbox"
          />
        )}
      />

      <Button
        onPress={loginForm.handleSubmit(handleLogin)}
        loading={loading}
        fullWidth
        testID="login-submit-button"
      >
        Sign In
      </Button>

      <TouchableOpacity
        onPress={() => setFormMode('register')}
        className="mt-4"
        testID="switch-to-register-link"
      >
        <Text className="text-blue-600 text-center text-sm">
          Don't have an account? Create one
        </Text>
      </TouchableOpacity>
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
              field: { onChange, onBlur, value },
              fieldState: { error },
            }) => (
              <Input
                label="First Name"
                placeholder="First name"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                leftIcon="person"
                error={error?.message}
                testID="register-firstname-input"
                returnKeyType="next"
                onSubmitEditing={() => registrationForm.setFocus('lastName')}
              />
            )}
          />
        </View>

        <View className="flex-1">
          <Controller
            control={registrationForm.control}
            name="lastName"
            render={({
              field: { onChange, onBlur, value },
              fieldState: { error },
            }) => (
              <Input
                label="Last Name"
                placeholder="Last name"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                leftIcon="person"
                error={error?.message}
                testID="register-lastname-input"
                returnKeyType="next"
                onSubmitEditing={() => registrationForm.setFocus('email')}
              />
            )}
          />
        </View>
      </View>

      <Controller
        control={registrationForm.control}
        name="email"
        render={({
          field: { onChange, onBlur, value },
          fieldState: { error },
        }) => (
          <Input
            label="Email Address"
            placeholder="Enter your email"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            keyboardType="email-address"
            leftIcon="mail"
            error={error?.message}
            testID="register-email-input"
            returnKeyType="next"
            onSubmitEditing={() => registrationForm.setFocus('password')}
          />
        )}
      />

      <Controller
        control={registrationForm.control}
        name="password"
        render={({
          field: { onChange, onBlur, value },
          fieldState: { error },
        }) => (
          <Input
            label="Password"
            placeholder="Create a password"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            secureTextEntry
            leftIcon="lock-closed"
            error={error?.message}
            testID="register-password-input"
            returnKeyType="next"
            onSubmitEditing={() => registrationForm.setFocus('confirmPassword')}
          />
        )}
      />

      <Controller
        control={registrationForm.control}
        name="confirmPassword"
        render={({
          field: { onChange, onBlur, value },
          fieldState: { error },
        }) => (
          <Input
            label="Confirm Password"
            placeholder="Confirm your password"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            secureTextEntry
            leftIcon="lock-closed"
            error={error?.message}
            testID="register-confirm-password-input"
            returnKeyType="go"
            onSubmitEditing={registrationForm.handleSubmit(handleRegistration)}
          />
        )}
      />

      <Button
        onPress={registrationForm.handleSubmit(handleRegistration)}
        loading={loading}
        fullWidth
        testID="register-submit-button"
      >
        Create Account
      </Button>

      <TouchableOpacity
        onPress={() => setFormMode('login')}
        className="mt-4"
        testID="switch-to-login-link"
      >
        <Text className="text-blue-600 text-center text-sm">
          Already have an account? Sign in
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
      default:
        return '';
    }
  };

  // Show loading while initializing
  if (!initialized) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text className="text-gray-600 mt-4">Initializing...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Show redirecting if authenticated
  if (user && session) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#3b82f6" />
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
              <Ionicons name="shield-checkmark" size={64} color="#3b82f6" />

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
                variant={alertMessage.variant}
                message={alertMessage.message}
                dismissible
                onDismiss={() => setAlertMessage(null)}
                testID="login-alert"
              />
            )}

            {/* Form Content */}
            <View className="mb-6">
              {formMode === 'login' && renderLoginForm()}
              {formMode === 'register' && renderRegistrationForm()}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

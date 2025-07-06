/**
 * Enhanced Login Screen
 * 
 * A polished login screen with form validation, biometric authentication,
 * and integration with Payload CMS.
 */

import { zodResolver } from '@hookform/resolvers/zod'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { useCallback, useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  View,
} from 'react-native'

// UI Components
import Alert from 'src/ui/Alert.tsx'
import Button from 'src/ui/Button.tsx'
import Checkbox from 'src/ui/Checkbox.tsx'
import Input from 'src/ui/Input.tsx'
import Text from 'src/ui/Text.tsx'

// Auth
import type { LoginFormData, RegistrationFormData } from 'src/auth/validation.js'
import { loginSchema, registrationSchema } from 'src/auth/validation.js'
import biometricAuthService from 'src/auth/biometric.js'
import useViewerContext from 'src/user/useViewerContext.tsx'

type FormMode = 'login' | 'register' | 'forgotPassword'

export default function EnhancedLogin() {
  const router = useRouter()
  const { login, register, isLoading, authError, isAuthenticated } = useViewerContext()
  
  const [formMode, setFormMode] = useState<FormMode>('login')
  const [showBiometricOption, setShowBiometricOption] = useState(false)
  const [biometricType, setBiometricType] = useState<string>('Biometric')
  const [alertMessage, setAlertMessage] = useState<{
    variant: 'success' | 'error' | 'warning' | 'info'
    message: string
  } | null>(null)

  // Login form
  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  })

  // Registration form
  const registrationForm = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  })

  // Forgot password form
  const forgotPasswordForm = useForm<{ email: string }>({
    resolver: zodResolver(loginSchema.pick({ email: true })),
    defaultValues: {
      email: '',
    },
  })

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/')
    }
  }, [isAuthenticated, router])

  // Check biometric availability
  useEffect(() => {
    const checkBiometricAvailability = async () => {
      try {
        const isAvailable = await biometricAuthService.isAvailable()
        const isEnabled = await biometricAuthService.isBiometricLoginEnabled()
        const primaryType = await biometricAuthService.getPrimaryBiometricType()
        
        setShowBiometricOption(isAvailable)
        setBiometricType(primaryType)
        
        // Auto-trigger biometric auth if enabled and available
        if (isEnabled && isAvailable && formMode === 'login') {
          handleBiometricLogin()
        }
      } catch (error) {
        console.error('Error checking biometric availability:', error)
      }
    }

    checkBiometricAvailability()
  }, [formMode])

  // Clear alerts when switching forms
  useEffect(() => {
    setAlertMessage(null)
  }, [formMode])

  // Handle biometric authentication
  const handleBiometricLogin = useCallback(async () => {
    try {
      const result = await biometricAuthService.authenticateForLogin()
      
      if (result.success) {
        // Biometric auth successful - perform automatic login
        // This would typically involve retrieving stored credentials
        // For now, we'll show a success message
        setAlertMessage({
          variant: 'success',
          message: 'Biometric authentication successful! Please complete login.',
        })
      } else if (result.errorCode !== 'USER_CANCEL') {
        setAlertMessage({
          variant: 'error',
          message: result.error || 'Biometric authentication failed',
        })
      }
    } catch (error) {
      setAlertMessage({
        variant: 'error',
        message: 'Biometric authentication error',
      })
    }
  }, [])

  // Handle login form submission
  const handleLogin = useCallback(async (data: LoginFormData) => {
    try {
      setAlertMessage(null)
      
      const result = await login({
        email: data.email,
        password: data.password,
      })
      
      if (result.success) {
        // Enable biometric login if remember me is checked and biometrics are available
        if (data.rememberMe && showBiometricOption) {
          try {
            await biometricAuthService.enableBiometricLogin()
          } catch (error) {
            console.warn('Failed to enable biometric login:', error)
          }
        }
        
        setAlertMessage({
          variant: 'success',
          message: 'Login successful! Redirecting...',
        })
      } else {
        setAlertMessage({
          variant: 'error',
          message: result.error || 'Login failed',
        })
      }
    } catch (error) {
      setAlertMessage({
        variant: 'error',
        message: 'An unexpected error occurred',
      })
    }
  }, [login, showBiometricOption])

  // Handle registration form submission
  const handleRegistration = useCallback(async (data: RegistrationFormData) => {
    try {
      setAlertMessage(null)
      
      const result = await register({
        email: data.email,
        password: data.password,
        confirmPassword: data.confirmPassword,
        firstName: data.firstName,
        lastName: data.lastName,
      })
      
      if (result.success) {
        setAlertMessage({
          variant: 'success',
          message: result.message || 'Registration successful! Please check your email to verify your account.',
        })
        
        // Switch to login form after successful registration
        setTimeout(() => {
          setFormMode('login')
          registrationForm.reset()
        }, 3000)
      } else {
        setAlertMessage({
          variant: 'error',
          message: result.error || 'Registration failed',
        })
      }
    } catch (error) {
      setAlertMessage({
        variant: 'error',
        message: 'An unexpected error occurred',
      })
    }
  }, [register, registrationForm])

  // Handle forgot password
  const handleForgotPassword = useCallback(async (data: { email: string }) => {
    try {
      setAlertMessage(null)
      
      // Import auth service and call forgot password
      const { getAuthService } = await import('src/auth/service.js')
      const authService = getAuthService()
      
      const result = await authService.requestPasswordReset(data.email)
      
      if (result.success) {
        setAlertMessage({
          variant: 'success',
          message: result.message || 'If an account with this email exists, a password reset link has been sent.',
        })
        
        // Switch back to login after showing message
        setTimeout(() => {
          setFormMode('login')
          forgotPasswordForm.reset()
        }, 3000)
      } else {
        setAlertMessage({
          variant: 'error',
          message: result.error || 'Failed to send password reset email',
        })
      }
    } catch (error) {
      setAlertMessage({
        variant: 'error',
        message: 'An unexpected error occurred while sending the reset email',
      })
    }
  }, [forgotPasswordForm])

  // Render login form
  const renderLoginForm = () => (
    <View>
      <Controller
        control={loginForm.control}
        name="email"
        render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
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
        render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
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
            label="Remember me and enable biometric login"
            checked={value || false}
            onPress={() => onChange(!value)}
            testID="login-remember-checkbox"
          />
        )}
      />

      <Button
        onPress={loginForm.handleSubmit(handleLogin)}
        loading={isLoading}
        fullWidth
        testID="login-submit-button"
      >
        Sign In
      </Button>

      {showBiometricOption && (
        <Button
          variant="outline"
          leftIcon="finger-print"
          onPress={handleBiometricLogin}
          fullWidth
          testID="biometric-login-button"
          className="mt-3"
        >
          Use {biometricType}
        </Button>
      )}

      <View className="flex-row justify-between items-center mt-4">
        <TouchableOpacity
          onPress={() => setFormMode('forgotPassword')}
          testID="forgot-password-link"
        >
          <Text className="text-blue-600 text-sm">
            Forgot password?
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setFormMode('register')}
          testID="switch-to-register-link"
        >
          <Text className="text-blue-600 text-sm">
            Create account
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  )

  // Render registration form
  const renderRegistrationForm = () => (
    <View>
      <View className="flex-row space-x-3">
        <View className="flex-1">
          <Controller
            control={registrationForm.control}
            name="firstName"
            render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
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
            render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
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
        render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
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
        render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
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
        render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
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
        loading={isLoading}
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
        <Text className="text-center text-blue-600 text-sm">
          Already have an account? Sign in
        </Text>
      </TouchableOpacity>
    </View>
  )

  // Render forgot password form
  const renderForgotPasswordForm = () => (
    <View>
      <Controller
        control={forgotPasswordForm.control}
        name="email"
        render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
          <Input
            label="Email Address"
            placeholder="Enter your email"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            keyboardType="email-address"
            leftIcon="mail"
            error={error?.message}
            testID="forgot-password-email-input"
            returnKeyType="go"
            onSubmitEditing={forgotPasswordForm.handleSubmit(handleForgotPassword)}
          />
        )}
      />

      <Button
        onPress={forgotPasswordForm.handleSubmit(handleForgotPassword)}
        loading={isLoading}
        fullWidth
        testID="forgot-password-submit-button"
      >
        Send Reset Link
      </Button>

      <TouchableOpacity
        onPress={() => setFormMode('login')}
        className="mt-4"
        testID="back-to-login-link"
      >
        <Text className="text-center text-blue-600 text-sm">
          Back to sign in
        </Text>
      </TouchableOpacity>
    </View>
  )

  const getFormTitle = () => {
    switch (formMode) {
      case 'login':
        return 'Welcome back'
      case 'register':
        return 'Create your account'
      case 'forgotPassword':
        return 'Reset your password'
      default:
        return 'Welcome'
    }
  }

  const getFormSubtitle = () => {
    switch (formMode) {
      case 'login':
        return 'Sign in to your account'
      case 'register':
        return 'Join ClientSync today'
      case 'forgotPassword':
        return 'Enter your email to receive a reset link'
      default:
        return ''
    }
  }

  if (isAuthenticated) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text className="mt-4 text-gray-600">Redirecting...</Text>
        </View>
      </SafeAreaView>
    )
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
              
              <Text className="text-center text-3xl font-bold text-gray-900 mt-4 mb-2">
                ClientSync
              </Text>
              
              <Text className="text-center text-xl font-semibold text-gray-800 mb-1">
                {getFormTitle()}
              </Text>
              
              <Text className="text-center text-gray-600">
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

            {/* Auth Error from Context */}
            {authError && !alertMessage && (
              <Alert
                variant="error"
                message={authError}
                testID="auth-error-alert"
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
  )
}
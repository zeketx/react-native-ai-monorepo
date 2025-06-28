# Task: Implement Email Verification Flow

**ID:** CS-P1-007  
**Phase:** Authentication  
**Dependencies:** CS-P1-006

## Objective
Implement the email verification logic in the login screen that checks the allowlist and handles navigation based on whether the user exists or needs onboarding.

## Acceptance Criteria
- [ ] Email is validated before checking allowlist
- [ ] Allowlist check is performed on submit
- [ ] Non-allowed emails show appropriate error message
- [ ] Existing users proceed to password entry
- [ ] New users navigate to onboarding with email and tier
- [ ] Loading states work correctly

## Implementation Notes
1. Update login screen with verification logic (packages/mobile-app/src/app/login.tsx):
```typescript
import React, { useState } from 'react'
import { 
  View, 
  TextInput, 
  TouchableOpacity, 
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView,
  Alert
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Text } from '../ui/Text'
import { isValidEmail } from '@clientsync/shared'
import { useAllowlist } from '../hooks/useAllowlist'
import { supabase } from '../lib/supabase'

export default function LoginScreen() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  
  const { checkEmail } = useAllowlist()

  const handleEmailVerification = async () => {
    // Clear any previous errors
    setErrorMessage('')

    // Validate email format
    if (!isValidEmail(email)) {
      setErrorMessage('Please enter a valid email address')
      return
    }

    setIsLoading(true)

    try {
      // Check allowlist
      const allowlistResult = await checkEmail(email)
      
      if (!allowlistResult?.allowed) {
        Alert.alert(
          'Access Denied',
          'This email is not authorized to access ClientSync. Please contact your travel organizer for access.',
          [{ text: 'OK', style: 'default' }]
        )
        setIsLoading(false)
        return
      }

      // Store tier for later use
      await AsyncStorage.setItem('userTier', allowlistResult.tier || 'standard')

      // Check if user already exists
      const { data: existingUser } = await supabase
        .from('clients')
        .select('id, onboarding_completed')
        .eq('email', email.toLowerCase())
        .single()

      if (existingUser) {
        // Existing user - show password field
        setShowPassword(true)
      } else {
        // New user - navigate to onboarding
        router.push({
          pathname: '/(app)/onboarding/personal-details',
          params: { 
            email: email.toLowerCase(), 
            tier: allowlistResult.tier 
          }
        })
      }
    } catch (error) {
      console.error('Verification error:', error)
      setErrorMessage('Failed to verify email. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogin = async () => {
    if (!password) {
      setErrorMessage('Please enter your password')
      return
    }

    setIsLoading(true)
    setErrorMessage('')

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.toLowerCase(),
        password
      })

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          setErrorMessage('Incorrect password. Please try again.')
        } else {
          setErrorMessage('Login failed. Please try again.')
        }
        return
      }

      // Check if onboarding is complete
      const { data: clientData } = await supabase
        .from('clients')
        .select('onboarding_completed')
        .eq('id', data.user.id)
        .single()

      if (clientData?.onboarding_completed) {
        router.replace('/(app)/(tabs)')
      } else {
        router.replace('/(app)/onboarding/personal-details')
      }
    } catch (error) {
      console.error('Login error:', error)
      setErrorMessage('An unexpected error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = () => {
    if (showPassword) {
      handleLogin()
    } else {
      handleEmailVerification()
    }
  }

  const isEmailValid = email.length > 0 && isValidEmail(email)
  const canSubmit = showPassword ? isEmailValid && password.length > 0 : isEmailValid

  // Add password field to the form when showPassword is true
  // ... rest of the UI code with conditional password field
```

2. Add password field to UI (addition to the form section):
```typescript
{/* Password Input - shown after email verification */}
{showPassword && (
  <View className="mb-6">
    <Text className="text-gray-700 mb-2 font-medium">
      Password
    </Text>
    <View className={`border rounded-lg px-4 ${
      errorMessage ? 'border-red-500' : 'border-gray-300'
    }`}>
      <TextInput
        className="py-3 text-base text-gray-900"
        placeholder="Enter your password"
        placeholderTextColor="#9CA3AF"
        value={password}
        onChangeText={(text) => {
          setPassword(text)
          setErrorMessage('')
        }}
        secureTextEntry
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete="password"
        editable={!isLoading}
      />
    </View>
  </View>
)}

{/* Update button text based on state */}
<TouchableOpacity
  onPress={handleSubmit}
  disabled={!canSubmit || isLoading}
  className={`rounded-lg py-4 items-center ${
    canSubmit && !isLoading
      ? 'bg-blue-600' 
      : 'bg-gray-300'
  }`}
>
  {isLoading ? (
    <ActivityIndicator color="white" />
  ) : (
    <Text className="text-white font-semibold text-lg">
      {showPassword ? 'Sign In' : 'Continue'}
    </Text>
  )}
</TouchableOpacity>

{/* Add back button when password is shown */}
{showPassword && !isLoading && (
  <TouchableOpacity
    onPress={() => {
      setShowPassword(false)
      setPassword('')
      setErrorMessage('')
    }}
    className="mt-4"
  >
    <Text className="text-blue-600 text-center">
      Use a different email
    </Text>
  </TouchableOpacity>
)}
```

3. Create helper for first-time user setup:
```typescript
// packages/mobile-app/src/lib/auth-helpers.ts
export async function initializeNewUser(
  email: string, 
  password: string, 
  tier: string
) {
  // Sign up the user
  const { data: authData, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { 
        tier,
        email_confirmed: true // Since we verified via allowlist
      }
    }
  })

  if (signUpError) throw signUpError

  // Initialize client record (will be done by trigger)
  return authData
}
```

## Error Handling
- Invalid email format
- Email not in allowlist
- Network errors
- Invalid credentials
- Server errors

## Testing Scenarios
1. Test with email not in allowlist
2. Test with valid email (new user flow)
3. Test with existing user (password flow)
4. Test incorrect password
5. Test network offline
6. Test back navigation

## Estimated Effort
2 hours
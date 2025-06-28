# Task: Update Login Screen UI

**ID:** CS-P1-006  
**Phase:** Authentication  
**Dependencies:** CS-P1-005

## Objective
Update the existing login screen with a modern UI that includes email input field, validation feedback, and proper styling using NativeWind/Tailwind CSS.

## Acceptance Criteria
- [ ] Login screen has professional UI matching ClientSync brand
- [ ] Email input field with proper keyboard type
- [ ] Loading states are visually clear
- [ ] Error messages display appropriately
- [ ] Responsive design works on various screen sizes
- [ ] Follows accessibility best practices

## Implementation Notes
1. Update login screen UI (packages/mobile-app/src/app/login.tsx):
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
  Image
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Text } from '../ui/Text'
import { isValidEmail } from '@clientsync/shared'

export default function LoginScreen() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const handleContinue = async () => {
    // Implementation in next task
    console.log('Continue with:', email)
  }

  const isEmailValid = email.length > 0 && isValidEmail(email)

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView 
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          className="flex-1"
        >
          <View className="flex-1 px-6 py-8">
            {/* Logo Section */}
            <View className="items-center mt-12 mb-12">
              <View className="w-24 h-24 bg-blue-600 rounded-2xl items-center justify-center mb-6">
                <Text className="text-white text-4xl font-bold">CS</Text>
              </View>
              <Text className="text-3xl font-bold text-gray-900">ClientSync</Text>
              <Text className="text-lg text-gray-600 mt-2">
                Your Premium Travel Companion
              </Text>
            </View>

            {/* Form Section */}
            <View className="flex-1 max-w-sm w-full mx-auto">
              <View className="mb-8">
                <Text className="text-2xl font-semibold text-gray-900 mb-2">
                  Welcome back
                </Text>
                <Text className="text-gray-600">
                  Enter your email to access your travel dashboard
                </Text>
              </View>

              {/* Email Input */}
              <View className="mb-6">
                <Text className="text-gray-700 mb-2 font-medium">
                  Email Address
                </Text>
                <View className={`border rounded-lg px-4 ${
                  errorMessage ? 'border-red-500' : 'border-gray-300'
                }`}>
                  <TextInput
                    className="py-3 text-base text-gray-900"
                    placeholder="you@example.com"
                    placeholderTextColor="#9CA3AF"
                    value={email}
                    onChangeText={(text) => {
                      setEmail(text)
                      setErrorMessage('') // Clear error on type
                    }}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    autoComplete="email"
                    editable={!isLoading}
                  />
                </View>
                {errorMessage ? (
                  <Text className="text-red-500 text-sm mt-1">{errorMessage}</Text>
                ) : null}
              </View>

              {/* Submit Button */}
              <TouchableOpacity
                onPress={handleContinue}
                disabled={!isEmailValid || isLoading}
                className={`rounded-lg py-4 items-center ${
                  isEmailValid && !isLoading
                    ? 'bg-blue-600' 
                    : 'bg-gray-300'
                }`}
              >
                {isLoading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="text-white font-semibold text-lg">
                    Continue
                  </Text>
                )}
              </TouchableOpacity>

              {/* Help Text */}
              <View className="mt-8">
                <Text className="text-gray-500 text-sm text-center">
                  Access to ClientSync is by invitation only.
                </Text>
                <Text className="text-gray-500 text-sm text-center mt-1">
                  Contact your travel organizer if you need assistance.
                </Text>
              </View>
            </View>

            {/* Footer */}
            <View className="items-center pb-4">
              <Text className="text-gray-400 text-xs">
                Powered by ClientSync © 2024
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}
```

2. Create reusable input component (packages/mobile-app/src/ui/Input.tsx):
```typescript
import React from 'react'
import { TextInput, View, Text, TextInputProps } from 'react-native'

interface InputProps extends TextInputProps {
  label?: string
  error?: string
  containerClassName?: string
}

export function Input({ 
  label, 
  error, 
  containerClassName = '',
  className = '',
  ...props 
}: InputProps) {
  return (
    <View className={containerClassName}>
      {label && (
        <Text className="text-gray-700 mb-2 font-medium">
          {label}
        </Text>
      )}
      <View className={`border rounded-lg px-4 ${
        error ? 'border-red-500' : 'border-gray-300'
      }`}>
        <TextInput
          className={`py-3 text-base text-gray-900 ${className}`}
          placeholderTextColor="#9CA3AF"
          {...props}
        />
      </View>
      {error && (
        <Text className="text-red-500 text-sm mt-1">{error}</Text>
      )}
    </View>
  )
}
```

3. Add loading overlay component (packages/mobile-app/src/ui/LoadingOverlay.tsx):
```typescript
import React from 'react'
import { View, ActivityIndicator, Text } from 'react-native'

interface LoadingOverlayProps {
  visible: boolean
  message?: string
}

export function LoadingOverlay({ visible, message }: LoadingOverlayProps) {
  if (!visible) return null

  return (
    <View className="absolute inset-0 bg-black/50 items-center justify-center z-50">
      <View className="bg-white rounded-lg p-6 items-center">
        <ActivityIndicator size="large" color="#2563EB" />
        {message && (
          <Text className="text-gray-700 mt-3">{message}</Text>
        )}
      </View>
    </View>
  )
}
```

## Styling Guidelines
- Primary color: Blue-600 (#2563EB)
- Border radius: rounded-lg (8px)
- Padding: Consistent use of p-4, p-6
- Text hierarchy: Clear size differences
- Disabled states: Gray-300 background

## Accessibility
- Proper labels for screen readers
- Keyboard handling for form submission
- Color contrast meets WCAG AA standards
- Touch targets minimum 44x44 points

## Testing
- Test on various screen sizes
- Verify keyboard behavior (dismiss, next button)
- Check loading states
- Verify error message display
- Test with VoiceOver/TalkBack

## Estimated Effort
1.5 hours
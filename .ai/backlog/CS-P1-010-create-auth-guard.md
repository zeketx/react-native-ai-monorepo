# Task: Create Authentication Guard Component

**ID:** CS-P1-010  
**Phase:** Authentication  
**Dependencies:** CS-P1-008

## Objective
Create an AuthGuard component that protects routes by checking authentication status and redirecting unauthenticated users to the login screen.

## Acceptance Criteria
- [ ] AuthGuard checks authentication status
- [ ] Redirects to login if not authenticated
- [ ] Shows loading state during auth check
- [ ] Handles onboarding requirements
- [ ] Works with Expo Router navigation
- [ ] Properly typed with TypeScript

## Implementation Notes
1. Create AuthGuard component (packages/mobile-app/src/components/AuthGuard.tsx):
```typescript
import React, { useEffect } from 'react'
import { View, ActivityIndicator } from 'react-native'
import { router } from 'expo-router'
import { useViewer } from '../user/useViewerContext'
import { Text } from '../ui/Text'

interface AuthGuardProps {
  children: React.ReactNode
  requireOnboarding?: boolean
  loadingComponent?: React.ReactNode
}

export function AuthGuard({ 
  children, 
  requireOnboarding = false,
  loadingComponent
}: AuthGuardProps) {
  const { isAuthenticated, isLoading, isOnboarded } = useViewer()

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        // Redirect to login
        router.replace('/login')
      } else if (requireOnboarding && !isOnboarded) {
        // Redirect to onboarding if required and not completed
        router.replace('/(app)/onboarding/personal-details')
      }
    }
  }, [isAuthenticated, isLoading, isOnboarded, requireOnboarding])

  // Show loading state
  if (isLoading) {
    if (loadingComponent) {
      return <>{loadingComponent}</>
    }
    
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#2563EB" />
        <Text className="text-gray-600 mt-4">Loading...</Text>
      </View>
    )
  }

  // Don't render children if not authenticated
  if (!isAuthenticated) {
    return null
  }

  // Don't render children if onboarding required but not complete
  if (requireOnboarding && !isOnboarded) {
    return null
  }

  // Render protected content
  return <>{children}</>
}
```

2. Create app layout with auth protection (packages/mobile-app/src/app/(app)/_layout.tsx):
```typescript
import React, { useEffect } from 'react'
import { Stack } from 'expo-router'
import { AuthGuard } from '../../components/AuthGuard'
import { supabase } from '../../lib/supabase'
import { router } from 'expo-router'

export default function AppLayout() {
  useEffect(() => {
    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_OUT' && session === null) {
          router.replace('/login')
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  return (
    <AuthGuard>
      <Stack 
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right'
        }}
      >
        <Stack.Screen 
          name="(tabs)" 
          options={{ animation: 'none' }} 
        />
        <Stack.Screen 
          name="onboarding" 
          options={{ 
            presentation: 'modal',
            animation: 'slide_from_bottom' 
          }} 
        />
        <Stack.Screen 
          name="trip/[id]" 
          options={{ 
            presentation: 'modal',
            headerShown: true,
            title: 'Trip Details'
          }} 
        />
      </Stack>
    </AuthGuard>
  )
}
```

3. Create protected tab layout (packages/mobile-app/src/app/(app)/(tabs)/_layout.tsx):
```typescript
import React from 'react'
import { Tabs } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { AuthGuard } from '../../../components/AuthGuard'
import { TierBadge } from '../../../components/TierBadge'
import { useViewer } from '../../../user/useViewerContext'

export default function TabLayout() {
  const { tier } = useViewer()

  return (
    <AuthGuard requireOnboarding>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: '#2563EB',
          tabBarInactiveTintColor: '#6B7280',
          headerRight: () => tier ? (
            <View className="mr-4">
              <TierBadge tier={tier} size="small" />
            </View>
          ) : null
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Trips',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="airplane" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="person" size={size} color={color} />
            ),
          }}
        />
      </Tabs>
    </AuthGuard>
  )
}
```

4. Create custom loading screen (packages/mobile-app/src/components/LoadingScreen.tsx):
```typescript
import React from 'react'
import { View, ActivityIndicator } from 'react-native'
import { Text } from '../ui/Text'

interface LoadingScreenProps {
  message?: string
}

export function LoadingScreen({ message = 'Loading your travel experience...' }: LoadingScreenProps) {
  return (
    <View className="flex-1 items-center justify-center bg-white px-6">
      <View className="w-20 h-20 bg-blue-600 rounded-2xl items-center justify-center mb-6">
        <Text className="text-white text-2xl font-bold">CS</Text>
      </View>
      <ActivityIndicator size="large" color="#2563EB" />
      <Text className="text-gray-600 mt-4 text-center">
        {message}
      </Text>
    </View>
  )
}
```

5. Create route-specific guards (packages/mobile-app/src/components/OnboardingGuard.tsx):
```typescript
import React from 'react'
import { router } from 'expo-router'
import { useViewer } from '../user/useViewerContext'
import { LoadingScreen } from './LoadingScreen'

interface OnboardingGuardProps {
  children: React.ReactNode
}

export function OnboardingGuard({ children }: OnboardingGuardProps) {
  const { isAuthenticated, isOnboarded, isLoading } = useViewer()

  React.useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.replace('/login')
      } else if (isOnboarded) {
        // Already onboarded, redirect to main app
        router.replace('/(app)/(tabs)')
      }
    }
  }, [isAuthenticated, isOnboarded, isLoading])

  if (isLoading) {
    return <LoadingScreen message="Preparing your profile..." />
  }

  if (!isAuthenticated || isOnboarded) {
    return null
  }

  return <>{children}</>
}
```

## Usage Examples
```typescript
// Basic auth protection
<AuthGuard>
  <ProtectedContent />
</AuthGuard>

// Require onboarding completion
<AuthGuard requireOnboarding>
  <MainApp />
</AuthGuard>

// Custom loading component
<AuthGuard loadingComponent={<CustomLoader />}>
  <App />
</AuthGuard>

// In a screen component
export default function TripScreen() {
  return (
    <AuthGuard requireOnboarding>
      <View>
        {/* Screen content */}
      </View>
    </AuthGuard>
  )
}
```

## Testing Scenarios
1. Not authenticated → redirects to login
2. Authenticated but not onboarded → redirects to onboarding (if required)
3. Authenticated and onboarded → shows content
4. Sign out → redirects to login
5. Loading state displays correctly
6. Navigation transitions work smoothly

## Estimated Effort
1.5 hours
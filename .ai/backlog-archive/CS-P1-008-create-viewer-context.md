# Task: Create Enhanced ViewerContext

**ID:** CS-P1-008  
**Phase:** Authentication  
**Dependencies:** CS-P1-007

## Objective
Create an enhanced ViewerContext that manages authentication state, client data, and provides tier-based access helpers throughout the application.

## Acceptance Criteria
- [ ] Context provides user and session state
- [ ] Client data including tier is accessible
- [ ] Authentication methods are exposed
- [ ] Tier-based access helpers work correctly
- [ ] Context handles auth state changes
- [ ] Loading states are properly managed

## Implementation Notes
1. Create ViewerContext with full functionality (packages/mobile-app/src/user/useViewerContext.tsx):
```typescript
import React, { 
  createContext, 
  useContext, 
  useEffect, 
  useState, 
  ReactNode,
  useCallback 
} from 'react'
import { Session, User } from '@supabase/supabase-js'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { supabase } from '../lib/supabase'
import { Client, ClientTier } from '@clientsync/shared'

interface ViewerContextType {
  // Auth state
  user: User | null
  session: Session | null
  isAuthenticated: boolean
  isLoading: boolean

  // Client data
  client: Client | null
  tier: ClientTier | null
  isOnboarded: boolean

  // Methods
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, tier: ClientTier) => Promise<void>
  signOut: () => Promise<void>
  refreshClientData: () => Promise<void>

  // Tier-based helpers
  hasAccessToTier: (requiredTier: ClientTier) => boolean
  canAccessPremiumFeatures: () => boolean
  canAccessEliteFeatures: () => boolean
}

const ViewerContext = createContext<ViewerContextType | undefined>(undefined)

interface ViewerProviderProps {
  children: ReactNode
}

export function ViewerProvider({ children }: ViewerProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [client, setClient] = useState<Client | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Fetch client data from database
  const fetchClientData = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select(`
          *,
          profile:client_profiles(*),
          preferences:client_preferences(*)
        `)
        .eq('id', userId)
        .single()

      if (error) {
        console.error('Error fetching client data:', error)
        return
      }

      if (data) {
        const clientData: Client = {
          id: data.id,
          email: data.email,
          tier: data.tier,
          profile: data.profile || {
            first_name: '',
            last_name: '',
            phone: '',
            emergency_contact: { name: '', phone: '', relationship: '' }
          },
          preferences: data.preferences || {
            flight: { class: 'economy', airlines: [], seat_preference: 'aisle' },
            hotel: { category: '3-star', room_type: 'standard', bed_preference: 'double' },
            activities: { types: [], intensity: 'moderate', interests: [] },
            dining: { cuisines: [], dietary_restrictions: [], meal_times: {} }
          },
          created_at: data.created_at,
          updated_at: data.updated_at,
          onboarding_completed: data.onboarding_completed || false
        }
        
        setClient(clientData)
        
        // Cache tier for offline access
        await AsyncStorage.setItem('userTier', data.tier)
      }
    } catch (error) {
      console.error('Error in fetchClientData:', error)
    }
  }, [])

  // Initialize auth state
  useEffect(() => {
    let mounted = true

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (mounted) {
        setSession(session)
        setUser(session?.user ?? null)
        if (session?.user) {
          fetchClientData(session.user.id)
        }
        setIsLoading(false)
      }
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (mounted) {
          setSession(session)
          setUser(session?.user ?? null)
          
          if (session?.user) {
            await fetchClientData(session.user.id)
          } else {
            setClient(null)
          }
        }
      }
    )

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [fetchClientData])

  // Sign in method
  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email: email.toLowerCase(),
      password
    })
    
    if (error) throw error
  }, [])

  // Sign up method
  const signUp = useCallback(async (
    email: string, 
    password: string, 
    tier: ClientTier
  ) => {
    const { data, error } = await supabase.auth.signUp({
      email: email.toLowerCase(),
      password,
      options: {
        data: { tier }
      }
    })
    
    if (error) throw error

    // The database trigger will create the client record
    if (data.user) {
      await fetchClientData(data.user.id)
    }
  }, [fetchClientData])

  // Sign out method
  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    
    // Clear cached data
    await AsyncStorage.multiRemove(['userTier', 'onboardingData'])
    setClient(null)
  }, [])

  // Refresh client data
  const refreshClientData = useCallback(async () => {
    if (user) {
      await fetchClientData(user.id)
    }
  }, [user, fetchClientData])

  // Tier-based access helpers
  const tierHierarchy: Record<ClientTier, number> = {
    [ClientTier.STANDARD]: 1,
    [ClientTier.PREMIUM]: 2,
    [ClientTier.ELITE]: 3
  }

  const hasAccessToTier = useCallback((requiredTier: ClientTier): boolean => {
    if (!client?.tier) return false
    return tierHierarchy[client.tier] >= tierHierarchy[requiredTier]
  }, [client?.tier])

  const canAccessPremiumFeatures = useCallback(() => 
    hasAccessToTier(ClientTier.PREMIUM), 
    [hasAccessToTier]
  )
  
  const canAccessEliteFeatures = useCallback(() => 
    hasAccessToTier(ClientTier.ELITE), 
    [hasAccessToTier]
  )

  // Context value
  const value: ViewerContextType = {
    // Auth state
    user,
    session,
    isAuthenticated: !!session,
    isLoading,

    // Client data
    client,
    tier: client?.tier ?? null,
    isOnboarded: client?.onboarding_completed ?? false,

    // Methods
    signIn,
    signUp,
    signOut,
    refreshClientData,

    // Tier helpers
    hasAccessToTier,
    canAccessPremiumFeatures,
    canAccessEliteFeatures
  }

  return (
    <ViewerContext.Provider value={value}>
      {children}
    </ViewerContext.Provider>
  )
}

// Main hook
export function useViewer() {
  const context = useContext(ViewerContext)
  if (!context) {
    throw new Error('useViewer must be used within ViewerProvider')
  }
  return context
}

// Convenience hooks
export function useClientTier(): ClientTier | null {
  const { tier } = useViewer()
  return tier
}

export function useTierAccess() {
  const { hasAccessToTier, canAccessPremiumFeatures, canAccessEliteFeatures } = useViewer()
  return { hasAccessToTier, canAccessPremiumFeatures, canAccessEliteFeatures }
}

export function useIsAuthenticated(): boolean {
  const { isAuthenticated } = useViewer()
  return isAuthenticated
}
```

2. Update root layout to include ViewerProvider (packages/mobile-app/src/app/_layout.tsx):
```typescript
import { Slot } from 'expo-router'
import { ViewerProvider } from '../user/useViewerContext'
import { SafeAreaProvider } from 'react-native-safe-area-context'

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ViewerProvider>
        <Slot />
      </ViewerProvider>
    </SafeAreaProvider>
  )
}
```

## Usage Examples
```typescript
// In a component
function ProfileScreen() {
  const { client, tier, refreshClientData, isLoading } = useViewer()
  
  if (isLoading) {
    return <LoadingScreen />
  }
  
  return (
    <View>
      <Text>Welcome, {client?.profile.first_name}!</Text>
      <Text>Your tier: {tier}</Text>
      <Button onPress={refreshClientData} title="Refresh" />
    </View>
  )
}

// Tier-based content
function PremiumFeature() {
  const { canAccessPremiumFeatures } = useTierAccess()
  
  if (!canAccessPremiumFeatures()) {
    return <UpgradePrompt />
  }
  
  return <PremiumContent />
}
```

## Testing
- Sign in/out flow works
- Client data loads after auth
- Tier helpers return correct values
- Context persists across navigation
- Handles auth errors gracefully

## Estimated Effort
2 hours
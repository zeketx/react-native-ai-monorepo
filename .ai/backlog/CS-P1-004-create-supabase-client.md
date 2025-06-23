# Task: Create Supabase Client Configuration

**ID:** CS-P1-004  
**Phase:** Authentication  
**Dependencies:** CS-P1-003, CS-P0-017

## Objective
Set up the Supabase client configuration in the mobile app with proper authentication storage and session management using AsyncStorage.

## Acceptance Criteria
- [ ] Supabase client is properly configured
- [ ] AsyncStorage is set up for auth persistence
- [ ] URL polyfill is configured for React Native
- [ ] Client uses environment variables
- [ ] TypeScript types are properly defined

## Implementation Notes
1. Install required dependencies:
```bash
cd packages/mobile-app
pnpm add @supabase/supabase-js @react-native-async-storage/async-storage react-native-url-polyfill
```

2. Create Supabase client (packages/mobile-app/src/lib/supabase.ts):
```typescript
import { createClient } from '@supabase/supabase-js'
import AsyncStorage from '@react-native-async-storage/async-storage'
import 'react-native-url-polyfill/auto'

// Environment variables
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Please check your .env file.'
  )
}

// Create Supabase client with custom storage
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})

// Type exports for better TypeScript support
export type SupabaseClient = typeof supabase
```

3. Create AsyncStorage adapter for web compatibility (packages/mobile-app/src/lib/async-storage-polyfill.ts):
```typescript
// Polyfill for web testing (if needed)
const createWebStorage = () => {
  const storage: any = {}
  
  return {
    getItem: async (key: string) => storage[key] || null,
    setItem: async (key: string, value: string) => {
      storage[key] = value
    },
    removeItem: async (key: string) => {
      delete storage[key]
    },
    clear: async () => {
      Object.keys(storage).forEach(key => delete storage[key])
    },
  }
}

// Export platform-specific storage
export const platformStorage = 
  typeof window !== 'undefined' && !window.ReactNativeWebView
    ? createWebStorage()
    : AsyncStorage
```

4. Configure metro to handle environment variables (update metro.config.cjs if needed):
```javascript
// Ensure process.env works in React Native
module.exports = {
  transformer: {
    minifierConfig: {
      keep_fns: true,
    },
  },
}
```

5. Create type definitions for database (packages/mobile-app/src/lib/database.types.ts):
```typescript
// This file can be generated using Supabase CLI
// For now, create manual types based on our schema

export type Database = {
  public: {
    Tables: {
      clients: {
        Row: {
          id: string
          email: string
          tier: 'standard' | 'premium' | 'elite'
          profile_id: string | null
          preferences_id: string | null
          onboarding_completed: boolean
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['clients']['Row'], 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['clients']['Insert']>
      }
      allowlist: {
        Row: {
          id: string
          email: string
          tier: 'standard' | 'premium' | 'elite'
          added_by: string | null
          added_at: string
        }
      }
      // Add other tables as needed
    }
    Functions: {
      check_email_allowlist: {
        Args: { email_to_check: string }
        Returns: { allowed: boolean; tier: string | null }
      }
    }
  }
}
```

6. Create auth helpers (packages/mobile-app/src/lib/auth-helpers.ts):
```typescript
import { supabase } from './supabase'

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error) throw error
  return user
}

export async function refreshSession() {
  const { data: { session }, error } = await supabase.auth.refreshSession()
  if (error) throw error
  return session
}
```

## Testing
```typescript
// Test connection
async function testSupabaseConnection() {
  try {
    const { data, error } = await supabase
      .from('allowlist')
      .select('count')
      .limit(1)
    
    if (error) throw error
    console.log('✅ Supabase connected successfully')
  } catch (error) {
    console.error('❌ Supabase connection failed:', error)
  }
}
```

## Notes
- AsyncStorage is used for persisting auth tokens
- URL polyfill is required for React Native
- detectSessionInUrl is false as we don't use magic links
- Environment variables must use EXPO_PUBLIC_ prefix

## Estimated Effort
1 hour
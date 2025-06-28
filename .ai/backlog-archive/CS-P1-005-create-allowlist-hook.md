# Task: Create useAllowlist Hook

**ID:** CS-P1-005  
**Phase:** Authentication  
**Dependencies:** CS-P1-004

## Objective
Create a custom React hook that provides an interface for checking email addresses against the allowlist using the deployed edge function.

## Acceptance Criteria
- [ ] Hook handles loading states
- [ ] Hook manages error states
- [ ] Returns allowed status and tier
- [ ] Properly typed with TypeScript
- [ ] Includes error handling
- [ ] Memoizes results to avoid repeated calls

## Implementation Notes
1. Create the hook (packages/mobile-app/src/hooks/useAllowlist.ts):
```typescript
import { useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { ClientTier } from '@clientsync/shared'

interface AllowlistCheckResult {
  allowed: boolean
  tier: ClientTier | null
}

interface UseAllowlistReturn {
  checkEmail: (email: string) => Promise<AllowlistCheckResult | null>
  loading: boolean
  error: string | null
  clearError: () => void
}

export function useAllowlist(): UseAllowlistReturn {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Cache results to avoid repeated calls
  const cache = useRef<Map<string, AllowlistCheckResult>>(new Map())

  const checkEmail = useCallback(async (email: string): Promise<AllowlistCheckResult | null> => {
    // Normalize email
    const normalizedEmail = email.toLowerCase().trim()
    
    // Check cache first
    if (cache.current.has(normalizedEmail)) {
      return cache.current.get(normalizedEmail)!
    }

    setLoading(true)
    setError(null)

    try {
      const { data, error: fnError } = await supabase.functions.invoke('check-allowlist', {
        body: { email: normalizedEmail }
      })

      if (fnError) {
        throw new Error(fnError.message || 'Failed to check allowlist')
      }

      const result: AllowlistCheckResult = {
        allowed: data?.allowed || false,
        tier: data?.tier || null
      }

      // Cache the result
      cache.current.set(normalizedEmail, result)

      return result
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An unexpected error occurred'
      setError(message)
      console.error('Allowlist check error:', err)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    checkEmail,
    loading,
    error,
    clearError
  }
}
```

2. Create a version with debouncing for form inputs (packages/mobile-app/src/hooks/useAllowlistDebounced.ts):
```typescript
import { useState, useCallback, useRef } from 'react'
import { useAllowlist } from './useAllowlist'
import { ClientTier } from '@clientsync/shared'

interface UseAllowlistDebouncedReturn {
  checkEmail: (email: string) => void
  result: AllowlistCheckResult | null
  loading: boolean
  error: string | null
  clearError: () => void
}

export function useAllowlistDebounced(delay: number = 500): UseAllowlistDebouncedReturn {
  const { checkEmail: checkEmailBase, loading, error, clearError } = useAllowlist()
  const [result, setResult] = useState<AllowlistCheckResult | null>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const checkEmail = useCallback((email: string) => {
    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    // Don't check empty or invalid emails
    if (!email || email.length < 3) {
      setResult(null)
      return
    }

    // Set new timeout
    timeoutRef.current = setTimeout(async () => {
      const checkResult = await checkEmailBase(email)
      setResult(checkResult)
    }, delay)
  }, [checkEmailBase, delay])

  return {
    checkEmail,
    result,
    loading,
    error,
    clearError
  }
}
```

3. Create a test component to verify the hook works:
```typescript
// packages/mobile-app/src/components/AllowlistTest.tsx
import React, { useState } from 'react'
import { View, TextInput, Text, ActivityIndicator } from 'react-native'
import { useAllowlist } from '../hooks/useAllowlist'

export function AllowlistTest() {
  const [email, setEmail] = useState('')
  const { checkEmail, loading, error } = useAllowlist()
  const [result, setResult] = useState<any>(null)

  const handleCheck = async () => {
    const checkResult = await checkEmail(email)
    setResult(checkResult)
  }

  return (
    <View style={{ padding: 20 }}>
      <TextInput
        value={email}
        onChangeText={setEmail}
        placeholder="Enter email"
        style={{ borderWidth: 1, padding: 10, marginBottom: 10 }}
      />
      <Button title="Check" onPress={handleCheck} disabled={loading} />
      
      {loading && <ActivityIndicator />}
      {error && <Text style={{ color: 'red' }}>Error: {error}</Text>}
      {result && (
        <View>
          <Text>Allowed: {result.allowed ? 'Yes' : 'No'}</Text>
          {result.tier && <Text>Tier: {result.tier}</Text>}
        </View>
      )}
    </View>
  )
}
```

## Usage Example
```typescript
// In a component
function EmailVerificationForm() {
  const { checkEmail, loading, error } = useAllowlist()
  
  const handleSubmit = async (email: string) => {
    const result = await checkEmail(email)
    
    if (!result?.allowed) {
      Alert.alert('Access Denied', 'This email is not authorized.')
      return
    }
    
    // Proceed with tier info
    console.log('User tier:', result.tier)
    navigation.navigate('Onboarding', { email, tier: result.tier })
  }
}
```

## Testing
- Test with allowed emails
- Test with non-allowed emails
- Test error handling (network offline)
- Test loading states
- Verify caching works (check console for duplicate calls)

## Estimated Effort
1 hour
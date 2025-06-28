// Supabase client configuration for authentication
import { createClient } from '@supabase/supabase-js'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { AuthConfig } from './types.js'

/**
 * Supabase client instance for authentication
 */
let supabaseClient: SupabaseClient | null = null

/**
 * Initialize Supabase client with configuration
 */
export function initializeSupabaseClient(config: AuthConfig): SupabaseClient {
  if (!config.supabaseUrl) {
    throw new Error('Supabase URL is required for authentication')
  }
  
  if (!config.supabaseAnonKey) {
    throw new Error('Supabase anonymous key is required for authentication')
  }
  
  // Validate URL format
  try {
    new URL(config.supabaseUrl)
  } catch {
    throw new Error('Invalid Supabase URL format')
  }
  
  supabaseClient = createClient(config.supabaseUrl, config.supabaseAnonKey, {
    auth: {
      autoRefreshToken: config.autoRefreshToken ?? true,
      persistSession: config.persistSession ?? true,
      detectSessionInUrl: config.detectSessionInUrl ?? true,
      flowType: 'pkce'
    },
    realtime: {
      params: {
        eventsPerSecond: 10
      }
    }
  })
  
  return supabaseClient
}

/**
 * Get the current Supabase client instance
 */
export function getSupabaseClient(): SupabaseClient {
  if (!supabaseClient) {
    throw new Error('Supabase client not initialized. Call initializeSupabaseClient() first.')
  }
  
  return supabaseClient
}

/**
 * Check if Supabase client is initialized
 */
export function isClientInitialized(): boolean {
  return supabaseClient !== null
}

/**
 * Reset the Supabase client (useful for testing)
 */
export function resetSupabaseClient(): void {
  supabaseClient = null
}

/**
 * Create a Supabase client with environment variables
 * This is a convenience function for common use cases
 */
export function createSupabaseClientFromEnv(): SupabaseClient {
  const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL
  const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY
  
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing required environment variables: SUPABASE_URL and SUPABASE_ANON_KEY')
  }
  
  return initializeSupabaseClient({
    supabaseUrl,
    supabaseAnonKey,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  })
}
/**
 * Supabase Connection Test
 * 
 * This file tests the Supabase connection and database access
 * to verify that the foundation setup is working correctly.
 */

import { createClient } from '@supabase/supabase-js'

// Environment variables
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY

console.log('🔍 Testing Supabase connection...')

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables')
  console.error('Required: EXPO_PUBLIC_SUPABASE_URL, EXPO_PUBLIC_SUPABASE_ANON_KEY')
  console.log('💡 Make sure to copy .env.example to .env.local and fill in your values')
  process.exit(1)
}

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Test connection function
async function testConnection() {
  try {
    console.log('📡 Testing Supabase connection...')
    console.log('🔗 Supabase URL:', supabaseUrl.substring(0, 30) + '...')
    
    // Test 1: Basic connection test
    const { data, error } = await supabase
      .from('allowlist')
      .select('count')
      .limit(1)
    
    if (error) {
      console.error('❌ Supabase connection error:', error.message)
      
      // Provide helpful error messages
      if (error.message.includes('relation "allowlist" does not exist')) {
        console.log('💡 Database table "allowlist" not found. Expected for new setup.')
        console.log('📝 This table should be created in previous foundation tasks.')
        return false
      } else if (error.message.includes('Invalid API key')) {
        console.log('💡 Invalid API key. Check your EXPO_PUBLIC_SUPABASE_ANON_KEY')
        return false
      } else if (error.message.includes('Invalid URL')) {
        console.log('💡 Invalid URL. Check your EXPO_PUBLIC_SUPABASE_URL')
        return false
      }
      
      return false
    }
    
    console.log('✅ Supabase connected successfully')
    console.log('📊 Query response received')
    return true
    
  } catch (error) {
    console.error('❌ Connection test failed:', error)
    return false
  }
}

// Test authentication
async function testAuth() {
  try {
    console.log('🔐 Testing Supabase auth...')
    
    const { data, error } = await supabase.auth.getSession()
    
    if (error) {
      console.error('❌ Auth test error:', error.message)
      return false
    }
    
    console.log('✅ Auth service accessible')
    console.log('👤 Current session:', data.session ? 'Active' : 'No session')
    return true
    
  } catch (error) {
    console.error('❌ Auth test failed:', error)
    return false
  }
}

// Test database schema (if tables exist)
async function testDatabaseSchema() {
  console.log('🗄️  Testing database schema...')
  
  const tables = [
    'allowlist',
    'user_profiles', 
    'client_profiles',
    'trips',
    'audit_logs'
  ]
  
  const results = []
  
  for (const table of tables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('count')
        .limit(1)
      
      if (error) {
        if (error.message.includes(`relation "${table}" does not exist`)) {
          console.log(`⚠️  Table "${table}" not found (expected for new setup)`)
          results.push({ table, status: 'missing', expected: true })
        } else {
          console.log(`❌ Table "${table}" error:`, error.message)
          results.push({ table, status: 'error', error: error.message })
        }
      } else {
        console.log(`✅ Table "${table}" accessible`)
        results.push({ table, status: 'accessible' })
      }
    } catch (error) {
      console.log(`❌ Table "${table}" test failed:`, error)
      results.push({ table, status: 'failed', error })
    }
  }
  
  return results
}

// Main test function
async function runTests() {
  console.log('\n🧪 Starting Supabase Foundation Tests...\n')
  
  const results = {
    connection: false,
    auth: false,
    schema: []
  }
  
  // Test 1: Connection
  results.connection = await testConnection()
  console.log('')
  
  // Test 2: Auth (only if connection works)
  if (results.connection) {
    results.auth = await testAuth()
    console.log('')
    
    // Test 3: Database Schema
    results.schema = await testDatabaseSchema()
    console.log('')
  }
  
  // Summary
  console.log('📋 Supabase Test Summary:')
  console.log(`- Connection: ${results.connection ? '✅' : '❌'}`)
  console.log(`- Authentication: ${results.auth ? '✅' : '❌'}`)
  
  const accessibleTables = results.schema.filter(r => r.status === 'accessible').length
  const totalTables = results.schema.length
  console.log(`- Database Schema: ${accessibleTables}/${totalTables} tables accessible`)
  
  if (results.connection && results.auth) {
    console.log('\n🎉 Supabase foundation is ready!')
    return true
  } else {
    console.log('\n🔧 Supabase needs configuration. Check environment variables and project setup.')
    return false
  }
}

// Export for use in other tests
export {
  supabase,
  testConnection,
  testAuth,
  testDatabaseSchema,
  runTests
}

// Run tests if this file is executed directly
if (require.main === module) {
  runTests().then((success) => {
    process.exit(success ? 0 : 1)
  }).catch((error) => {
    console.error('❌ Test execution failed:', error)
    process.exit(1)
  })
}
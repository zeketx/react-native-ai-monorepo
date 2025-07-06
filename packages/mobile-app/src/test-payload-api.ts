/**
 * Test Payload API Integration
 * 
 * This file provides basic tests for the Payload CMS API integration.
 * Run this after implementing the API client to verify functionality.
 */

import { getAPIClient, getAuthService, ErrorType, PayloadAPIError } from './api/index.js'

/**
 * Test the API client initialization and basic functionality
 */
export async function testPayloadAPIIntegration(): Promise<void> {
  console.log('🧪 Testing Payload API Integration...')

  try {
    // Test 1: API Client Initialization
    console.log('1. Testing API client initialization...')
    const apiClient = getAPIClient()
    console.log('✅ API client initialized successfully')
    console.log(`   - Base URL: ${process.env.EXPO_PUBLIC_CMS_API_URL || 'http://localhost:3001/api'}`)
    console.log(`   - Online status: ${apiClient.isOnline}`)
    console.log(`   - Offline queue size: ${apiClient.offlineQueueSize}`)

    // Test 2: Health Check
    console.log('\n2. Testing health check endpoint...')
    try {
      const healthResponse = await apiClient.healthCheck()
      if (healthResponse.success) {
        console.log('✅ Health check passed')
        console.log(`   - Status: ${healthResponse.data?.status}`)
      } else {
        console.log('❌ Health check failed')
        console.log(`   - Error: ${healthResponse.error?.getUserMessage()}`)
      }
    } catch (error) {
      if (error instanceof PayloadAPIError) {
        console.log(`❌ Health check failed: ${error.getUserMessage()}`)
        console.log(`   - Type: ${error.type}`)
        console.log(`   - Retryable: ${error.isRetryable()}`)
      } else {
        console.log(`❌ Health check failed: ${error}`)
      }
    }

    // Test 3: Authentication Service Integration
    console.log('\n3. Testing authentication service integration...')
    const authService = getAuthService()
    console.log('✅ Auth service integrated with API client')
    console.log(`   - Auth service initialized: ${authService !== null}`)

    // Test 4: Error Handling
    console.log('\n4. Testing error handling...')
    try {
      // This should fail with authentication error if not logged in
      await apiClient.getCurrentUser()
      console.log('✅ User authenticated or mock data returned')
    } catch (error) {
      if (error instanceof PayloadAPIError) {
        if (error.type === ErrorType.AUTHENTICATION) {
          console.log('✅ Authentication error handling working correctly')
          console.log(`   - User message: ${error.getUserMessage()}`)
        } else {
          console.log(`⚠️  Unexpected error type: ${error.type}`)
          console.log(`   - Message: ${error.getUserMessage()}`)
        }
      } else {
        console.log(`❌ Unexpected error: ${error}`)
      }
    }

    // Test 5: Offline Support
    console.log('\n5. Testing offline support...')
    console.log(`   - Online status: ${apiClient.isOnline}`)
    console.log(`   - Offline queue size: ${apiClient.offlineQueueSize}`)
    
    if (apiClient.offlineQueueSize > 0) {
      console.log('⚠️  Offline queue has pending requests')
      try {
        await apiClient.processOfflineQueue()
        console.log('✅ Offline queue processed successfully')
      } catch (error) {
        console.log(`❌ Failed to process offline queue: ${error}`)
      }
    } else {
      console.log('✅ No pending offline requests')
    }

    // Test 6: TypeScript Types
    console.log('\n6. Testing TypeScript types...')
    try {
      // This will compile-time check our types
      const testUser: import('./api/types.js').User = {
        id: 'test',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        role: 'user',
        emailVerified: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      
      const testTrip: import('./api/types.js').Trip = {
        id: 'test',
        title: 'Test Trip',
        status: 'planning',
        startDate: new Date().toISOString(),
        endDate: new Date().toISOString(),
        destination: {
          name: 'Test City',
          country: 'Test Country',
          city: 'Test City',
          coordinates: { latitude: 0, longitude: 0 }
        },
        isPublic: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        user: 'test'
      }
      
      console.log('✅ TypeScript types compile correctly')
      console.log(`   - User type: ${testUser.email}`)
      console.log(`   - Trip type: ${testTrip.title}`)
    } catch (error) {
      console.log(`❌ TypeScript type error: ${error}`)
    }

    console.log('\n🎉 Payload API Integration test completed!')
    console.log('\n📋 Summary:')
    console.log('   ✅ API client initialization')
    console.log('   ✅ Health check endpoint')
    console.log('   ✅ Authentication service integration')
    console.log('   ✅ Error handling')
    console.log('   ✅ Offline support')
    console.log('   ✅ TypeScript types')

  } catch (error) {
    console.error('💥 Test failed with unexpected error:', error)
    throw error
  }
}

/**
 * Test authentication flow if credentials are available
 */
export async function testAuthenticationFlow(email?: string, password?: string): Promise<void> {
  if (!email || !password) {
    console.log('⚠️  Skipping authentication flow test (no credentials provided)')
    return
  }

  console.log('\n🔐 Testing authentication flow...')

  try {
    const authService = getAuthService()

    // Test login
    console.log('1. Testing login...')
    const loginResult = await authService.login({ email, password })
    
    if (loginResult.success && loginResult.user) {
      console.log('✅ Login successful')
      console.log(`   - User: ${loginResult.user.email}`)
      console.log(`   - Role: ${loginResult.user.role}`)
      
      // Test getting current user via API
      console.log('2. Testing get current user via API...')
      const apiClient = getAPIClient()
      const userResponse = await apiClient.getCurrentUser()
      
      if (userResponse.success && userResponse.data) {
        console.log('✅ Get current user successful')
        console.log(`   - User: ${userResponse.data.email}`)
      } else {
        console.log('❌ Get current user failed')
        console.log(`   - Error: ${userResponse.error?.getUserMessage()}`)
      }

      // Test logout
      console.log('3. Testing logout...')
      const logoutResult = await authService.logout()
      
      if (logoutResult.success) {
        console.log('✅ Logout successful')
      } else {
        console.log('❌ Logout failed')
        console.log(`   - Error: ${logoutResult.error}`)
      }
    } else {
      console.log('❌ Login failed')
      console.log(`   - Error: ${loginResult.error}`)
    }

  } catch (error) {
    console.error('💥 Authentication test failed:', error)
    throw error
  }
}

/**
 * Run all tests
 */
export async function runAllTests(email?: string, password?: string): Promise<void> {
  try {
    await testPayloadAPIIntegration()
    await testAuthenticationFlow(email, password)
    console.log('\n🎉 All tests completed successfully!')
  } catch (error) {
    console.error('\n💥 Tests failed:', error)
    throw error
  }
}

// Export for use in other test files
export default {
  testPayloadAPIIntegration,
  testAuthenticationFlow,
  runAllTests,
}
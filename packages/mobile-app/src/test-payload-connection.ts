/**
 * Payload CMS Connection Test
 *
 * This script tests the connection between the mobile app and Payload CMS
 * to verify that the authentication service is working correctly.
 */

import { getAuthService } from './auth/service.ts';

console.log('🔍 Testing Payload CMS connection...');

const API_BASE_URL =
  process.env.EXPO_PUBLIC_CMS_API_URL || 'http://localhost:3001/api';

async function testCMSConnectivity() {
  console.log(`📡 Testing connection to: ${API_BASE_URL}`);

  try {
    // Test 1: Basic connectivity
    console.log('\n1. Testing basic CMS connectivity...');
    const response = await fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      console.log('✅ CMS health check passed');
    } else {
      console.log(`⚠️  CMS health check returned status: ${response.status}`);
    }
  } catch (error) {
    console.log(
      '❌ CMS not reachable:',
      error instanceof Error ? error.message : 'Unknown error',
    );
    console.log('💡 Make sure to run: pnpm dev:cms');
    return false;
  }

  try {
    // Test 2: Check users endpoint availability
    console.log('\n2. Testing users endpoint...');
    const usersResponse = await fetch(`${API_BASE_URL}/users`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (usersResponse.status === 401) {
      console.log('✅ Users endpoint requires authentication (expected)');
    } else if (usersResponse.ok) {
      console.log('✅ Users endpoint accessible');
    } else {
      console.log(
        `⚠️  Users endpoint returned status: ${usersResponse.status}`,
      );
    }
  } catch (error) {
    console.log(
      '❌ Users endpoint error:',
      error instanceof Error ? error.message : 'Unknown error',
    );
  }

  try {
    // Test 3: Test auth service initialization
    console.log('\n3. Testing auth service initialization...');
    const authService = getAuthService();
    console.log('✅ Auth service initialized successfully');

    // Test 4: Test auth service methods (should fail gracefully without CMS running)
    console.log('\n4. Testing auth service methods...');

    // This should fail gracefully if CMS is not running
    const loginResult = await authService.login({
      email: 'test@example.com',
      password: 'testpassword',
    });

    if (!loginResult.success) {
      console.log('✅ Login method returns proper error response');
      console.log(`   Error: ${loginResult.error}`);
    } else {
      console.log('⚠️  Unexpected login success (CMS may have test user)');
    }
  } catch (error) {
    console.log(
      '❌ Auth service error:',
      error instanceof Error ? error.message : 'Unknown error',
    );
    return false;
  }

  return true;
}

// Test environment variables
function testEnvironmentVariables() {
  console.log('\n🔐 Testing environment variables...');

  const requiredVars = ['EXPO_PUBLIC_PAYLOAD_URL', 'EXPO_PUBLIC_CMS_API_URL'];

  let allPresent = true;

  requiredVars.forEach((varName) => {
    const value = process.env[varName];
    if (value) {
      console.log(`✅ ${varName}: ${value}`);
    } else {
      console.log(`❌ ${varName}: Not set`);
      allPresent = false;
    }
  });

  return allPresent;
}

// Main test function
async function runConnectionTests() {
  console.log('🧪 Starting Payload CMS Connection Tests...\n');

  // Test environment
  const envOk = testEnvironmentVariables();

  // Test connectivity
  const connectivityOk = await testCMSConnectivity();

  // Summary
  console.log('\n📋 Connection Test Summary:');
  console.log(`- Environment Variables: ${envOk ? '✅' : '❌'}`);
  console.log(`- CMS Connectivity: ${connectivityOk ? '✅' : '❌'}`);

  if (envOk && connectivityOk) {
    console.log('\n🎉 Mobile app is ready to connect to Payload CMS!');
    console.log('\nNext steps:');
    console.log('1. Start CMS: pnpm dev:cms');
    console.log('2. Start mobile app: pnpm dev:mobile');
    console.log('3. Create admin user in CMS admin panel');
    console.log('4. Test registration/login from mobile app');
  } else {
    console.log('\n🔧 Issues found. Please fix the errors above.');

    if (!envOk) {
      console.log(
        '💡 Environment: Copy .env.example to .env.local and configure',
      );
    }

    if (!connectivityOk) {
      console.log('💡 CMS: Start Payload CMS with: pnpm dev:cms');
    }
  }

  return envOk && connectivityOk;
}

// Export for use in other tests
export { testCMSConnectivity, testEnvironmentVariables, runConnectionTests };

// Run tests if this file is executed directly
if (require.main === module) {
  runConnectionTests()
    .then((success) => {
      process.exit(success ? 0 : 1);
    })
    .catch((error) => {
      console.error('❌ Test execution failed:', error);
      process.exit(1);
    });
}

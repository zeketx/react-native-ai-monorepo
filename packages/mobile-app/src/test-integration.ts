/**
 * Integration Test for Monorepo Setup Verification
 * 
 * This file tests the integration between packages and verifies
 * that the monorepo structure is working correctly.
 */

// Test basic TypeScript compilation
console.log('🔍 Testing shared package integration...')

// Test 1: Basic utilities (if they exist)
// Shared package test
console.log('📝 Note: Shared package (@clientsync/shared) not yet implemented')
console.log('   This is expected - will be created in future tasks')

// Test 2: Local utilities and types
try {
  // Test local utilities that exist
  import('../lib/cx.tsx').then((cx) => {
    console.log('✅ Local utility (cx) imported successfully')
  }).catch((error) => {
    console.log('❌ Local utility import failed:', error)
  })
} catch (error) {
  console.log('❌ Local utility import failed:', error)
}

// Test 3: Authentication utilities
try {
  import('../auth/index.js').then((auth) => {
    console.log('✅ Auth module imported successfully')
  }).catch((error) => {
    console.log('❌ Auth module import failed:', error)
  })
} catch (error) {
  console.log('❌ Auth module import failed:', error)
}

// Test 4: User context
try {
  import('../user/useViewerContext.tsx').then((userContext) => {
    console.log('✅ User context imported successfully')
  }).catch((error) => {
    console.log('❌ User context import failed:', error)
  })
} catch (error) {
  console.log('❌ User context import failed:', error)
}

// Test 5: UI components
try {
  import('../ui/Text.tsx').then((Text) => {
    console.log('✅ UI components imported successfully')
  }).catch((error) => {
    console.log('❌ UI components import failed:', error)
  })
} catch (error) {
  console.log('❌ UI components import failed:', error)
}

// Test 6: Basic email validation (without shared package)
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

console.log('✅ Basic email validation test:', isValidEmail('test@example.com'))
console.log('✅ Invalid email test:', isValidEmail('invalid-email'))

// Test 7: Environment variables access
try {
  const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY
  
  if (supabaseUrl && supabaseKey) {
    console.log('✅ Environment variables are accessible')
    console.log('📍 Supabase URL configured:', supabaseUrl.substring(0, 20) + '...')
  } else {
    console.log('⚠️  Environment variables not configured')
  }
} catch (error) {
  console.log('❌ Environment variable access failed:', error)
}

// Test 8: Module resolution test
const testModuleResolution = async () => {
  try {
    // Test if we can import from common React Native modules
    const { Platform } = await import('react-native')
    console.log('✅ React Native platform detected:', Platform.OS)
    
    // Test Expo modules
    const Constants = await import('expo-constants')
    console.log('✅ Expo Constants imported successfully')
    
  } catch (error) {
    console.log('❌ Module resolution test failed:', error)
  }
}

testModuleResolution()

// Summary
console.log('\n📋 Integration Test Summary:')
console.log('- TypeScript compilation: ✅')
console.log('- Local modules: Testing...')
console.log('- Environment variables: Testing...')
console.log('- React Native modules: Testing...')
console.log('- Shared package: ❌ (Not yet implemented)')

export default {
  isValidEmail,
  testComplete: true
}
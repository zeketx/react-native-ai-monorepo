#!/usr/bin/env node

/**
 * Quick CMS Backend Test
 * 
 * This script tests if the Payload CMS backend is running and accessible.
 * Run this after starting the CMS with: pnpm dev:cms
 */

const API_BASE = 'http://localhost:3001/api'

async function testEndpoint(url, description) {
  try {
    console.log(`🔍 ${description}...`)
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    
    console.log(`   Status: ${response.status} ${response.statusText}`)
    
    if (response.ok) {
      const data = await response.text()
      console.log(`   ✅ ${description} - Success`)
      return true
    } else if (response.status === 401) {
      console.log(`   ✅ ${description} - Protected (expected)`)
      return true
    } else {
      console.log(`   ⚠️  ${description} - Unexpected status`)
      return false
    }
  } catch (error) {
    console.log(`   ❌ ${description} - Failed: ${error.message}`)
    return false
  }
}

async function testCMSBackend() {
  console.log('🧪 Testing Payload CMS Backend...\n')
  
  const tests = [
    [`${API_BASE}/health`, 'Health check'],
    [`${API_BASE}/users`, 'Users endpoint'],
    [`${API_BASE}/users/login`, 'Login endpoint'],
    [`http://localhost:3001/admin`, 'Admin panel'],
  ]
  
  let successCount = 0
  
  for (const [url, description] of tests) {
    const success = await testEndpoint(url, description)
    if (success) successCount++
    console.log('')
  }
  
  console.log('📊 Test Results:')
  console.log(`   ${successCount}/${tests.length} endpoints accessible`)
  
  if (successCount === tests.length) {
    console.log('\n🎉 CMS Backend is running and ready!')
    console.log('   • Admin panel: http://localhost:3001/admin')
    console.log('   • API base: http://localhost:3001/api')
    console.log('\nNext steps:')
    console.log('   1. Create admin user in admin panel')
    console.log('   2. Test mobile app connection: pnpm dev:mobile')
  } else {
    console.log('\n🔧 Issues detected:')
    if (successCount === 0) {
      console.log('   • CMS is not running')
      console.log('   • Start with: pnpm dev:cms')
    } else {
      console.log('   • Some endpoints not accessible')
      console.log('   • Check CMS logs for errors')
    }
  }
  
  return successCount === tests.length
}

// Run the test
testCMSBackend().then(success => {
  process.exit(success ? 0 : 1)
}).catch(error => {
  console.error('❌ Test failed:', error)
  process.exit(1)
})
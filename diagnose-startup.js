#!/usr/bin/env node

/**
 * Diagnostic Script for ClientSync Platform
 * 
 * This script checks for common issues that prevent the CMS and mobile app from starting.
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 ClientSync Platform Diagnostic Check\n');

// Check 1: Node version
console.log('1. Checking Node.js version...');
const nodeVersion = process.version;
const majorVersion = parseInt(nodeVersion.split('.')[0].substring(1));
if (majorVersion >= 18) {
  console.log(`   ✅ Node.js ${nodeVersion} (meets requirement >= 18)`);
} else {
  console.log(`   ❌ Node.js ${nodeVersion} (requires >= 18)`);
}

// Check 2: CMS dependencies
console.log('\n2. Checking CMS dependencies...');
const cmsPackagePath = path.join(__dirname, 'packages/cms/package.json');
const cmsNodeModulesPath = path.join(__dirname, 'packages/cms/node_modules');
if (fs.existsSync(cmsPackagePath)) {
  console.log('   ✅ CMS package.json found');
  if (fs.existsSync(cmsNodeModulesPath)) {
    console.log('   ✅ CMS node_modules installed');
  } else {
    console.log('   ❌ CMS node_modules missing - run: pnpm install');
  }
} else {
  console.log('   ❌ CMS package not found');
}

// Check 3: CMS environment file
console.log('\n3. Checking CMS environment...');
const cmsEnvPath = path.join(__dirname, 'packages/cms/.env');
if (fs.existsSync(cmsEnvPath)) {
  const envContent = fs.readFileSync(cmsEnvPath, 'utf8');
  const hasSecret = envContent.includes('PAYLOAD_SECRET=') && !envContent.includes('PAYLOAD_SECRET=your-payload-secret');
  const hasPort = envContent.includes('PORT=3001');
  
  console.log('   ✅ CMS .env file exists');
  console.log(`   ${hasSecret ? '✅' : '❌'} PAYLOAD_SECRET configured`);
  console.log(`   ${hasPort ? '✅' : '❌'} PORT set to 3001`);
} else {
  console.log('   ❌ CMS .env file missing');
}

// Check 4: Mobile app dependencies
console.log('\n4. Checking mobile app dependencies...');
const mobilePackagePath = path.join(__dirname, 'packages/mobile-app/package.json');
const mobileNodeModulesPath = path.join(__dirname, 'packages/mobile-app/node_modules');
if (fs.existsSync(mobilePackagePath)) {
  console.log('   ✅ Mobile app package.json found');
  if (fs.existsSync(mobileNodeModulesPath)) {
    console.log('   ✅ Mobile app node_modules installed');
  } else {
    console.log('   ❌ Mobile app node_modules missing - run: pnpm install');
  }
} else {
  console.log('   ❌ Mobile app package not found');
}

// Check 5: Mobile app environment
console.log('\n5. Checking mobile app environment...');
const mobileEnvPath = path.join(__dirname, 'packages/mobile-app/.env.local');
if (fs.existsSync(mobileEnvPath)) {
  const envContent = fs.readFileSync(mobileEnvPath, 'utf8');
  const hasCmsApi = envContent.includes('EXPO_PUBLIC_CMS_API_URL=');
  const hasPayloadUrl = envContent.includes('EXPO_PUBLIC_PAYLOAD_URL=');
  
  console.log('   ✅ Mobile app .env.local file exists');
  console.log(`   ${hasCmsApi ? '✅' : '❌'} EXPO_PUBLIC_CMS_API_URL configured`);
  console.log(`   ${hasPayloadUrl ? '✅' : '❌'} EXPO_PUBLIC_PAYLOAD_URL configured`);
} else {
  console.log('   ❌ Mobile app .env.local file missing');
}

// Check 6: Port availability
console.log('\n6. Checking port availability...');
const net = require('net');

function checkPort(port, callback) {
  const server = net.createServer();
  server.once('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      callback(false);
    } else {
      callback(false);
    }
  });
  server.once('listening', () => {
    server.close();
    callback(true);
  });
  server.listen(port, 'localhost');
}

checkPort(3001, (isAvailable) => {
  console.log(`   ${isAvailable ? '✅' : '❌'} Port 3001 ${isAvailable ? 'available' : 'in use'} (CMS)`);
  
  // Summary and instructions
  console.log('\n📋 Summary and Next Steps:\n');
  
  console.log('To start the platform:');
  console.log('\n1. Start CMS backend (Terminal 1):');
  console.log('   cd ' + __dirname);
  console.log('   pnpm dev:cms');
  console.log('   → Opens at http://localhost:3001/admin');
  
  console.log('\n2. Start mobile app (Terminal 2):');
  console.log('   cd ' + __dirname);
  console.log('   pnpm dev:mobile');
  console.log('   → Web version at http://localhost:19006');
  
  console.log('\n3. First time setup:');
  console.log('   a. Create admin user at http://localhost:3001/admin');
  console.log('   b. Test registration from mobile app');
  console.log('   c. Check CMS admin panel for new users');
  
  console.log('\n🚧 Known Issues:');
  console.log('   • Authentication currently uses Payload CMS (not Supabase)');
  console.log('   • Only basic auth works - no data operations yet');
  console.log('   • Mobile app may show Supabase errors (ignore for now)');
  
  if (!isAvailable) {
    console.log('\n⚠️  Port 3001 is in use! Kill the process or use a different port.');
  }
});
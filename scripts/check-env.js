#!/usr/bin/env node

/**
 * Environment Variables Validation Script
 * 
 * This script validates that all required environment variables are set
 * for the ClientSync Travel Platform monorepo.
 * 
 * Usage:
 *   node scripts/check-env.js
 *   npm run check-env
 *   pnpm check-env
 */

import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

// Required environment variables for each package
const requiredVariables = {
  // Core Supabase variables (used by all packages)
  core: [
    'EXPO_PUBLIC_SUPABASE_URL',
    'EXPO_PUBLIC_SUPABASE_ANON_KEY',
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY',
  ],
  
  // Mobile app variables (React Native + Expo)
  mobile: [
    'EXPO_PUBLIC_SUPABASE_URL',
    'EXPO_PUBLIC_SUPABASE_ANON_KEY',
    'EXPO_PUBLIC_APP_NAME',
    'EXPO_PUBLIC_ENVIRONMENT',
  ],
  
  // Web dashboard variables (Vite/React)
  web: [
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY',
  ],
  
  // CMS variables (Next.js + Payload)
  cms: [
    'PAYLOAD_SECRET_KEY',
    'PAYLOAD_DATABASE_URI',
    'NEXTAUTH_SECRET',
    'NEXTAUTH_URL',
  ],
  
  // Shared variables
  shared: [
    'NODE_ENV',
    'DATABASE_URL',
    'JWT_SECRET',
  ],
};

// Optional variables (warnings only)
const optionalVariables = [
  'STRIPE_SECRET_KEY',
  'SENDGRID_API_KEY',
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET',
];

/**
 * Load environment variables from .env.local file
 */
function loadEnvFile() {
  const envPath = join(__dirname, '..', '.env.local');
  
  try {
    const envContent = readFileSync(envPath, 'utf8');
    const envVars = {};
    
    // Parse .env file
    envContent.split('\n').forEach(line => {
      // Skip comments and empty lines
      if (line.trim() === '' || line.trim().startsWith('#')) return;
      
      const [key, ...valueParts] = line.split('=');
      if (key && valueParts.length > 0) {
        envVars[key.trim()] = valueParts.join('=').trim();
      }
    });
    
    return envVars;
  } catch (error) {
    console.error(`${colors.red}Error reading .env.local file: ${error.message}${colors.reset}`);
    console.error(`${colors.yellow}Make sure to create .env.local from .env.example${colors.reset}`);
    process.exit(1);
  }
}

/**
 * Check if a variable has a placeholder value
 */
function isPlaceholderValue(value) {
  if (!value) return true;
  
  const placeholders = [
    'your_',
    'your-',
    '[your-',
    'eyJ[',
    'sk_test_[',
    'pk_test_[',
    'SG.[',
    'postgresql://[',
    'https://[',
  ];
  
  return placeholders.some(placeholder => value.includes(placeholder));
}

/**
 * Validate environment variables
 */
function validateEnvironment() {
  console.log(`${colors.cyan}🔍 Validating environment variables...${colors.reset}\n`);
  
  // Load environment variables
  const envVars = loadEnvFile();
  
  // Merge with process.env (process.env takes precedence)
  const allVars = { ...envVars, ...process.env };
  
  let hasErrors = false;
  let hasWarnings = false;
  
  // Check required variables by category
  for (const [category, variables] of Object.entries(requiredVariables)) {
    console.log(`${colors.blue}📦 ${category.charAt(0).toUpperCase() + category.slice(1)} Package:${colors.reset}`);
    
    const missing = [];
    const placeholder = [];
    const valid = [];
    
    for (const variable of variables) {
      const value = allVars[variable];
      
      if (!value) {
        missing.push(variable);
      } else if (isPlaceholderValue(value)) {
        placeholder.push(variable);
      } else {
        valid.push(variable);
      }
    }
    
    // Display results
    if (valid.length > 0) {
      console.log(`${colors.green}  ✅ Valid: ${valid.join(', ')}${colors.reset}`);
    }
    
    if (placeholder.length > 0) {
      console.log(`${colors.yellow}  ⚠️  Placeholder values: ${placeholder.join(', ')}${colors.reset}`);
      hasWarnings = true;
    }
    
    if (missing.length > 0) {
      console.log(`${colors.red}  ❌ Missing: ${missing.join(', ')}${colors.reset}`);
      hasErrors = true;
    }
    
    console.log('');
  }
  
  // Check optional variables
  console.log(`${colors.magenta}🔧 Optional Services:${colors.reset}`);
  const optionalSet = [];
  const optionalMissing = [];
  
  for (const variable of optionalVariables) {
    const value = allVars[variable];
    if (value && !isPlaceholderValue(value)) {
      optionalSet.push(variable);
    } else {
      optionalMissing.push(variable);
    }
  }
  
  if (optionalSet.length > 0) {
    console.log(`${colors.green}  ✅ Configured: ${optionalSet.join(', ')}${colors.reset}`);
  }
  
  if (optionalMissing.length > 0) {
    console.log(`${colors.yellow}  ⚠️  Not configured: ${optionalMissing.join(', ')}${colors.reset}`);
  }
  
  console.log('');
  
  // Summary
  if (hasErrors) {
    console.log(`${colors.red}❌ Validation failed: Missing required environment variables${colors.reset}`);
    console.log(`${colors.yellow}💡 Copy .env.example to .env.local and fill in your values${colors.reset}`);
    process.exit(1);
  } else if (hasWarnings) {
    console.log(`${colors.yellow}⚠️  Validation passed with warnings: Some variables have placeholder values${colors.reset}`);
    console.log(`${colors.yellow}💡 Update placeholder values in .env.local for full functionality${colors.reset}`);
    process.exit(0);
  } else {
    console.log(`${colors.green}✅ All required environment variables are properly configured!${colors.reset}`);
    process.exit(0);
  }
}

/**
 * Display help information
 */
function displayHelp() {
  console.log(`
${colors.cyan}Environment Variables Validation Script${colors.reset}

${colors.yellow}Usage:${colors.reset}
  node scripts/check-env.js
  npm run check-env
  pnpm check-env

${colors.yellow}Options:${colors.reset}
  --help, -h    Show this help message

${colors.yellow}Environment Setup:${colors.reset}
  1. Copy .env.example to .env.local
  2. Fill in your actual values
  3. Run this script to validate

${colors.yellow}Required Variables by Package:${colors.reset}
  Core:      SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
  Mobile:    EXPO_PUBLIC_SUPABASE_URL, EXPO_PUBLIC_SUPABASE_ANON_KEY
  Web:       VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY
  CMS:       PAYLOAD_SECRET_KEY, PAYLOAD_DATABASE_URI, NEXTAUTH_SECRET
  Shared:    NODE_ENV, DATABASE_URL, JWT_SECRET

${colors.yellow}Optional Services:${colors.reset}
  Stripe, SendGrid, Cloudinary (warnings only if not configured)
`);
}

// Main execution
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  displayHelp();
} else {
  validateEnvironment();
}
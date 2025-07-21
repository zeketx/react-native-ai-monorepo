# Task: Create Environment Configuration Files

**ID:** CS-P0-016  
**Phase:** Foundation  
**Dependencies:** CS-P0-015

## Objective
Set up environment variable files for local development with proper Supabase configuration for both mobile app and web dashboard.

## Acceptance Criteria
- [x] Root .env.local file is created with Supabase credentials
- [x] Mobile app can access environment variables
- [x] Web dashboard environment is configured
- [x] .gitignore is updated to exclude env files
- [x] Example env file is provided for team members

## Implementation Notes
1. Create root .env.local file:
```bash
# Supabase Configuration
EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Web Dashboard
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Development
NODE_ENV=development
```

2. Create .env.example for documentation:
```bash
# Copy this file to .env.local and fill in your values

# Supabase Configuration (from supabase.com dashboard)
EXPO_PUBLIC_SUPABASE_URL=https://[project-ref].supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ... # NEVER commit this!

# Web Dashboard (same as above)
VITE_SUPABASE_URL=https://[project-ref].supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...

# Environment
NODE_ENV=development
```

3. Update .gitignore:
```bash
# Environment files
.env
.env.local
.env.production
.env.supabase
*.env

# Keep example
!.env.example
```

4. Create mobile app env config (packages/mobile-app/.env):
```bash
# This file can reference root env vars or define its own
# Expo automatically loads .env files
```

5. Create helper script for env validation (scripts/check-env.js):
```javascript
const required = [
  'EXPO_PUBLIC_SUPABASE_URL',
  'EXPO_PUBLIC_SUPABASE_ANON_KEY',
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY'
];

const missing = required.filter(key => !process.env[key]);

if (missing.length > 0) {
  console.error('Missing required environment variables:');
  missing.forEach(key => console.error(`  - ${key}`));
  process.exit(1);
}

console.log('✅ All required environment variables are set');
```

## Security Notes
- NEVER commit actual credentials
- Service role key is server-side only
- Use EXPO_PUBLIC_ prefix for client-side variables in Expo
- Use VITE_ prefix for client-side variables in Vite

## Testing
1. Source the env file: `source .env.local`
2. Run validation script: `node scripts/check-env.js`
3. Verify mobile app can access: `console.log(process.env.EXPO_PUBLIC_SUPABASE_URL)`
4. Verify git ignores env files: `git status`

## Estimated Effort
30 minutes
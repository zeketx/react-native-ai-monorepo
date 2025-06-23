# Task: Verify Complete Monorepo and Foundation Setup

**ID:** CS-P0-017  
**Phase:** Foundation  
**Dependencies:** CS-P0-001 through CS-P0-016

## Objective
Perform comprehensive verification of the monorepo setup, shared package functionality, Supabase configuration, and ensure all foundation components are working correctly before proceeding to Phase 1.

## Acceptance Criteria
- [ ] Monorepo structure is correct and functional
- [ ] Shared package builds and is accessible from mobile app
- [ ] Supabase connection is working
- [ ] Database schema is complete with all tables
- [ ] Environment variables are properly configured
- [ ] Basic test imports work without errors

## Implementation Notes
1. Verify monorepo structure:
```bash
# From root directory
pnpm ls -r --depth 0
# Should show:
# - clientsync-travel-platform
# - @clientsync/mobile-app
# - @clientsync/shared
# - @clientsync/web-dashboard (if created)

# Check workspace configuration
cat pnpm-workspace.yaml
tree packages/ -L 2
```

2. Test shared package integration:
```typescript
// Create test file: packages/mobile-app/src/test-integration.ts
import { 
  ClientTier, 
  isValidEmail, 
  getAvailableFlightClasses 
} from '@clientsync/shared'

console.log('Testing shared package integration...')
console.log('ClientTier values:', Object.values(ClientTier))
console.log('Email validation:', isValidEmail('test@example.com'))
console.log('Elite flight classes:', getAvailableFlightClasses(ClientTier.ELITE))
```

3. Verify Supabase connection:
```typescript
// Create test file: packages/mobile-app/src/test-supabase.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Test connection
async function testConnection() {
  const { data, error } = await supabase
    .from('allowlist')
    .select('count')
    .limit(1)
  
  if (error) {
    console.error('Supabase connection error:', error)
  } else {
    console.log('✅ Supabase connected successfully')
  }
}
```

4. Verify database schema:
```sql
-- Run in Supabase SQL Editor
-- Check all tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Should show:
-- allowlist, audit_logs, client_preferences, client_profiles, 
-- clients, trips, user_profiles

-- Check RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';

-- Test helper function
SELECT * FROM public.check_email_allowlist('test@example.com');
```

5. Create verification checklist script:
```bash
#!/bin/bash
# scripts/verify-setup.sh

echo "🔍 Verifying ClientSync Foundation Setup..."

# Check Node version
echo -n "Node.js version: "
node --version

# Check PNPM version
echo -n "PNPM version: "
pnpm --version

# Check monorepo packages
echo -e "\n📦 Monorepo packages:"
pnpm ls -r --depth 0

# Check shared package build
echo -e "\n🏗️  Building shared package..."
cd packages/shared && pnpm build && cd ../..

# Check environment variables
echo -e "\n🔐 Checking environment variables..."
node scripts/check-env.js

echo -e "\n✅ Foundation setup verification complete!"
```

## Common Issues to Check
- [ ] No TypeScript errors in shared package
- [ ] Mobile app package.json has correct name
- [ ] Git tracks all necessary files
- [ ] No sensitive data in git history
- [ ] Supabase project is active (not paused)

## Next Steps
If all checks pass:
1. Commit all changes to git
2. Create a "foundation-complete" tag
3. Proceed to Phase 1 (Authentication)

## Estimated Effort
1 hour
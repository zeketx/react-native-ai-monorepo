# Task: Deploy Edge Function to Supabase

**ID:** CS-P1-003  
**Phase:** Authentication  
**Dependencies:** CS-P1-002

## Objective
Deploy the check-allowlist edge function to Supabase and verify it's accessible from the client applications.

## Acceptance Criteria
- [ ] Function is deployed to Supabase
- [ ] Function URL is accessible
- [ ] Function works with production data
- [ ] Deployment is documented
- [ ] Function can be invoked from client SDK

## Implementation Notes
1. Deploy the function:
```bash
cd backend

# Deploy single function
supabase functions deploy check-allowlist

# Or deploy all functions
supabase functions deploy

# You'll see output like:
# Function "check-allowlist" deployed.
# URL: https://[project-ref].supabase.co/functions/v1/check-allowlist
```

2. Set function secrets (if needed):
```bash
# Functions automatically have access to:
# - SUPABASE_URL
# - SUPABASE_SERVICE_ROLE_KEY
# - SUPABASE_ANON_KEY

# If you need custom secrets:
supabase secrets set MY_SECRET=value
```

3. Verify deployment:
```bash
# List deployed functions
supabase functions list

# Check function logs
supabase functions logs check-allowlist
```

4. Test production function:
```bash
# Get your project URL and anon key from Supabase dashboard
SUPABASE_URL="https://[project-ref].supabase.co"
ANON_KEY="your-anon-key"

# Test the deployed function
curl -X POST "$SUPABASE_URL/functions/v1/check-allowlist" \
  -H "Authorization: Bearer $ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

5. Create deployment documentation (backend/supabase/functions/README.md):
```markdown
# Supabase Edge Functions

## Deployed Functions

### check-allowlist
- **Purpose**: Verify if an email is in the allowlist
- **Endpoint**: `/functions/v1/check-allowlist`
- **Method**: POST
- **Body**: `{ "email": "user@example.com" }`
- **Response**: `{ "allowed": boolean, "tier": string | null }`

## Deployment

```bash
# Deploy all functions
supabase functions deploy

# Deploy specific function
supabase functions deploy check-allowlist
```

## Monitoring

```bash
# View logs
supabase functions logs check-allowlist --tail

# View logs with filter
supabase functions logs check-allowlist --filter "error"
```
```

6. Update client environment variables:
```bash
# Add to .env.local if function URL is custom
EXPO_PUBLIC_EDGE_FUNCTION_URL=https://[project-ref].supabase.co/functions/v1
```

## Testing from Client
```typescript
// Test from React Native app
import { supabase } from './lib/supabase'

async function testAllowlist() {
  const { data, error } = await supabase.functions.invoke('check-allowlist', {
    body: { email: 'test@example.com' }
  })
  
  if (error) {
    console.error('Function error:', error)
  } else {
    console.log('Result:', data)
    // { allowed: true, tier: 'standard' }
  }
}
```

## Rollback Process
```bash
# If issues arise, you can quickly update the function
# Make fixes to the code, then:
supabase functions deploy check-allowlist

# Functions are versioned, old versions stop receiving traffic immediately
```

## Monitoring
- Check function invocations in Supabase Dashboard > Functions
- Monitor logs for errors
- Set up alerts for function failures (in production)

## Estimated Effort
30 minutes
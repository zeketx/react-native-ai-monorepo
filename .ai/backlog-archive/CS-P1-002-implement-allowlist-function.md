# Task: Implement Email Allowlist Check Function

**ID:** CS-P1-002  
**Phase:** Authentication  
**Dependencies:** CS-P1-001

## Objective
Implement the edge function logic to verify if an email address is in the allowlist and return the associated client tier.

## Acceptance Criteria
- [ ] Function accepts email in request body
- [ ] Function queries allowlist table
- [ ] Returns allowed status and tier
- [ ] Handles errors gracefully
- [ ] CORS headers are properly set
- [ ] Function responds to OPTIONS requests

## Implementation Notes
1. Implement the edge function (backend/supabase/functions/check-allowlist/index.ts):
```typescript
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface RequestBody {
  email: string
}

interface ResponseBody {
  allowed: boolean
  tier: 'standard' | 'premium' | 'elite' | null
  error?: string
}

serve(async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Parse request body
    const { email }: RequestBody = await req.json()
    
    // Validate input
    if (!email || typeof email !== 'string') {
      return new Response(
        JSON.stringify({ 
          allowed: false, 
          tier: null, 
          error: 'Email is required' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Initialize Supabase client with service role key
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Call the database function
    const { data, error } = await supabase
      .rpc('check_email_allowlist', { 
        email_to_check: email.toLowerCase().trim() 
      })
      .single()

    if (error) {
      console.error('Database error:', error)
      return new Response(
        JSON.stringify({ 
          allowed: false, 
          tier: null, 
          error: 'Failed to check allowlist' 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Return result
    const response: ResponseBody = {
      allowed: data?.allowed || false,
      tier: data?.tier || null
    }

    return new Response(
      JSON.stringify(response),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Function error:', error)
    return new Response(
      JSON.stringify({ 
        allowed: false, 
        tier: null, 
        error: 'Internal server error' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
```

2. Add input validation helper:
```typescript
// Add before serve()
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Use in validation
if (!email || !isValidEmail(email)) {
  return new Response(
    JSON.stringify({ 
      allowed: false, 
      tier: null, 
      error: 'Invalid email format' 
    }),
    { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}
```

3. Add rate limiting consideration:
```typescript
// Add at the top of try block
const clientIp = req.headers.get('x-forwarded-for') || 'unknown'
console.log(`Allowlist check from IP: ${clientIp} for email: ${email}`)
```

## Testing
1. Test with local Supabase:
```bash
# Start functions
supabase functions serve

# Test allowed email
curl -X POST http://localhost:54321/functions/v1/check-allowlist \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"email":"test.standard@example.com"}'

# Expected: {"allowed":true,"tier":"standard"}
```

2. Test error cases:
```bash
# Missing email
curl -X POST http://localhost:54321/functions/v1/check-allowlist \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{}'

# Invalid email
curl -X POST http://localhost:54321/functions/v1/check-allowlist \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"email":"not-an-email"}'
```

## Security Notes
- Function uses service role key (kept server-side)
- Email is normalized (lowercase, trimmed)
- All errors return generic messages to prevent email enumeration
- Consider adding rate limiting in production

## Estimated Effort
1.5 hours
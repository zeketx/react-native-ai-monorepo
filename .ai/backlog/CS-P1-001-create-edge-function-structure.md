# Task: Create Supabase Edge Function Structure

**ID:** CS-P1-001  
**Phase:** Authentication  
**Dependencies:** CS-P0-017

## Objective
Set up the Supabase Edge Functions directory structure and initialize the first edge function for email allowlist verification.

## Acceptance Criteria
- [ ] Supabase CLI is installed and configured
- [ ] Functions directory is created in backend/
- [ ] Project is linked to Supabase
- [ ] Edge function structure is initialized
- [ ] Local development server can be started

## Implementation Notes
1. Install Supabase CLI (if not already installed):
```bash
# macOS
brew install supabase/tap/supabase

# Or download from GitHub
# https://github.com/supabase/cli/releases
```

2. Initialize Supabase in backend directory:
```bash
# Create backend directory if it doesn't exist
mkdir -p backend
cd backend

# Initialize Supabase
supabase init

# This creates:
# - supabase/config.toml
# - supabase/functions/
# - .gitignore
```

3. Link to your Supabase project:
```bash
# Login to Supabase
supabase login

# Link to your project (get project-ref from Supabase dashboard URL)
supabase link --project-ref [your-project-ref]

# Verify link
supabase status
```

4. Create the check-allowlist function:
```bash
# Create new function
supabase functions new check-allowlist

# This creates:
# - supabase/functions/check-allowlist/index.ts
```

5. Update backend/.gitignore:
```
# Supabase
.branches
.temp

# Functions
supabase/functions/*/node_modules
supabase/.env
supabase/.env.local

# Keep function code
!supabase/functions/*/index.ts
```

6. Create function configuration (supabase/functions/check-allowlist/deno.json):
```json
{
  "compilerOptions": {
    "target": "esnext",
    "module": "esnext",
    "lib": ["esnext", "dom"]
  }
}
```

## Directory Structure
```
backend/
├── supabase/
│   ├── config.toml
│   ├── functions/
│   │   └── check-allowlist/
│   │       ├── index.ts
│   │       └── deno.json
│   └── .gitignore
└── .gitignore
```

## Testing
```bash
# Start functions locally
supabase functions serve

# In another terminal, verify it's running
curl -i --location --request POST \
  'http://localhost:54321/functions/v1/check-allowlist' \
  --header 'Authorization: Bearer ANON_KEY' \
  --header 'Content-Type: application/json' \
  --data '{"name":"Functions"}'
```

## Notes
- Edge Functions use Deno runtime
- TypeScript is supported out of the box
- Functions run in a secure sandbox
- Local development uses Docker

## Estimated Effort
1 hour
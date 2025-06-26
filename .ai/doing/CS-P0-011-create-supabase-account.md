# Task: Create and Configure Supabase Project

**ID:** CS-P0-011  
**Phase:** Foundation  
**Dependencies:** CS-P0-010

## Objective
Create a new Supabase project for ClientSync platform with initial configuration including authentication setup and project settings.

## Acceptance Criteria
- [ ] Supabase account is created
- [ ] New project "clientsync-prod" or "clientsync-dev" is created
- [ ] Project URL, anon key, and service role key are documented
- [ ] Email/Password authentication is enabled
- [ ] Project region is optimally selected

## Implementation Notes
1. Create Supabase account:
   - Go to https://supabase.com
   - Sign up with email or GitHub
   - Verify email if required

2. Create new project:
   - Click "New Project"
   - Project name: `clientsync-dev` (for development)
   - Database password: Generate strong password and save securely
   - Region: Choose closest to target users
   - Pricing: Free tier for development

3. Wait for project provisioning (2-3 minutes)

4. Document credentials in `.env.supabase` (add to .gitignore):
   ```bash
   # Project URL (from Settings > API)
   SUPABASE_URL=https://[project-ref].supabase.co

   # Anon/Public key (from Settings > API)
   SUPABASE_ANON_KEY=[your-anon-key]

   # Service Role key (from Settings > API) - KEEP SECRET!
   SUPABASE_SERVICE_ROLE_KEY=[your-service-role-key]

   # Database URL (from Settings > Database)
   DATABASE_URL=postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres
   ```

5. Configure authentication settings:
   - Go to Authentication > Settings
   - Ensure Email provider is enabled
   - Set JWT expiry to 3600 (1 hour)
   - Disable email confirmations for development

## Security Notes
- NEVER commit service role key to git
- Use anon key for client-side code only
- Service role key is only for server-side/admin operations

## Testing
- Test API endpoint: `curl -X GET "${SUPABASE_URL}/rest/v1/" -H "apikey: ${SUPABASE_ANON_KEY}"`
- Should return API specification JSON

## Estimated Effort
1 hour
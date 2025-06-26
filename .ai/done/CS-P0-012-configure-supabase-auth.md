# Task: Configure Supabase Authentication Providers

**ID:** CS-P0-012  
**Phase:** Foundation  
**Dependencies:** CS-P0-011

## Objective
Set up authentication providers in Supabase including email/password authentication and prepare for future Google OAuth integration.

## Acceptance Criteria
- [x] Email/Password authentication is confirmed enabled
- [x] Custom user profile trigger is created
- [x] Redirect URLs are configured for development
- [x] Google OAuth is prepared (but not required to be active)
- [x] Authentication flow is tested

## Implementation Notes
1. Configure Email Authentication:
   - Navigate to Authentication > Providers > Email
   - Ensure "Enable Email provider" is toggled ON
   - Settings:
     - Enable email confirmations: OFF (for development)
     - Secure email change: ON
     - Secure password change: ON

2. Set up redirect URLs:
   - Go to Authentication > URL Configuration
   - Add redirect URLs:
     ```
     http://localhost:8081/*
     http://localhost:19000/*
     exp://localhost:8081/*
     exp://localhost:19000/*
     clientsync://auth/callback
     ```

3. Create user profile management function:
   ```sql
   -- Run in SQL Editor
   CREATE OR REPLACE FUNCTION public.handle_new_user()
   RETURNS TRIGGER AS $$
   BEGIN
     INSERT INTO public.user_profiles (id, email, role)
     VALUES (NEW.id, NEW.email, 'client');
     RETURN NEW;
   END;
   $$ LANGUAGE plpgsql SECURITY DEFINER;

   -- Note: Trigger will be created after user_profiles table exists
   ```

4. Prepare Google OAuth (for future):
   - Go to Authentication > Providers > Google
   - Note the callback URL: `https://[project-ref].supabase.co/auth/v1/callback`
   - This will be needed when setting up Google Cloud Console

5. Configure Auth Settings:
   - Minimum password length: 8
   - Password requirements: At least one uppercase, lowercase, and number
   - Session duration: 3600 seconds (1 hour)

## Testing
1. Test signup via Supabase dashboard:
   - Go to Authentication > Users
   - Click "Invite User"
   - Send test invite

2. Test with curl:
   ```bash
   curl -X POST "${SUPABASE_URL}/auth/v1/signup" \
     -H "apikey: ${SUPABASE_ANON_KEY}" \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"TestPass123!"}'
   ```

## Notes
- Email confirmations disabled for easier development
- In production, enable email confirmations and configure SMTP

## Estimated Effort
1 hour
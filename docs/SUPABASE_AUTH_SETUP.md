# Supabase Authentication Configuration Guide

This guide provides step-by-step instructions for configuring authentication providers in your Supabase project for the ClientSync platform.

## Prerequisites

- Completed Supabase project setup (CS-P0-011)
- Access to Supabase dashboard
- Environment variables configured in `.env.supabase`

## Step 1: Configure Email/Password Authentication

### Dashboard Configuration

1. **Navigate to Authentication Settings**
   - Go to your Supabase project dashboard
   - Click **Authentication** in the sidebar
   - Select **Providers** tab

2. **Email Provider Settings**
   - Locate **Email** provider
   - Ensure **Enable Email provider** is toggled **ON** (should be enabled by default)
   
3. **Configure Email Settings**
   - Click on **Email** provider to expand settings
   - Configure the following:
     ```
     ✅ Enable email provider: ON
     ❌ Enable email confirmations: OFF (for development)
     ✅ Secure email change: ON
     ✅ Secure password change: ON
     ```

4. **Password Requirements** (Settings > Authentication)
   - Minimum password length: **8 characters**
   - Password strength: Require at least one uppercase, lowercase, and number
   - Session duration: **3600 seconds** (1 hour)

## Step 2: Configure Redirect URLs

### Development Environment URLs

1. **Navigate to URL Configuration**
   - Go to **Authentication** > **URL Configuration**
   - Find **Redirect URLs** section

2. **Add Development URLs**
   Add the following redirect URLs for local development:
   ```
   http://localhost:8081/*
   http://localhost:19000/*
   exp://localhost:8081/*
   exp://localhost:19000/*
   clientsync://auth/callback
   ```

3. **Site URL Configuration**
   - Set **Site URL** to: `http://localhost:8081`
   - This is the default redirect after authentication

### URL Explanations
- `localhost:8081` - Default Expo development server port
- `localhost:19000` - Alternative Expo Metro bundler port
- `exp://` - Expo protocol for deep linking
- `clientsync://` - Custom app scheme for production deep linking

## Step 3: Create User Profile Management Function

### SQL Function for Automatic Profile Creation

1. **Navigate to SQL Editor**
   - Go to **SQL Editor** in your Supabase dashboard
   - Click **New Query**

2. **Create Profile Management Function**
   Copy and paste the following SQL:

   ```sql
   -- Function to handle new user profile creation
   CREATE OR REPLACE FUNCTION public.handle_new_user()
   RETURNS TRIGGER AS $$
   BEGIN
     -- Insert into user_profiles table when a new user signs up
     INSERT INTO public.user_profiles (id, email, role, created_at, updated_at)
     VALUES (
       NEW.id,
       NEW.email,
       'client',  -- Default role for new users
       NOW(),
       NOW()
     );
     RETURN NEW;
   END;
   $$ LANGUAGE plpgsql SECURITY DEFINER;

   -- Grant necessary permissions
   GRANT EXECUTE ON FUNCTION public.handle_new_user() TO authenticated;
   GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role;
   ```

3. **Run the Query**
   - Click **Run** to execute the SQL
   - Verify success message appears

### Trigger Setup (Future Implementation)
The trigger will be created when the `user_profiles` table is implemented in CS-P0-012:
```sql
-- This will be created later when user_profiles table exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
```

## Step 4: Prepare Google OAuth (Future Ready)

### Google OAuth Callback URL

1. **Get Callback URL**
   - Navigate to **Authentication** > **Providers**
   - Click on **Google** provider
   - Note the **Callback URL**: `https://[your-project-ref].supabase.co/auth/v1/callback`

2. **Future Setup Requirements**
   When ready to implement Google OAuth:
   - Create Google Cloud Console project
   - Configure OAuth consent screen
   - Create OAuth 2.0 credentials
   - Use the callback URL from Supabase
   - Add Client ID and Client Secret to Supabase

3. **Development Notes**
   - Google OAuth will be implemented in Phase 1 authentication tasks
   - Current setup prepares the infrastructure
   - Test with email/password authentication first

## Step 5: Test Authentication Setup

### Manual Testing via Dashboard

1. **Create Test User**
   - Go to **Authentication** > **Users**
   - Click **Invite User**
   - Enter test email: `test@clientsync.dev`
   - Set temporary password: `TestPass123!`
   - Click **Send Invitation**

2. **Verify User Creation**
   - Check that user appears in Users table
   - Verify email and created timestamp

### API Testing with curl

1. **Load Environment Variables**
   ```bash
   source .env.supabase
   ```

2. **Test Signup Endpoint**
   ```bash
   curl -X POST "${SUPABASE_URL}/auth/v1/signup" \
     -H "apikey: ${SUPABASE_ANON_KEY}" \
     -H "Content-Type: application/json" \
     -d '{
       "email": "testuser@clientsync.dev",
       "password": "TestPass123!"
     }'
   ```

3. **Expected Response**
   ```json
   {
     "user": {
       "id": "uuid-here",
       "email": "testuser@clientsync.dev",
       "created_at": "timestamp"
     },
     "session": {
       "access_token": "jwt-token-here",
       "refresh_token": "refresh-token-here"
     }
   }
   ```

4. **Test Login Endpoint**
   ```bash
   curl -X POST "${SUPABASE_URL}/auth/v1/token?grant_type=password" \
     -H "apikey: ${SUPABASE_ANON_KEY}" \
     -H "Content-Type: application/json" \
     -d '{
       "email": "testuser@clientsync.dev",
       "password": "TestPass123!"
     }'
   ```

## Security Considerations

### Development vs Production

**Development Settings (Current):**
- Email confirmations: **DISABLED** for easier testing
- CAPTCHA: **DISABLED** 
- Session duration: **1 hour** for frequent testing

**Production Settings (Future):**
- Email confirmations: **ENABLED**
- CAPTCHA: **ENABLED** for signup/password reset
- Session duration: **24 hours** or longer
- SMTP configuration for email delivery
- Custom email templates

### Important Security Notes

1. **Never expose service role key** in client-side code
2. **Always use HTTPS** in production redirect URLs
3. **Enable Row Level Security** when database tables are created
4. **Regularly rotate** service role keys
5. **Monitor authentication logs** for suspicious activity

## Troubleshooting

### Common Issues

**Authentication not working:**
- Verify anon key is correct in environment variables
- Check that Email provider is enabled
- Ensure redirect URLs match exactly (including trailing slashes)

**User creation failing:**
- Check password meets requirements (8 chars, mixed case, number)
- Verify email format is valid
- Check Supabase logs for detailed error messages

**Redirect URLs not working:**
- Ensure URLs are added exactly as listed
- Check for typos in protocol (http vs https)
- Verify port numbers match your development setup

### Debug Commands

```bash
# Test API connectivity
curl -X GET "${SUPABASE_URL}/rest/v1/" \
  -H "apikey: ${SUPABASE_ANON_KEY}"

# Check auth configuration
curl -X GET "${SUPABASE_URL}/auth/v1/settings" \
  -H "apikey: ${SUPABASE_ANON_KEY}"
```

## Next Steps

After completing this authentication setup:

1. **CS-P0-013**: Design Database Schema
2. **CS-P1-001**: Implement React Native authentication flows
3. **CS-P1-002**: Create user registration components
4. **CS-P1-003**: Set up Google OAuth integration

## References

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Supabase JavaScript Client Auth Methods](https://supabase.com/docs/reference/javascript/auth-signup)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
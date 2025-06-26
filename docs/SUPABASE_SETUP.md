# Supabase Setup Guide for ClientSync

This guide walks through the process of setting up Supabase for the ClientSync platform.

## Prerequisites

- A GitHub account or email for Supabase signup
- Access to the Supabase dashboard
- Basic understanding of PostgreSQL (optional but helpful)

## Step 1: Create Supabase Account

1. Navigate to [https://supabase.com](https://supabase.com)
2. Click "Start your project"
3. Sign up using either:
   - GitHub account (recommended for easy SSO)
   - Email and password
4. Verify your email if required

## Step 2: Create New Project

1. Once logged in, click "New Project"
2. Fill in the project details:
   - **Project name**: `clientsync-dev` (for development) or `clientsync-prod` (for production)
   - **Database Password**: 
     - Generate a strong password using the generator
     - **IMPORTANT**: Save this password securely - you cannot retrieve it later
   - **Region**: Choose the closest region to your primary user base
     - US East (North Virginia) - for East Coast US
     - US West (Oregon) - for West Coast US
     - EU (Frankfurt) - for European users
     - AP (Singapore) - for Asia-Pacific users
   - **Pricing Plan**: Free tier is sufficient for development

3. Click "Create new project"
4. Wait 2-3 minutes for provisioning to complete

## Step 3: Retrieve API Credentials

Once your project is ready:

1. Navigate to **Settings** → **API** in the Supabase dashboard
2. You'll find the following credentials:
   - **Project URL**: Your Supabase API endpoint
   - **Project API keys**:
     - **anon (public)**: Safe for client-side usage
     - **service_role (secret)**: Server-side only - has admin privileges

3. Navigate to **Settings** → **Database** for:
   - **Connection string**: Direct database connection URL

## Step 4: Configure Environment Variables

1. Copy `.env.supabase.example` to `.env.supabase`:
   ```bash
   cp .env.supabase.example .env.supabase
   ```

2. Fill in your credentials:
   ```bash
   SUPABASE_URL=https://[your-project-ref].supabase.co
   SUPABASE_ANON_KEY=[your-anon-key]
   SUPABASE_SERVICE_ROLE_KEY=[your-service-role-key]
   DATABASE_URL=[your-connection-string]
   ```

## Step 5: Configure Authentication

1. Navigate to **Authentication** → **Providers** in Supabase dashboard
2. Ensure **Email** provider is enabled (should be by default)
3. Configure email settings:
   - **Enable email confirmations**: OFF for development, ON for production
   - **Enable email change confirmations**: OFF for development, ON for production

4. Navigate to **Authentication** → **Settings**:
   - **JWT expiry**: 3600 seconds (1 hour) for development
   - **Refresh token rotation**: Enabled
   - **Security CAPTCHA**: Disabled for development

## Step 6: Test Your Setup

Test the API connection with curl:

```bash
# Load environment variables
source .env.supabase

# Test API endpoint
curl -X GET "${SUPABASE_URL}/rest/v1/" \
  -H "apikey: ${SUPABASE_ANON_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_ANON_KEY}"
```

You should receive a JSON response with the API specification.

## Step 7: Security Best Practices

### Development Environment
- Use `.env.supabase` for local development
- Never commit environment files to version control
- Use the anon key for client-side code
- Restrict service role key to server-side operations only

### Production Environment
- Use environment variables provided by your hosting platform
- Enable Row Level Security (RLS) on all tables
- Implement proper authentication flows
- Regular backup your database
- Monitor usage and set up alerts

### Key Security Rules
1. **NEVER** expose the service role key in client-side code
2. **NEVER** commit `.env` files to version control
3. **ALWAYS** use Row Level Security for data access control
4. **ALWAYS** validate and sanitize user inputs
5. **REGULARLY** rotate your service role key

## Next Steps

After completing this setup:

1. Continue with CS-P0-012: Design Database Schema
2. Set up database tables and relationships
3. Configure Row Level Security policies
4. Integrate Supabase SDK into the application

## Troubleshooting

### Common Issues

**Cannot connect to database**
- Verify your connection string is correct
- Check if your IP is allowed (Settings → Database → Connection Pooling)
- Ensure the database password is correct

**Authentication not working**
- Check if email provider is enabled
- Verify JWT settings
- Check client-side implementation of auth

**API requests failing**
- Confirm API keys are correctly set
- Check CORS settings if calling from web
- Verify RLS policies aren't blocking access

## Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase CLI](https://supabase.com/docs/guides/cli)
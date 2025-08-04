# CMS Package

This package contains the Payload CMS for the ClientSync platform.

## Current Status

### ✅ Working
- Database connection to Supabase PostgreSQL (fixed in CS-CMS-002)
- API endpoints are functional
- Schema pulls successfully from database
- Admin panel is now functional (fixed with patch script)

### ✅ Fixed Issues
1. **Admin Panel 500 Error** (CS-CMS-001) - RESOLVED
   - Error: `ServerFunctionsProvider requires a serverFunction prop`
   - Fixed by patching the auto-generated admin layout file to include the required serverFunction prop
   - Run `npm run patch-admin` after generating files to apply the fix

## Database Configuration

The CMS is configured to use Supabase PostgreSQL with the following connection string format:
```
postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
```

See `/docs/supabase-connection.md` for detailed connection configuration.

## Development

1. Install dependencies:
```bash
pnpm install
```

2. Apply the admin panel fix (required after generating files):
```bash
pnpm patch-admin
```

3. Start the CMS development server:
```bash
pnpm dev
```

The CMS will be available at http://localhost:3000

### First Time Setup

When you first access the admin panel at http://localhost:3000/admin, you'll be redirected to create the first user account.

## API Access

The API endpoints are fully functional:
- REST API: http://localhost:3000/api/[collection]
- GraphQL: http://localhost:3000/api/graphql

## Admin Panel Fix

The admin panel issue has been resolved by patching the auto-generated layout file. The patch script adds the required `serverFunction` prop that was missing in the generated file.

If you encounter the ServerFunctionsProvider error again:
1. Run `pnpm patch-admin` to apply the fix
2. Restart the development server

This patch is necessary because Payload CMS v3.44+ requires the serverFunction prop, but the auto-generated files don't include it.
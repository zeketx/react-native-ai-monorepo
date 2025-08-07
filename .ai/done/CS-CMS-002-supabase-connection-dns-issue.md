# CS-CMS-002: Fix Supabase PostgreSQL Connection DNS Resolution Issue

## Priority
High

## Description
The CMS is unable to connect to Supabase PostgreSQL database due to DNS resolution failures when trying to resolve `db.kzoqlvzcqbfwlqvqbmrd.supabase.co`. This is blocking the integration of Supabase as the database backend for the CMS.

## Current Behavior
- CMS fails to start with error: `getaddrinfo ENOTFOUND db.kzoqlvzcqbfwlqvqbmrd.supabase.co`
- The Supabase REST API is accessible (verified via curl)
- Connection string format matches Supabase documentation
- Both direct connection (port 5432) and pooler connection (port 6543) formats have been tried

## Expected Behavior
- CMS should successfully connect to Supabase PostgreSQL database
- Database migrations should run successfully
- Admin panel should be accessible without database connection errors

## Technical Details
- **Project ID**: kzoqlvzcqbfwlqvqbmrd
- **Current Connection String**: `postgresql://postgres:[REDACTED]@db.kzoqlvzcqbfwlqvqbmrd.supabase.co:5432/postgres`
- **Environment**: Local development
- **CMS Version**: Payload CMS v3.44.0
- **Database Adapter**: @payloadcms/db-postgres v3.49.1

## Investigation Notes
1. Direct connection format results in DNS resolution error
2. Pooler connection format results in "Tenant or user not found" error
3. SSL is configured with `rejectUnauthorized: false`
4. The `db.` subdomain appears to not resolve from the local environment

## Potential Solutions
1. Use the pooler connection endpoint instead of direct connection
2. Configure local DNS resolution or hosts file
3. Use Supabase connection pooling with proper configuration
4. Investigate if Supabase requires specific connection parameters for local development
5. Check if there are network/firewall restrictions blocking PostgreSQL connections

## Related Files
- `/packages/cms/src/payload.config.ts` - Database configuration
- `/packages/cms/.env` - Environment variables with connection string
- `/.env.supabase` - Supabase credentials

## Acceptance Criteria
- [x] CMS successfully connects to Supabase PostgreSQL database
- [x] Database migrations run without errors (schema pulled successfully)
- [ ] Admin panel loads without connection errors (blocked by React 19 compatibility issue)
- [x] Document the correct connection configuration for team reference

## Dependencies
- Supabase project must be properly configured
- PostgreSQL connection must be allowed from development environment

## Notes
- REST API endpoints work correctly, indicating credentials are valid
- Issue is specific to PostgreSQL direct connections
- May require Supabase support or documentation review

## Resolution
- **Fixed**: Changed from direct connection to pooler connection endpoint
- **Working Connection String**: `postgresql://postgres.kzoqlvzcqbfwlqvqbmrd:[REDACTED]@aws-0-us-east-2.pooler.supabase.com:6543/postgres`
- **Key Changes**:
  1. Use pooler endpoint format: `aws-0-us-east-2.pooler.supabase.com` instead of `db.kzoqlvzcqbfwlqvqbmrd.supabase.co`
  2. Username format includes project ref: `postgres.kzoqlvzcqbfwlqvqbmrd`
  3. Use port 6543 for transaction pooling mode
  4. Region must match Supabase project region (us-east-2)

## Remaining Issue
- CMS admin panel still returns 500 error due to React 19 compatibility issue with Payload CMS v3
- This is tracked in separate backlog item CS-CMS-001
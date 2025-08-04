# Supabase PostgreSQL Connection Configuration

## Overview
This document describes the correct configuration for connecting Payload CMS to Supabase PostgreSQL database.

## Working Connection Configuration

### Connection String Format
```
postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
```

### Example for Our Project
```
postgresql://postgres.kzoqlvzcqbfwlqvqbmrd:GrizzDev2025!@aws-0-us-east-2.pooler.supabase.com:6543/postgres
```

## Key Points

1. **Use Pooler Endpoint**: The connection must use Supabase's pooler endpoint, not the direct connection endpoint
   - ✅ Correct: `aws-0-us-east-2.pooler.supabase.com`
   - ❌ Wrong: `db.kzoqlvzcqbfwlqvqbmrd.supabase.co`

2. **Username Format**: Include project reference in username
   - Format: `postgres.[PROJECT_REF]`
   - Example: `postgres.kzoqlvzcqbfwlqvqbmrd`

3. **Port Configuration**:
   - Port 6543: Transaction pooling mode (recommended for serverless)
   - Port 5432: Session pooling mode

4. **Region**: Must match your Supabase project region
   - Our project uses: `us-east-2`

## Environment Variables

Add to `/packages/cms/.env`:
```env
DATABASE_URL=postgresql://postgres.kzoqlvzcqbfwlqvqbmrd:[YOUR-PASSWORD]@aws-0-us-east-2.pooler.supabase.com:6543/postgres
```

## Payload CMS Configuration

In `/packages/cms/src/payload.config.ts`:
```typescript
import { postgresAdapter } from '@payloadcms/db-postgres'

export default buildConfig({
  // ... other config
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false
      }
    },
  }),
  // ... rest of config
})
```

## Troubleshooting

### DNS Resolution Errors
If you see errors like `getaddrinfo ENOTFOUND db.xxx.supabase.co`, you're using the direct connection format instead of the pooler endpoint.

### Tenant Not Found Errors
This usually means:
- Wrong username format (missing project reference)
- Wrong pooling mode or port
- Incorrect region in the connection string

### SSL Certificate Errors
Ensure `ssl: { rejectUnauthorized: false }` is set in the PostgreSQL adapter configuration.

## References
- [Supabase Connection Documentation](https://supabase.com/docs/guides/database/connecting-to-postgres)
- [Supabase Connection Pooler](https://supabase.com/docs/guides/database/connection-pooling)
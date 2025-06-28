# Payload CMS Development Guidelines

## Overview
This document provides specific guidelines for working with Payload CMS in the ClientSync Travel Platform.

## Package Structure
```
packages/
├── cms/                    # Payload CMS application
│   ├── src/
│   │   ├── collections/   # Payload collections
│   │   ├── components/    # Admin UI components
│   │   ├── endpoints/     # Custom API endpoints
│   │   ├── access/        # Access control functions
│   │   └── hooks/         # Collection hooks
│   └── payload.config.ts
├── mobile-app/            # React Native app
└── shared/                # Shared utilities
```

## Development Workflow

### 1. Collection Development
- Define collections in `packages/cms/src/collections/`
- Each collection in its own file
- Use TypeScript for type safety
- Implement proper access control
- Add validation rules
- Set up hooks for business logic

### 2. API Development
- Custom endpoints in `packages/cms/src/endpoints/`
- Follow RESTful conventions
- Implement proper error handling
- Add request validation
- Document with OpenAPI/Swagger

### 3. Mobile Integration
- Generate TypeScript types from Payload
- Use generated types in mobile app
- Implement proper error handling
- Handle offline scenarios
- Cache responses appropriately

## Best Practices

### Security
- Always implement access control
- Validate all inputs
- Sanitize user data
- Use environment variables for secrets
- Implement rate limiting
- Add CORS configuration

### Performance
- Use Payload's built-in caching
- Optimize database queries
- Implement pagination
- Use field selection in queries
- Minimize payload sizes

### Testing
- Unit test collection hooks
- Integration test API endpoints
- Test access control rules
- Validate data migrations
- Performance test queries

## Common Patterns

### Authentication Flow
```typescript
// Mobile app auth service
class PayloadAuthService {
  async login(email: string, password: string)
  async logout()
  async refreshToken()
  async verifyEmail(token: string)
}
```

### Collection Relationships
```typescript
// Define relationships properly
{
  name: 'client',
  type: 'relationship',
  relationTo: 'clients',
  required: true,
  hasMany: false,
}
```

### Access Control
```typescript
// Collection access control
access: {
  read: ({ req: { user } }) => {
    if (user) return true;
    return false;
  },
  create: isAdmin,
  update: isAdminOrSelf,
  delete: isAdmin,
}
```

## Migration from Supabase

### Key Differences
1. **Auth**: JWT-based vs Supabase Auth
2. **Database**: Direct PostgreSQL vs Supabase client
3. **Real-time**: Use webhooks/polling vs Supabase real-time
4. **Storage**: Payload uploads vs Supabase storage
5. **RLS**: Collection access control vs Row Level Security

### Migration Checklist
- [ ] Map Supabase tables to Payload collections
- [ ] Convert RLS policies to access control
- [ ] Update API calls in mobile app
- [ ] Migrate authentication flow
- [ ] Update file upload handling
- [ ] Test all user flows

## Troubleshooting

### Common Issues
1. **CORS errors**: Check payload.config.ts cors settings
2. **Auth failures**: Verify JWT secret and expiry
3. **Type mismatches**: Regenerate types after schema changes
4. **Performance**: Enable query logging and optimize

### Debug Commands
```bash
# Generate types
pnpm --filter cms generate:types

# Check database connection
pnpm --filter cms db:status

# Run migrations
pnpm --filter cms db:migrate

# Seed test data
pnpm --filter cms db:seed
```

## Resources
- [Payload Documentation](https://payloadcms.com/docs)
- [Payload + React Native Tutorial](https://dev.to/aaronksaunders/videobuild-a-full-stack-mobile-app-with-react-native-expo-and-payload-cms-in-2025-3aab)
- [Payload Discord](https://discord.gg/payload)
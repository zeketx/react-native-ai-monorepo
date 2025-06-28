# CS-PC-001: Setup Payload CMS in Monorepo

## Priority
P0 - Critical Foundation

## Description
Install and configure Payload CMS within the existing monorepo structure, setting up the basic infrastructure for content management and API services.

## Acceptance Criteria
- [ ] Payload CMS installed as a new package in the monorepo
- [ ] Basic configuration with TypeScript support
- [ ] Admin UI accessible at /admin
- [ ] GraphQL and REST APIs enabled
- [ ] Integration with existing monorepo scripts (dev, build, test)
- [ ] Environment variables configured for Payload
- [ ] Basic health check endpoint working

## Technical Details
- Create new package: `packages/cms/`
- Use Payload 3.0 (Next.js native version)
- Configure with PostgreSQL database
- Set up TypeScript paths for monorepo integration
- Configure CORS for mobile app access

## Dependencies
- Node.js 18+ 
- PostgreSQL database
- Next.js 14+

## Notes
- Payload 3.0 is Next.js native, simplifying integration
- Consider using Payload Cloud for hosting or self-host
- Ensure proper separation between CMS and mobile app packages
# CS-PC-001: Setup Payload CMS in Monorepo

## Priority
P0 - Critical Foundation

## Description
Install and configure Payload CMS within the existing monorepo structure, setting up the basic infrastructure for content management and API services.

## Acceptance Criteria
- [x] Payload CMS installed as a new package in the monorepo
- [x] Basic configuration with TypeScript support
- [x] Admin UI accessible at /admin (http://localhost:3001/admin)
- [x] GraphQL and REST APIs enabled
- [x] Integration with existing monorepo scripts (dev, build, test)
- [x] Environment variables configured for Payload
- [x] Basic health check endpoint working

## Completion Notes
- Successfully installed Payload CMS 3.0 with Next.js integration
- Configured with SQLite database for development (can switch to PostgreSQL later)
- Created basic Users collection with authentication
- Admin UI accessible at http://localhost:3001/admin
- REST API available at http://localhost:3001/api
- Health check endpoint at http://localhost:3001/api/health
- Added `dev:cms` script to monorepo package.json
- CORS configured for mobile app development

## Next Steps
- Proceed to CS-PC-002: Create Collections Schema
- Consider setting up PostgreSQL for production use

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
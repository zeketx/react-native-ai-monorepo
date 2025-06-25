# Task: Configure Root Package.json for Monorepo

**ID:** CS-P0-004  
**Phase:** Foundation  
**Dependencies:** CS-P0-003

## Objective
Create and configure the root package.json file to manage the monorepo with workspace scripts and shared development dependencies.

## Acceptance Criteria
- [ ] Root package.json exists with proper monorepo configuration
- [ ] All workspace scripts are functional
- [ ] Package is marked as private
- [ ] Node and PNPM version requirements are specified
- [ ] Scripts can run commands in all workspaces

## Implementation Notes
1. Create root package.json with the following content:
   ```json
   {
     "name": "clientsync-travel-platform",
     "version": "1.0.0",
     "private": true,
     "type": "module",
     "scripts": {
       "dev:mobile": "pnpm --filter mobile-app dev",
       "dev:web": "pnpm --filter web-dashboard dev",
       "dev:all": "pnpm --parallel --filter './packages/*' dev",
       "build:all": "pnpm --filter './packages/*' build",
       "test:all": "pnpm --filter './packages/*' test",
       "lint:all": "pnpm --filter './packages/*' lint",
       "clean": "pnpm --filter './packages/*' clean && rm -rf node_modules"
     },
     "devDependencies": {
       "@types/node": "^20.0.0",
       "typescript": "^5.3.0"
     },
     "engines": {
       "node": ">=20.0.0",
       "pnpm": ">=8.0.0"
     }
   }
   ```

2. Key configuration details:
   - `"private": true` - Prevents accidental publishing of the root package
   - `"type": "module"` - Enables ESM modules
   - Filter scripts use PNPM's `--filter` flag to target specific workspaces
   - `engines` field enforces minimum versions

3. Install root dependencies:
   ```bash
   pnpm install
   ```

## Testing
- Run `pnpm dev:mobile` - should attempt to run dev script in mobile-app package
- Run `pnpm ls -r --depth 0` - should show all workspace packages
- Verify TypeScript is available: `pnpm exec tsc --version`

## Estimated Effort
1 hour
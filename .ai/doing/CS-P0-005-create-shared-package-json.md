# Task: Create Shared Package Configuration

**ID:** CS-P0-005  
**Phase:** Foundation  
**Dependencies:** CS-P0-004

## Objective
Set up the shared package with proper package.json configuration to enable sharing of TypeScript types, constants, and utilities between the mobile app and web dashboard.

## Acceptance Criteria
- [ ] packages/shared/package.json exists with proper configuration
- [ ] Package is configured for both ESM and CommonJS output
- [ ] Build scripts are configured using tsup
- [ ] Package exports are properly defined
- [ ] TypeScript is configured as a dev dependency

## Implementation Notes
1. Navigate to shared package and create package.json:
   ```bash
   cd packages/shared
   ```

2. Create package.json with the following content:
   ```json
   {
     "name": "@clientsync/shared",
     "version": "1.0.0",
     "type": "module",
     "main": "./dist/index.js",
     "types": "./dist/index.d.ts",
     "exports": {
       ".": {
         "types": "./dist/index.d.ts",
         "import": "./dist/index.js",
         "require": "./dist/index.cjs"
       }
     },
     "scripts": {
       "build": "tsup",
       "dev": "tsup --watch",
       "clean": "rm -rf dist"
     },
     "devDependencies": {
       "@types/node": "^20.0.0",
       "tsup": "^8.0.0",
       "typescript": "^5.3.0"
     }
   }
   ```

3. Key configuration details:
   - `tsup` is used for building (simpler than raw TypeScript compiler)
   - Dual package support (ESM and CommonJS)
   - Proper exports field for modern Node.js resolution
   - Watch mode for development

4. Create src directory:
   ```bash
   mkdir src
   touch src/index.ts
   ```

## Testing
- Run `pnpm install` from packages/shared
- Verify tsup is installed: `pnpm exec tsup --version`
- Package should be listable in workspace: `pnpm ls -r | grep @clientsync/shared`

## Estimated Effort
1 hour
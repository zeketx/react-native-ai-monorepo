# Task: Build and Link Shared Package

**ID:** CS-P0-010  
**Phase:** Foundation  
**Dependencies:** CS-P0-009

## Objective
Build the shared package and properly link it to both the mobile app and web dashboard packages, ensuring all exports are accessible and TypeScript types are properly resolved.

## Acceptance Criteria
- [ ] Shared package builds successfully without errors
- [ ] Distribution files are created in dist/ directory
- [ ] Package is linked in mobile-app dependencies
- [ ] Package will be linked in web-dashboard dependencies
- [ ] Types are properly resolved when importing from @clientsync/shared

## Implementation Notes
1. Build the shared package:
   ```bash
   cd packages/shared
   pnpm build
   ```

2. Verify build output includes:
   - dist/index.js (ESM)
   - dist/index.cjs (CommonJS)
   - dist/index.d.ts (TypeScript declarations)
   - dist/types.d.ts, constants.d.ts, utils.d.ts

3. Add shared package to mobile-app dependencies:
   ```json
   // In packages/mobile-app/package.json
   {
     "dependencies": {
       "@clientsync/shared": "workspace:*"
     }
   }
   ```

4. Run pnpm install from root to link packages:
   ```bash
   cd ../.. # back to root
   pnpm install
   ```

5. Test import in mobile app:
   ```typescript
   // Create test file in packages/mobile-app/src/test-shared.ts
   import { ClientTier, isValidEmail } from '@clientsync/shared'
   console.log(ClientTier.ELITE, isValidEmail('test@example.com'))
   ```

6. Set up development workflow:
   - Run `pnpm dev` in shared package for watch mode
   - Changes will automatically rebuild

## Testing
- Import types in mobile app without TypeScript errors
- Import utilities and verify they work at runtime
- Check that both ESM and CommonJS builds are present
- Verify workspace link with `pnpm ls @clientsync/shared`

## Estimated Effort
1 hour
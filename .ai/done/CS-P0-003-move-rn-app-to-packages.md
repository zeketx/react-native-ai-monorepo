# Task: Move React Native App to Packages Directory

**ID:** CS-P0-003  
**Phase:** Foundation  
**Dependencies:** CS-P0-002

## Objective
Relocate the existing React Native app from the project root to `packages/mobile-app/` while preserving all functionality and git history.

## Acceptance Criteria
- [ ] All React Native files are moved to `packages/mobile-app/`
- [ ] No React Native files remain in project root (except new monorepo config)
- [ ] Git history is preserved for moved files
- [ ] The app can still run with `pnpm dev` after moving

## Implementation Notes
1. Create a list of items to move (excluding packages/, .git, .ai, etc.):
   ```bash
   ls -A | grep -v -E '^(packages|\.git|\.ai|\.claude|pnpm-workspace\.yaml)$' > items_to_move.txt
   ```

2. Move each item to packages/mobile-app/:
   ```bash
   while read item; do
     mv "$item" packages/mobile-app/
   done < items_to_move.txt
   rm items_to_move.txt
   ```

3. Update the mobile app's package.json name:
   - Change `"name": "my-rn-app"` to `"name": "@clientsync/mobile-app"`

4. Files/directories that should be moved include:
   - src/
   - assets/
   - app.json
   - babel.config.js
   - metro.config.cjs
   - tailwind.config.ts
   - tsconfig.json
   - package.json
   - All other React Native related files

5. Files that should remain in root:
   - .git/
   - .ai/
   - pnpm-workspace.yaml
   - New root package.json (created in next task)

## Testing
- Verify no RN files left in root: `ls -la | grep -E '\.(tsx?|jsx?|json)$'`
- Check git status to ensure moves are tracked
- The app should be runnable from its new location

## Estimated Effort
1 hour
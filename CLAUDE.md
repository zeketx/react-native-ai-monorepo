# CLAUDE.md - Monorepo Guidelines

This file provides guidance to Claude Code (claude.ai/code) when working with code in this monorepo.

## Repository Structure

This is a pnpm workspace monorepo containing multiple packages:
- `packages/mobile-app/` - React Native mobile application
- `packages/cms/` - Payload CMS

## Essential Monorepo Commands

**Initial Setup:**
```bash
pnpm install                       # Install all workspace dependencies
```

**Development:**
```bash
pnpm -r dev                        # Run dev in all packages
pnpm --filter mobile-app dev       # Run dev in specific package
pnpm --filter web-dashboard dev    # Run dev in web dashboard
```

**Testing & Quality:**
```bash
pnpm -r test                       # Run tests in all packages
pnpm -r lint                       # Run linting in all packages
pnpm -r format                     # Format code in all packages
```

## Software Development Life Cycle (SDLC)

**CRITICAL: All development must follow our SDLC workflow defined in `.ai/sdlc/sdlc.md`**

### Task Management Workflow
1. **Task Files**: All tasks are individual markdown files in `.ai/backlog/`
2. **Task Lifecycle**: 
   - `.ai/backlog/` → `.ai/doing/` → `.ai/done/`
3. **Branch Strategy**: Create feature branches for each task: `git checkout -b feature/feature-name`
4. **Never Delete**: Do not delete the `.ai` folder or task directories
5. **Always Commit**: Make descriptive commits for all changes

### SDLC Quick Reference
- **Phase 1**: Task Initiation - Select from backlog, create branch, move to doing
- **Phase 2**: Development - Implement following project guidelines
- **Phase 3**: Quality Assurance - Test and verify implementation
- **Phase 4**: Completion - Update task notes, move to done, commit

For full SDLC details, see: `.ai/sdlc/sdlc.md`

## Workspace Management

**Adding Dependencies:**
```bash
# Add to specific package
pnpm --filter mobile-app add <package-name>
pnpm --filter web-dashboard add <package-name>

# Add to workspace root (dev dependencies)
pnpm add -D -w <package-name>
```

**Cross-Package Development:**
- Shared code goes in `packages/shared/`
- Import from shared: `import { util } from '@workspace/shared'`
- Ensure proper TypeScript references in `tsconfig.json`

## Git Workflow

**Branch Management:**
- Never push directly to main branch
- Feature branches: `feature/brief-description`
- One branch per task
- Merge only after review

**Commit Standards:**
- Descriptive commit messages
- Reference task files when applicable
- Include package scope: `feat(mobile-app): add user authentication`

## Package-Specific Guidelines

Each package has its own CLAUDE.md with specific instructions:
- Mobile App: `packages/mobile-app/CLAUDE.md` - React Native, Expo, i18n details
- Web Dashboard: `packages/web-dashboard/CLAUDE.md` (when created)
- Shared: `packages/shared/CLAUDE.md` (when created)

Always refer to package-specific CLAUDE.md files for detailed implementation guidance.

## Common Monorepo Issues

**Dependency Resolution:**
- Clean install: `rm -rf node_modules && rm -rf packages/*/node_modules && pnpm install`
- Update lockfile: `pnpm install --lockfile-only`

**TypeScript References:**
- Ensure proper `references` in root `tsconfig.json`
- Each package should have its own `tsconfig.json`
- Use `pnpm -r tsc:check` to verify all packages compile

**Build Order:**
- Shared packages must build before dependent packages
- Use `pnpm -r --workspace-concurrency=1 build` for sequential builds

## Development Best Practices

1. **Always check SDLC workflow** before starting new features
2. **Use workspace commands** for cross-package operations
3. **Maintain package isolation** - avoid circular dependencies
4. **Follow package conventions** - check individual CLAUDE.md files
5. **Test across packages** when making shared changes
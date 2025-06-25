# CLAUDE.md - Mobile App Package

This file provides guidance to Claude Code (claude.ai/code) when working with the mobile app package.

**Note: For monorepo-wide guidelines and SDLC workflow, see the root CLAUDE.md at `/my-rn-app/CLAUDE.md`**

## Essential Commands

**Development:**
```bash
pnpm install && pnpm dev:setup     # Initial setup after clone/pull
pnpm dev                           # Start development server
pnpm prebuild                      # Generate native iOS/Android code
pnpm ios                           # Build and run on iOS simulator
pnpm android                       # Build and run on Android
```

**Testing & Quality:**
```bash
pnpm test                          # Run all tests (TypeScript, Vitest, ESLint, Prettier)
pnpm tsc:check                     # TypeScript compilation check only
pnpm vitest:run                    # Unit tests only
pnpm lint                          # ESLint check
pnpm lint:format                   # Prettier format check
pnpm format                        # Auto-format code with Prettier
```

**Internationalization:**
```bash
pnpm fbtee                         # Full i18n workflow (manifest → collect → translate)
pnpm fbtee:manifest                # Extract translatable strings from src/
pnpm fbtee:collect                 # Generate source_strings.json
pnpm fbtee:translate               # Process translations into src/translations/
```
## WorkFlow Patterns

**IMPORTANT: When creating new features or tasks, always follow the Software Development Life Cycle workflow defined in `.ai/sdlc/sdlc.md`**

### Task-Based Development Workflow
- **Task Management**: All tasks should be created as individual markdown files in `.ai/backlog/`
- **Branch Strategy**: Create feature branches for each task using `git checkout -b feature/task-name`
- **Task Lifecycle**: Move task files through the workflow stages:
  - `.ai/backlog/` → `.ai/doing/` → `.ai/done/`
- **Never delete** the `.ai` folder or task directories
- **Always commit** changes with descriptive messages
- **Review the full SDLC workflow** in `.ai/sdlc/sdlc.md` before starting any new feature development

## Architecture Overview

### Core Technologies
- **React Native 0.79** with **New Architecture** enabled
- **Expo 53** with development build workflow (not Expo Go)
- **React 19** with **React Compiler** enabled (experimental)
- **TypeScript** with strict ESM configuration (`"type": "module"`)
- **pnpm** package manager with custom patches

### Navigation & Routing
- **Expo Router** with file-based routing in `src/app/`
- Authentication flow: unauthenticated users redirected to `/login`
- Main app behind authentication gate at `src/app/(app)/`
- Tab navigation in `src/app/(app)/(tabs)/`

### Internationalization (i18n)
- **fbtee** system for inline translations using `<fbt>` tags
- Automated string extraction and translation workflow
- Currently supports English (default) and Japanese
- Translation files in `src/translations/` and `translations/`
- Locale detection and management in `src/i18n/getLocale.tsx`

### State Management
- Custom context pattern using `@nkzw/create-context-hook`
- `ViewerContext` provides global authentication and user state
- Local settings persisted to AsyncStorage
- User authentication state controls app navigation flow

### Styling System
- **NativeWind** for Tailwind CSS in React Native
- Custom UI components in `src/ui/` with consistent design tokens
- Colors defined in `src/ui/colors.ts`
- Global CSS imported in root layout

### Key Architectural Patterns

**Authentication Flow:**
1. Root layout (`src/app/_layout.tsx`) wraps app in `ViewerContext`
2. App layout (`src/app/(app)/_layout.tsx`) checks `isAuthenticated`
3. Unauthenticated users redirected to `/login`
4. Login sets user in context, navigates to authenticated routes

**Development Build Workflow:**
- Requires `prebuild` to generate native directories before first run
- Native code regenerated when dependencies or config changes
- Development server runs independently of native builds

**ESM Configuration:**
- Package uses `"type": "module"` with `.tsx` extensions in imports
- TypeScript configured for `module: "nodenext"`
- AsyncStorage requires type casting due to ESM compatibility issues

**Custom NKZW Packages:**
- `@nkzw/core` - Utility functions
- `@nkzw/create-context-hook` - Context pattern helpers
- `@nkzw/babel-preset-fbtee` - Custom Babel preset for i18n
- `@nkzw/eslint-config` and `@nkzw/eslint-plugin-fbtee` - Linting rules

### Important File Locations
- `src/setup.tsx` - Global app initialization and fbtee setup
- `src/user/useViewerContext.tsx` - Authentication and user state management
- `src/i18n/getLocale.tsx` - Internationalization logic
- `app.json` - Expo configuration with React Compiler and experimental features
- `translations/*.json` - Translation source files for fbtee processing

### Common Issues
- **Reanimated version mismatch:** Clean and rebuild native directories with `rm -rf ios android && pnpm prebuild`
- **Route export errors:** Ensure all route files have proper React component default exports
- **iOS build failures with Xcode 15.x:** The expo-modules-core uses iOS 18+ APIs. Apply patch with:
  ```bash
  pnpm patch expo-modules-core
  # Edit AutoSizingStack.swift to use GeometryReader instead of onGeometryChange
  pnpm patch-commit /path/to/patch
  ```
  The patch replaces the iOS 18+ `onGeometryChange` modifier with iOS 16+ compatible `GeometryReader` + `onChange`.
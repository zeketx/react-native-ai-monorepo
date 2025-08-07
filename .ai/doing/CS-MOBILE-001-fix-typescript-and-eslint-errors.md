# CS-MOBILE-001: Fix Mobile App TypeScript and ESLint Errors

## Priority
High

## Estimated Effort
6-8 hours

## Overview
The mobile app package has significant TypeScript compilation errors (116+) and ESLint violations (1,276+) that prevent the monorepo from being test-ready. These errors block proper development workflow and CI/CD processes.

## Background
- Web dashboard and shared packages are fully passing tests and linting
- Mobile app is the only package preventing full monorepo testing
- Current branch: `feature/fix-mobile-app-type-and-lint-errors`
- Formatting issues have been resolved with Prettier

## Critical Issues Identified

### 1. TypeScript Compilation Errors (116+ errors)

#### Tab Navigation Component Issues
- **Location**: `src/app/(app)/(tabs)/_layout.tsx`
- **Errors**: Implicit `any` types for `focused` and `color` parameters
- **Lines**: 43, 56, 69 (multiple tab icon components)

#### Authentication Service Interface Mismatches
- **Location**: `src/user/useViewerContext.tsx`
- **Issues**: 
  - Missing `getSession`, `onAuthStateChange`, `signIn`, `signUp`, `signOut` methods
  - Implicit `any` type for event parameter (line 105)

#### Form Validation Type Errors
- **Location**: `src/app/login-supabase.tsx`
- **Issues**: Type resolver incompatibility with form schema

#### Test Configuration Issues
- **Location**: `src/tests/auth.test.ts`
- **Issues**: 
  - Missing `vi` global from Vitest
  - `authService` not exported from shared package
  - Import resolution problems

#### Unused Import Warnings
- Multiple files with unused `Image`, `Constants`, `isAuthenticated` imports
- `fbs` import declaration but never used

### 2. ESLint Violations (1,276+ errors)

#### Object/Interface Property Sorting (Major Category)
- **Rule**: `perfectionist/sort-interfaces`, `perfectionist/sort-objects`, `perfectionist/sort-jsx-props`
- **Impact**: Hundreds of violations across multiple files
- **Files**: API client, error handlers, UI components

#### Type Safety Issues
- **Rule**: `@typescript-eslint/no-explicit-any`
- **Impact**: 50+ explicit `any` types need proper typing
- **Files**: `src/api/client.ts`, `src/api/errors.ts`, form components

#### Code Quality Issues
- **Rule**: `no-console`
- **Impact**: Console statements in production code
- **Files**: `src/user/useViewerContext.tsx`, error handling utilities

#### Import/Export Organization
- **Rule**: `unicorn/prefer-number-properties`
- **Impact**: Use `Number.parseInt` instead of global `parseInt`

## Requirements

### Immediate TypeScript Fixes
1. Add proper type annotations for tab navigation icons
2. Fix authentication service interface definitions
3. Resolve form validation type errors
4. Fix test imports and Vitest configuration
5. Remove unused imports and declarations

### ESLint Compliance
1. Sort object/interface properties according to perfectionist rules
2. Replace explicit `any` types with proper TypeScript interfaces
3. Remove console statements from production code
4. Fix import ordering and naming conventions
5. Use recommended utility functions (Number.parseInt, etc.)

### Testing & Validation
- [ ] TypeScript compilation passes (`pnpm tsc:check`)
- [ ] All ESLint rules pass (`pnpm lint`)
- [ ] Unit tests run successfully (`pnpm vitest:run`)
- [ ] Formatting remains consistent (`pnpm lint:format`)

## Technical Implementation Strategy

### Phase 1: TypeScript Error Resolution (Est: 2-3 hours)
1. **Fix Navigation Types**: Add proper type annotations for Expo Router tab icons
2. **Authentication Interface**: Update auth service interfaces in shared package
3. **Form Validation**: Fix type resolver compatibility
4. **Test Configuration**: Fix Vitest imports and shared package exports
5. **Cleanup Imports**: Remove unused imports and declarations

### Phase 2: ESLint Compliance (Est: 3-4 hours)
1. **Automated Fixes**: Use `eslint --fix` for sortable properties and simple fixes
2. **Type Improvements**: Replace `any` types with proper interfaces
3. **Code Quality**: Remove console statements, add proper error handling
4. **Manual Review**: Address complex sorting and organization issues

### Phase 3: Testing & Verification (Est: 1 hour)
1. **Full Test Suite**: Run all mobile app tests
2. **Integration Testing**: Verify with other packages
3. **Documentation**: Update any affected documentation

## Implementation Notes

### Key Files to Address
- `src/app/(app)/(tabs)/_layout.tsx` - Navigation type errors
- `src/user/useViewerContext.tsx` - Auth interface mismatches
- `src/app/login-supabase.tsx` - Form validation types
- `src/tests/auth.test.ts` - Test configuration
- `src/api/client.ts` - Major ESLint violations
- `src/api/errors.ts` - Type and sorting issues

### Shared Package Dependencies
- May need to export additional auth service interfaces
- Ensure proper TypeScript declaration files
- Verify Vitest test utilities are properly exported

### Potential Challenges
1. **Breaking Changes**: Type fixes may require interface updates
2. **Test Dependencies**: Shared package exports may need adjustment
3. **ESLint Rules**: Some perfectionist rules may conflict with code readability

## Acceptance Criteria
1. **Zero TypeScript Errors**: `pnpm tsc:check` passes without errors
2. **Zero ESLint Errors**: `pnpm lint` passes without warnings or errors  
3. **All Tests Pass**: `pnpm test` completes successfully
4. **Code Quality**: No console statements in production code
5. **Type Safety**: No explicit `any` types except where absolutely necessary
6. **Consistent Formatting**: All code follows project formatting standards

## Dependencies
- Shared package may need interface exports
- Vitest configuration may need updates
- ESLint configuration is already properly set up

## Notes
- This task unblocks full monorepo testing capability
- Critical for establishing proper CI/CD pipeline
- Sets foundation for future mobile app development
- Web dashboard and shared packages are already compliant

## Related Tasks
- Follows completion of workspace configuration fixes (committed to main)
- Enables future mobile app feature development
- Required before any mobile app deployment tasks
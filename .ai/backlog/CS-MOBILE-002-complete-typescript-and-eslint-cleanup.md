# CS-MOBILE-002: Complete TypeScript and ESLint Cleanup for Mobile App

## Priority
Medium

## Estimated Effort
4-6 hours

## Overview
Complete the remaining TypeScript and ESLint cleanup for mobile app after major fixes from CS-MOBILE-001. This task addresses the remaining ~53 TypeScript errors and 1,276 ESLint violations to achieve full compliance.

## Background
CS-MOBILE-001 successfully resolved 60%+ of TypeScript errors (from 116+ down to ~53). The core application functionality is now working with proper type safety, but there are remaining issues to address for full compliance and code quality.

## Current Status After CS-MOBILE-001
✅ **Resolved (60%+ improvement):**
- Navigation type annotations fixed
- Authentication service interfaces aligned
- Form validation type constraints resolved
- Shared package exports configured correctly
- Auth context imports and types working
- Major unused imports removed

⏳ **Remaining Issues (~53 TypeScript errors):**

### 1. Test Configuration Files
- **Location**: `src/tests/auth.test.ts`
- **Issues**: 
  - Missing Vitest global `vi` imports
  - Test setup and mock configuration
  - Import resolution for test utilities

### 2. Integration Test Files
- **Location**: `src/test-integration.ts`, `src/test-supabase.ts`
- **Issues**:
  - Missing module declarations
  - Unused variable declarations
  - Import path resolution issues

### 3. Library Configuration Issues
- **Location**: `src/lib/supabase.ts`
- **Issues**:
  - Missing `createSupabaseClient` export from shared package
  - Expo Constants API changes (`expoConfig` property)
  - Import/export mismatches

### 4. Remaining Import/Export Fixes
- **Various files**: Small import extension and export pattern issues
- **Auth hooks**: Some imports still using old path patterns

## ESLint Violations (1,276 errors)

### Major Categories:
1. **Object/Interface Property Sorting** (~800 errors)
   - Rule: `perfectionist/sort-interfaces`, `perfectionist/sort-objects`, `perfectionist/sort-jsx-props`
   - Impact: Consistency and readability across codebase
   - **Automated Fix**: Most can be resolved with `eslint --fix`

2. **Type Safety Issues** (~200 errors)
   - Rule: `@typescript-eslint/no-explicit-any`
   - Impact: Replace explicit `any` types with proper TypeScript interfaces
   - **Manual Fix Required**: Context-specific type definitions needed

3. **Code Quality Issues** (~100 errors)
   - Rule: `no-console`
   - Impact: Remove console statements from production code
   - Replace with proper logging or remove debug statements

4. **Import/Export Organization** (~100 errors)
   - Various import ordering and naming convention violations
   - **Automated Fix**: Most can be resolved with `eslint --fix`

5. **Utility Function Updates** (~76 errors)
   - Rule: `unicorn/prefer-number-properties`
   - Impact: Use `Number.parseInt` instead of global `parseInt`
   - **Automated Fix**: Can be resolved with `eslint --fix`

## Technical Implementation Strategy

### Phase 1: Complete TypeScript Cleanup (2 hours)
1. **Fix Test Configuration**
   - Add proper Vitest imports and setup
   - Configure test globals and mock utilities
   - Fix import resolution for test files

2. **Resolve Library Configuration**
   - Export missing functions from shared package
   - Update Expo Constants usage for newer API
   - Fix remaining import/export patterns

3. **Clean Up Integration Tests**
   - Remove or fix test files that aren't actively used
   - Ensure proper TypeScript configuration for tests

### Phase 2: ESLint Mass Cleanup (2-3 hours)
1. **Automated Fixes First**
   ```bash
   pnpm --filter mobile-app lint --fix
   ```
   - Object/interface property sorting
   - Import ordering and organization
   - Simple rule violations

2. **Manual Type Safety Improvements**
   - Replace `any` types with proper interfaces
   - Add proper type annotations where missing
   - Ensure type safety throughout codebase

3. **Code Quality Improvements**
   - Remove console statements from production code
   - Add proper error handling where needed
   - Update utility function usage

### Phase 3: Final Validation (1 hour)
1. **Full Test Suite**
   - Ensure all TypeScript compilation passes
   - Verify all ESLint rules pass
   - Run complete test suite

2. **Integration Testing**
   - Verify mobile app builds and runs correctly
   - Test authentication flow end-to-end
   - Validate navigation and core functionality

## Acceptance Criteria
1. **Zero TypeScript Errors**: `pnpm tsc:check` passes without any errors
2. **Zero ESLint Errors**: `pnpm lint` passes without warnings or errors
3. **All Tests Pass**: `pnpm test` completes successfully for all packages
4. **Build Success**: Mobile app builds without errors
5. **Functional Testing**: Core features (auth, navigation, forms) work correctly
6. **Code Quality**: No console statements, proper type safety maintained

## Implementation Notes

### Key Focus Areas
- Test configuration and setup (highest impact on TypeScript errors)
- Automated ESLint fixes for bulk property sorting
- Strategic `any` type replacement with proper interfaces
- Utility function modernization

### Dependencies
- Vitest configuration may need updates
- Shared package exports may need additional functions
- ESLint configuration is already properly set up

### Risk Mitigation
- Run automated fixes in phases to catch any breaking changes
- Test core functionality after each phase
- Keep changes focused and atomic for easier debugging

## Success Metrics
- TypeScript errors: 53 → 0 (100% resolution)
- ESLint violations: 1,276 → 0 (100% resolution) 
- Test pass rate: Maintain 100% for existing tests
- Build time: No significant regression
- App functionality: All core features working

## Related Tasks
- Builds on CS-MOBILE-001 (major TypeScript fixes)
- Enables future mobile app CI/CD pipeline setup
- Required before production mobile app deployment
- Foundation for code quality standards across monorepo

## Notes
- This task represents the final step for mobile app code quality compliance
- After completion, mobile app will match web dashboard and shared package quality standards
- Sets foundation for future feature development with proper type safety
- Critical for establishing reliable CI/CD processes
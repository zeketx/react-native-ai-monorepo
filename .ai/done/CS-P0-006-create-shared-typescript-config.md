# Task: Configure TypeScript for Shared Package

**ID:** CS-P0-006  
**Phase:** Foundation  
**Dependencies:** CS-P0-005

## Objective
Set up TypeScript configuration for the shared package with proper compiler options for building a library that works with both React Native and web environments.

## Acceptance Criteria
- [ ] tsconfig.json exists in packages/shared
- [ ] tsup.config.ts exists for build configuration
- [ ] TypeScript compiles without errors
- [ ] Configuration supports ES2022 target
- [ ] Declaration files are generated

## Implementation Notes
1. Create packages/shared/tsconfig.json:
   ```json
   {
     "compilerOptions": {
       "target": "ES2022",
       "module": "ESNext",
       "lib": ["ES2022"],
       "declaration": true,
       "outDir": "./dist",
       "rootDir": "./src",
       "strict": true,
       "esModuleInterop": true,
       "skipLibCheck": true,
       "forceConsistentCasingInFileNames": true,
       "moduleResolution": "bundler",
       "allowSyntheticDefaultImports": true,
       "resolveJsonModule": true
     },
     "include": ["src/**/*"],
     "exclude": ["node_modules", "dist"]
   }
   ```

2. Create packages/shared/tsup.config.ts:
   ```typescript
   import { defineConfig } from 'tsup'

   export default defineConfig({
     entry: ['src/index.ts'],
     splitting: false,
     sourcemap: true,
     clean: true,
     dts: true,
     format: ['cjs', 'esm'],
     external: ['react', 'react-native']
   })
   ```

3. Key configuration details:
   - ES2022 target for modern JavaScript features
   - Bundler module resolution for compatibility
   - External dependencies to avoid bundling React
   - Both CommonJS and ESM output formats
   - Source maps for debugging

## Testing
- Create a test file src/test.ts with: `export const test = 'hello'`
- Run `pnpm build` - should create dist/ directory
- Check dist/ contains .js, .cjs, and .d.ts files
- No TypeScript errors should occur

## Estimated Effort
1 hour
# Build and Quality Check

Perform a comprehensive build and quality validation:

1. **Run all tests** to ensure code quality:
   ```bash
   pnpm test
   ```

2. **Generate native build** to verify configuration:
   ```bash
   pnpm prebuild
   ```

3. **Auto-format code** if formatting issues were found:
   ```bash
   pnpm format
   ```

This ensures the project is ready for deployment with:
- All tests passing (TypeScript, Vitest, ESLint, Prettier)
- Native build configuration working
- Code properly formatted
# Run All Tests

Execute the complete test suite including TypeScript checking, unit tests, linting, and formatting:

```bash
pnpm test
```

This single command runs:
- TypeScript compilation check (`pnpm tsc:check`)
- Unit tests with Vitest (`pnpm vitest:run`)
- ESLint code quality checks (`pnpm lint`)
- Prettier formatting validation (`pnpm lint:format`)

All tests must pass for the build to be considered healthy.
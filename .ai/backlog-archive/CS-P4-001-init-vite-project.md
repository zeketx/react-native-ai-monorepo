# Task: Initialize Vite Web Dashboard Project

**ID:** CS-P4-001  
**Phase:** Web Dashboard  
**Dependencies:** CS-P0-002

## Objective
Scaffold a new React web application using Vite within the monorepo structure, configured for optimal development experience and production performance.

## Context
The web dashboard serves travel organizers to manage clients and monitor trips. Vite provides fast HMR, optimized builds, and excellent TypeScript support. The project must integrate seamlessly with the monorepo structure and share code with other packages.

## Requirements
- React 18 with TypeScript
- Vite configuration for development
- Monorepo integration with shared packages
- Environment variable management
- Build optimization settings
- Development server proxy setup

## Technical Guidance
- Initialize with Vite React-TS template
- Configure for monorepo imports
- Set up path aliases
- Enable build optimization
- Configure dev server
- Add workspace dependencies

## Project Structure
```bash
packages/web-dashboard/
├── public/
│   ├── favicon.ico
│   └── manifest.json
├── src/
│   ├── assets/
│   ├── components/
│   ├── pages/
│   ├── services/
│   ├── hooks/
│   ├── utils/
│   ├── App.tsx
│   ├── main.tsx
│   └── vite-env.d.ts
├── .env.example
├── .eslintrc.cjs
├── index.html
├── package.json
├── tsconfig.json
├── tsconfig.node.json
└── vite.config.ts
```

## Vite Configuration
```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@clientsync/shared': path.resolve(__dirname, '../shared/src')
    }
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: process.env.VITE_SUPABASE_URL,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'supabase': ['@supabase/supabase-js']
        }
      }
    }
  }
});
```

## Package.json Setup
```json
{
  "name": "@clientsync/web-dashboard",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "lint": "eslint src --ext ts,tsx",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "@clientsync/shared": "workspace:*",
    "@supabase/supabase-js": "^2.x",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.x"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@vitejs/plugin-react": "^4.x",
    "vite": "^5.x"
  }
}
```

## TypeScript Configuration
- Strict mode enabled
- Path alias support
- Shared package imports
- React JSX transform
- ES2022 target

## Environment Setup
```env
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=xxx
VITE_APP_ENV=development
```

## Acceptance Criteria
- [ ] Project initializes successfully
- [ ] Dev server runs on port 3000
- [ ] HMR works with React
- [ ] Shared package imports work
- [ ] Build produces optimized output
- [ ] TypeScript strict mode passes

## Where to Create
- `packages/web-dashboard/` directory
- Initialize with `pnpm create vite`
- Configure files as specified

## Next Steps
- Install Tailwind CSS (CS-P4-002)
- Set up React Router (CS-P4-003)
- Create dashboard layout (CS-P4-004)

## Estimated Effort
1 hour
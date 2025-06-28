# Task: Setup Vercel Deployment for Web Dashboard

**ID:** CS-P5-008  
**Phase:** Testing & Deployment  
**Dependencies:** CS-P4-001

## Objective
Configure automated deployment of the web dashboard to Vercel with proper environment management, preview deployments, custom domain setup, and monitoring integration.

## Context
Vercel provides optimal hosting for React applications with features like edge functions, automatic HTTPS, global CDN, and seamless GitHub integration. The deployment must handle multiple environments (development, staging, production) with appropriate security and performance optimizations.

## Requirements
- Vercel project setup
- Environment configuration
- Preview deployments
- Custom domain setup
- Performance optimization
- Monitoring integration

## Technical Guidance
- Configure vercel.json
- Set up build pipeline
- Manage secrets
- Configure redirects
- Optimize caching
- Set up analytics

## Vercel Configuration
```json
// vercel.json
{
  "framework": "vite",
  "buildCommand": "pnpm build",
  "outputDirectory": "dist",
  "installCommand": "pnpm install",
  "devCommand": "pnpm dev --port $PORT",
  
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  
  "routes": [
    {
      "src": "/api/(.*)",
      "headers": {
        "cache-control": "no-cache, no-store, must-revalidate",
        "x-content-type-options": "nosniff",
        "x-frame-options": "DENY",
        "x-xss-protection": "1; mode=block"
      }
    },
    {
      "src": "/assets/(.*)",
      "headers": {
        "cache-control": "public, max-age=31536000, immutable"
      }
    },
    {
      "handle": "filesystem"
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ],
  
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        },
        {
          "key": "Permissions-Policy",
          "value": "camera=(), microphone=(), geolocation=()"
        }
      ]
    }
  ],
  
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://api.clientsync.com/:path*"
    }
  ],
  
  "redirects": [
    {
      "source": "/app",
      "destination": "https://app.clientsync.com",
      "permanent": false
    }
  ],
  
  "functions": {
    "api/health.ts": {
      "maxDuration": 10
    },
    "api/webhook.ts": {
      "maxDuration": 30
    }
  },
  
  "crons": [
    {
      "path": "/api/cron/daily-reports",
      "schedule": "0 9 * * *"
    }
  ]
}
```

## Environment Configuration
```typescript
// scripts/setup-vercel-env.ts
import { vercel } from '@vercel/client';

const environments = ['production', 'preview', 'development'] as const;

interface EnvVariable {
  key: string;
  value: string;
  target: typeof environments[number][];
  sensitive?: boolean;
}

const envVariables: EnvVariable[] = [
  // Public variables
  {
    key: 'VITE_APP_NAME',
    value: 'ClientSync Dashboard',
    target: ['production', 'preview', 'development'],
  },
  {
    key: 'VITE_API_URL',
    value: process.env.VITE_API_URL!,
    target: ['production'],
  },
  {
    key: 'VITE_API_URL',
    value: process.env.VITE_STAGING_API_URL!,
    target: ['preview'],
  },
  
  // Sensitive variables
  {
    key: 'VITE_SUPABASE_URL',
    value: process.env.VITE_SUPABASE_URL!,
    target: ['production', 'preview'],
    sensitive: true,
  },
  {
    key: 'VITE_SUPABASE_ANON_KEY',
    value: process.env.VITE_SUPABASE_ANON_KEY!,
    target: ['production', 'preview'],
    sensitive: true,
  },
  {
    key: 'SENTRY_DSN',
    value: process.env.SENTRY_DSN!,
    target: ['production', 'preview'],
    sensitive: true,
  },
  {
    key: 'VERCEL_ANALYTICS_ID',
    value: process.env.VERCEL_ANALYTICS_ID!,
    target: ['production'],
    sensitive: true,
  },
];

async function setupVercelEnvironment() {
  const client = vercel({
    token: process.env.VERCEL_TOKEN!,
  });
  
  for (const envVar of envVariables) {
    for (const target of envVar.target) {
      await client.env.add({
        key: envVar.key,
        value: envVar.value,
        target: [target],
        type: envVar.sensitive ? 'encrypted' : 'plain',
      });
      
      console.log(`✓ Set ${envVar.key} for ${target}`);
    }
  }
  
  console.log('✅ Vercel environment setup complete');
}

setupVercelEnvironment().catch(console.error);
```

## Build Optimization
```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';
import viteCompression from 'vite-plugin-compression';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    
    // Compression
    viteCompression({
      algorithm: 'gzip',
      ext: '.gz',
    }),
    viteCompression({
      algorithm: 'brotliCompress',
      ext: '.br',
    }),
    
    // PWA
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'robots.txt', 'apple-touch-icon.png'],
      manifest: {
        name: 'ClientSync Dashboard',
        short_name: 'ClientSync',
        theme_color: '#ffffff',
        icons: [
          {
            src: '/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
    }),
    
    // Bundle analysis
    visualizer({
      filename: './dist/stats.html',
      open: false,
      gzipSize: true,
      brotliSize: true,
    }),
  ],
  
  build: {
    target: 'es2015',
    cssCodeSplit: true,
    sourcemap: true,
    
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['@headlessui/react', '@heroicons/react'],
          'supabase': ['@supabase/supabase-js'],
          'utils': ['date-fns', 'lodash-es'],
        },
      },
    },
    
    // Optimize chunks
    chunkSizeWarningLimit: 500,
    
    // Minification
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
  },
  
  // Optimize dependencies
  optimizeDeps: {
    include: ['react', 'react-dom', '@supabase/supabase-js'],
  },
});
```

## Deployment Scripts
```bash
#!/bin/bash
# scripts/deploy.sh

set -e

echo "🚀 Starting deployment process..."

# Check environment
if [ -z "$1" ]; then
  echo "Usage: ./deploy.sh [production|staging]"
  exit 1
fi

ENVIRONMENT=$1

# Run tests
echo "🧪 Running tests..."
pnpm test:ci

# Type check
echo "📝 Type checking..."
pnpm type-check

# Build
echo "🔨 Building application..."
pnpm build

# Deploy to Vercel
echo "🌐 Deploying to Vercel..."
if [ "$ENVIRONMENT" = "production" ]; then
  vercel --prod --yes
else
  vercel --yes
fi

# Run post-deployment checks
echo "✅ Running post-deployment checks..."
pnpm test:e2e:production

echo "✨ Deployment complete!"
```

## GitHub Actions Integration
```yaml
# .github/workflows/vercel-deploy.yml
name: Vercel Deployment

on:
  push:
    branches:
      - main
      - develop
  pull_request:
    types: [opened, synchronize, reopened]

env:
  VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
  VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: 18
          cache: 'pnpm'
          
      - name: Install dependencies
        run: pnpm install --frozen-lockfile
        
      - name: Run tests
        run: pnpm test:ci
        
      - name: Build
        run: pnpm build
        env:
          VITE_API_URL: ${{ secrets.VITE_API_URL }}
          VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
          VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}
          
      - name: Deploy to Vercel
        run: |
          if [[ ${{ github.ref }} == 'refs/heads/main' ]]; then
            vercel pull --yes --environment=production --token=${{ secrets.VERCEL_TOKEN }}
            vercel build --prod --token=${{ secrets.VERCEL_TOKEN }}
            vercel deploy --prebuilt --prod --token=${{ secrets.VERCEL_TOKEN }}
          else
            vercel pull --yes --environment=preview --token=${{ secrets.VERCEL_TOKEN }}
            vercel build --token=${{ secrets.VERCEL_TOKEN }}
            vercel deploy --prebuilt --token=${{ secrets.VERCEL_TOKEN }}
          fi
          
      - name: Comment PR
        if: github.event_name == 'pull_request'
        uses: actions/github-script@v6
        with:
          script: |
            const { data: deployment } = await github.repos.listDeployments({
              owner: context.repo.owner,
              repo: context.repo.repo,
              ref: context.ref
            });
            
            const url = deployment[0]?.payload?.web_url || 'Deployment URL not available';
            
            github.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: `🚀 Preview deployment ready!\n\n🔗 ${url}`
            });
```

## Custom Domain Setup
```typescript
// scripts/setup-domain.ts
import { vercel } from '@vercel/client';

async function setupCustomDomain() {
  const client = vercel({
    token: process.env.VERCEL_TOKEN!,
  });
  
  // Add domain
  await client.domains.add({
    name: 'dashboard.clientsync.com',
  });
  
  // Configure DNS
  const dnsRecords = await client.domains.getDNSRecords('dashboard.clientsync.com');
  
  console.log('Add these DNS records to your domain:');
  dnsRecords.forEach(record => {
    console.log(`${record.type} ${record.name} ${record.value}`);
  });
  
  // Set up SSL
  await client.certs.create({
    domains: ['dashboard.clientsync.com'],
  });
  
  // Configure redirects
  await client.projects.addDomain({
    projectId: process.env.VERCEL_PROJECT_ID!,
    domain: 'dashboard.clientsync.com',
    redirect: 'www.dashboard.clientsync.com',
  });
}
```

## Edge Functions
```typescript
// api/health.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.VERCEL_ENV,
    region: process.env.VERCEL_REGION,
  };
  
  // Check external services
  try {
    const supabaseHealth = await checkSupabaseHealth();
    health.services = {
      supabase: supabaseHealth,
    };
  } catch (error) {
    health.status = 'degraded';
    health.error = error.message;
  }
  
  res.status(health.status === 'healthy' ? 200 : 503).json(health);
}

async function checkSupabaseHealth(): Promise<boolean> {
  const response = await fetch(`${process.env.VITE_SUPABASE_URL}/rest/v1/`);
  return response.ok;
}
```

## Monitoring Integration
```typescript
// src/lib/monitoring.ts
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import * as Sentry from '@sentry/react';

export function initializeMonitoring() {
  // Vercel Analytics
  if (import.meta.env.PROD) {
    Analytics();
    SpeedInsights();
  }
  
  // Sentry
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    environment: import.meta.env.VERCEL_ENV || 'development',
    integrations: [
      new Sentry.BrowserTracing(),
      new Sentry.Replay(),
    ],
    tracesSampleRate: import.meta.env.PROD ? 0.1 : 1.0,
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
  });
  
  // Custom vitals reporting
  if ('web-vitals' in window) {
    import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
      getCLS(sendToAnalytics);
      getFID(sendToAnalytics);
      getFCP(sendToAnalytics);
      getLCP(sendToAnalytics);
      getTTFB(sendToAnalytics);
    });
  }
}

function sendToAnalytics(metric: any) {
  // Send to Vercel Analytics
  if (window.va) {
    window.va('event', 'Web Vitals', {
      metric: metric.name,
      value: metric.value,
      rating: metric.rating,
    });
  }
}
```

## Performance Budget
```javascript
// scripts/check-performance.js
const puppeteer = require('puppeteer');
const lighthouse = require('lighthouse');

async function checkPerformance(url) {
  const browser = await puppeteer.launch();
  const { lhr } = await lighthouse(url, {
    port: new URL(browser.wsEndpoint()).port,
    output: 'json',
    logLevel: 'info',
  });
  
  await browser.close();
  
  const budget = {
    performance: 90,
    accessibility: 95,
    'best-practices': 90,
    seo: 90,
  };
  
  const results = {};
  let failed = false;
  
  Object.keys(budget).forEach(key => {
    const score = lhr.categories[key].score * 100;
    results[key] = score;
    
    if (score < budget[key]) {
      console.error(`❌ ${key}: ${score} (budget: ${budget[key]})`);
      failed = true;
    } else {
      console.log(`✅ ${key}: ${score}`);
    }
  });
  
  if (failed) {
    process.exit(1);
  }
}

checkPerformance(process.argv[2]);
```

## Acceptance Criteria
- [ ] Vercel project configured
- [ ] Deployments work automatically
- [ ] Preview URLs generate
- [ ] Custom domain works
- [ ] Performance optimized
- [ ] Monitoring integrated

## Where to Create
- `packages/web-dashboard/vercel.json`
- Deployment scripts in `scripts/`
- GitHub Actions in `.github/workflows/`

## Deployment Checklist
- [ ] Environment variables set
- [ ] Build optimization configured
- [ ] Custom domain DNS configured
- [ ] SSL certificates active
- [ ] Monitoring enabled
- [ ] Performance budget met

## Estimated Effort
2 hours
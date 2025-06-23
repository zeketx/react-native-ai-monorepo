# Task: Configure Tailwind CSS for Web Dashboard

**ID:** CS-P4-002  
**Phase:** Web Dashboard  
**Dependencies:** CS-P4-001

## Objective
Set up Tailwind CSS in the web dashboard with a consistent design system, custom theme configuration, and component library foundation that aligns with the mobile app's design language.

## Context
The web dashboard needs a robust styling solution that enables rapid UI development while maintaining consistency with the mobile app's design system. Tailwind CSS provides utility-first styling with excellent customization options and performance optimization.

## Requirements
- Tailwind CSS v3 with PostCSS
- Custom theme matching mobile app
- Component plugin architecture
- Dark mode support
- Responsive design utilities
- Production optimization

## Technical Guidance
- Install Tailwind with PostCSS
- Configure custom design tokens
- Set up component classes
- Enable JIT compilation
- Configure PurgeCSS
- Add custom plugins

## Installation & Configuration
```bash
# Dependencies
pnpm add -D tailwindcss postcss autoprefixer @tailwindcss/forms @tailwindcss/typography
pnpm dlx tailwindcss init -p
```

## Tailwind Configuration
```typescript
// tailwind.config.ts
import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          900: '#1e3a8a',
        },
        tier: {
          silver: '#C0C0C0',
          gold: '#FFD700',
          platinum: '#E5E4E2',
        },
        status: {
          draft: '#6B7280',
          confirmed: '#10B981',
          active: '#3B82F6',
          completed: '#8B5CF6',
          cancelled: '#EF4444',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      animation: {
        'slide-in': 'slideIn 0.2s ease-out',
        'fade-in': 'fadeIn 0.3s ease-out',
      },
      keyframes: {
        slideIn: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    customComponentPlugin,
  ],
};

// Custom component plugin
function customComponentPlugin({ addComponents, theme }) {
  addComponents({
    '.btn': {
      padding: theme('spacing.3') + ' ' + theme('spacing.6'),
      borderRadius: theme('borderRadius.md'),
      fontWeight: theme('fontWeight.medium'),
      transition: 'all 150ms',
    },
    '.btn-primary': {
      backgroundColor: theme('colors.primary.600'),
      color: 'white',
      '&:hover': {
        backgroundColor: theme('colors.primary.700'),
      },
    },
    '.card': {
      backgroundColor: 'white',
      borderRadius: theme('borderRadius.lg'),
      padding: theme('spacing.6'),
      boxShadow: theme('boxShadow.sm'),
    },
  });
}

export default config;
```

## Global Styles
```css
/* src/index.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --color-primary: 37 99 235;
    --color-background: 255 255 255;
    --color-text: 17 24 39;
  }
  
  .dark {
    --color-background: 17 24 39;
    --color-text: 243 244 246;
  }
  
  body {
    @apply bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-100;
  }
}

@layer components {
  .container {
    @apply mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl;
  }
  
  .form-input {
    @apply block w-full rounded-md border-gray-300 shadow-sm
           focus:border-primary-500 focus:ring-primary-500;
  }
  
  .badge {
    @apply inline-flex items-center px-2.5 py-0.5 rounded-full
           text-xs font-medium;
  }
}
```

## Component Examples
```tsx
// Tier Badge Component
const TierBadge: React.FC<{ tier: ClientTier }> = ({ tier }) => (
  <span className={`badge bg-tier-${tier} text-white`}>
    {tier.charAt(0).toUpperCase() + tier.slice(1)} Member
  </span>
);

// Status Indicator
const StatusIndicator: React.FC<{ status: TripStatus }> = ({ status }) => (
  <div className={`flex items-center gap-2`}>
    <div className={`w-2 h-2 rounded-full bg-status-${status}`} />
    <span className="text-sm capitalize">{status}</span>
  </div>
);
```

## Responsive Utilities
- Mobile-first breakpoints
- Container queries support
- Fluid typography scale
- Grid system helpers
- Flexbox utilities

## Acceptance Criteria
- [ ] Tailwind compiles successfully
- [ ] Custom theme applies correctly
- [ ] Dark mode toggle works
- [ ] Component classes available
- [ ] Production build optimized
- [ ] No unused CSS in bundle

## Where to Create
- `packages/web-dashboard/tailwind.config.ts`
- `packages/web-dashboard/postcss.config.js`
- `packages/web-dashboard/src/index.css`

## Performance Optimization
- JIT mode enabled
- PurgeCSS configured
- Critical CSS inlined
- Unused variants removed

## Estimated Effort
1.5 hours
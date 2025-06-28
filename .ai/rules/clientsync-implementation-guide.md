# ClientSync Travel Platform - Complete Implementation Guide

## Table of Contents
1. [Project Overview](#project-overview)
2. [Prerequisites & Environment Setup](#prerequisites--environment-setup)
3. [Architecture Overview](#architecture-overview)
4. [Task Dependency Matrix](#task-dependency-matrix)
5. [Phase 0: Project Setup & Foundation](#phase-0-project-setup--foundation)
6. [Phase 1: Mobile App - Authentication & Access Control](#phase-1-mobile-app---authentication--access-control)
7. [Phase 2: Mobile App - Client Onboarding Flow](#phase-2-mobile-app---client-onboarding-flow)
8. [Phase 3: Mobile App - Itinerary & Trip Management](#phase-3-mobile-app---itinerary--trip-management)
9. [Phase 4: Web Dashboard - Setup & Core Features](#phase-4-web-dashboard---setup--core-features)
10. [Phase 5: Integration, Testing & Deployment](#phase-5-integration-testing--deployment)
11. [Troubleshooting Guide](#troubleshooting-guide)
12. [Validation Checklist](#validation-checklist)

---

## Project Overview

**ClientSync** is a mobile-first travel platform designed for travel agencies managing high-value clients. The platform consists of:
- **Mobile App**: React Native with Expo for iOS/Android clients
- **Web Dashboard**: React with Vite for travel organizers
- **Backend**: Payload CMS (PostgreSQL, Auth, REST/GraphQL APIs)

### Business Context
Travel agencies currently use fragmented tools (CRMs, spreadsheets, emails) leading to inefficiencies and poor client experience. ClientSync provides a unified, secure, tier-based platform for managing client preferences and trip itineraries.

### Key Features
- **Email-based access control** with allowlist verification
- **Tier-based personalization** (Standard, Premium, Elite)
- **Multi-step onboarding** for client preferences
- **Real-time dashboard** for organizers
- **GDPR/CCPA compliant** data handling

---

## Prerequisites & Environment Setup

### Required Tools & Versions

```bash
# Check tool versions
node --version       # Required: v20.0.0 or higher
pnpm --version       # Required: v8.0.0 or higher
git --version        # Required: v2.30.0 or higher

# Platform-specific
# macOS
xcode-select --version  # Required: Xcode 15.0+ with iOS 17+ SDK
pod --version          # Required: CocoaPods 1.12.0+

# Android (all platforms)
java --version         # Required: JDK 17
```

### Installation Commands

```bash
# Install pnpm if not present
npm install -g pnpm@8

# Install Expo CLI globally
pnpm add -g expo-cli@latest

# Install EAS CLI for builds
pnpm add -g eas-cli@latest

# Verify installations
expo --version
eas --version
```

### Environment Variables

Create `.env.local` in the project root:

```bash
# Payload CMS Configuration
EXPO_PUBLIC_PAYLOAD_URL=http://localhost:3000
EXPO_PUBLIC_PAYLOAD_API_KEY=your_api_key
PAYLOAD_SECRET=your_payload_secret
DATABASE_URI=postgresql://user:password@localhost:5432/clientsync

# Web Dashboard
VITE_PAYLOAD_URL=http://localhost:3000
VITE_PAYLOAD_API_KEY=your_api_key

# Development
NODE_ENV=development
```

### Access Requirements

1. **PostgreSQL Database**: Local or cloud instance (e.g., Neon, Railway)
2. **Expo Account**: Register at https://expo.dev
3. **Apple Developer Account**: For iOS deployment (optional for development)
4. **Google Play Console**: For Android deployment (optional for development)
5. **Email Service**: SendGrid or Resend account for email verification

---

## Architecture Overview

### System Architecture Diagram

```mermaid
graph TB
    subgraph "Client Layer"
        MA[Mobile App<br/>React Native/Expo]
        WD[Web Dashboard<br/>React/Vite]
    end
    
    subgraph "Backend Layer"
        SB[Supabase]
        AUTH[Authentication]
        DB[(PostgreSQL)]
        FN[Edge Functions]
        RT[Realtime]
    end
    
    subgraph "Shared Layer"
        TYPES[TypeScript Types]
        UTILS[Utilities]
    end
    
    MA --> AUTH
    MA --> DB
    MA --> FN
    WD --> AUTH
    WD --> DB
    WD --> RT
    MA --> TYPES
    WD --> TYPES
    
    style MA fill:#4FC3F7
    style WD fill:#81C784
    style SB fill:#FFB74D
```

### Tier System Architecture

```typescript
// Tier definitions and their implications
enum ClientTier {
  STANDARD = 'standard',   // Basic options, economy flights, 3-star hotels
  PREMIUM = 'premium',     // Business class, 4-star hotels, curated experiences
  ELITE = 'elite'         // First class, 5-star hotels, exclusive access
}

// Tier affects:
// 1. Flight class options during onboarding
// 2. Hotel category selections
// 3. Activity recommendations
// 4. Dashboard priority alerts
```

### Data Flow Patterns

1. **Authentication Flow**:
   ```
   Client Email → Allowlist Check → JWT Token → Access Granted
   ```

2. **Onboarding Flow**:
   ```
   Personal Info → Flight Prefs → Hotel Prefs → Activities → Review → Save
   ```

3. **Real-time Updates**:
   ```
   Database Change → Supabase Realtime → WebSocket → Dashboard Update
   ```

---

## Task Dependency Matrix

### Visual Dependency Graph

```mermaid
graph TD
    %% Phase 0
    T01[Task 0.1: Monorepo Setup]
    T02[Task 0.2: Shared Package]
    T03[Task 0.3: Supabase Project]
    T04[Task 0.4: Database Schema]
    
    %% Phase 1
    T11[Task 1.1: Allowlist Function]
    T12[Task 1.2: Login Screen]
    T13[Task 1.3: ViewerContext]
    
    %% Phase 2
    T21[Task 2.1: Progress Indicator]
    T22[Task 2.2: Onboarding Layout]
    T23[Task 2.3-2.7: Onboarding Steps]
    
    %% Phase 3
    T31[Task 3.1: Itinerary List]
    T32[Task 3.2: Detail View]
    T33[Task 3.3: Profile Screen]
    
    %% Phase 4
    T41[Task 4.1: Dashboard Setup]
    T42[Task 4.2: Dashboard Auth]
    T43[Task 4.3-4.6: Dashboard Features]
    
    %% Dependencies
    T01 --> T02
    T01 --> T03
    T03 --> T04
    T04 --> T11
    T11 --> T12
    T12 --> T13
    T13 --> T21
    T21 --> T22
    T22 --> T23
    T23 --> T31
    T31 --> T32
    T31 --> T33
    T01 --> T41
    T41 --> T42
    T42 --> T43
    
    style T01 fill:#FF6B6B
    style T03 fill:#FF6B6B
    style T04 fill:#FF6B6B
```

### Parallel Execution Opportunities

- **Phase 0**: Tasks 0.3 and 0.2 can run in parallel after 0.1
- **Phase 2**: Tasks 2.3-2.7 can be developed in parallel after 2.2
- **Phase 3**: Tasks 3.1, 3.2, and 3.3 can be developed in parallel
- **Phase 4**: Can start immediately after Task 0.1 (monorepo setup)

---

## Phase 0: Project Setup & Foundation

### Task 0.1: Set Up Monorepo Structure with PNPM Workspaces

**Objective**: Transform the current single React Native app into a monorepo structure supporting multiple packages.

**Prerequisites**: 
- Current working directory is project root
- Git repository initialized
- All changes committed

**Implementation Steps**:

1. **Create workspace configuration**:
   ```bash
   # Create pnpm-workspace.yaml in project root
   cat > pnpm-workspace.yaml << 'EOF'
   packages:
     - 'packages/*'
   EOF
   ```

2. **Create directory structure**:
   ```bash
   # Create packages directory
   mkdir -p packages/mobile-app packages/web-dashboard packages/shared
   
   # Move existing React Native app
   # First, create a list of items to move
   ls -A | grep -v -E '^(packages|\.git|\.ai|\.claude|pnpm-workspace\.yaml)$' > items_to_move.txt
   
   # Move each item
   while read item; do
     mv "$item" packages/mobile-app/
   done < items_to_move.txt
   
   # Clean up
   rm items_to_move.txt
   ```

3. **Create root package.json**:
   ```json
   {
     "name": "clientsync-travel-platform",
     "version": "1.0.0",
     "private": true,
     "type": "module",
     "scripts": {
       "dev:mobile": "pnpm --filter mobile-app dev",
       "dev:web": "pnpm --filter web-dashboard dev",
       "dev:all": "pnpm --parallel --filter './packages/*' dev",
       "build:all": "pnpm --filter './packages/*' build",
       "test:all": "pnpm --filter './packages/*' test",
       "lint:all": "pnpm --filter './packages/*' lint",
       "clean": "pnpm --filter './packages/*' clean && rm -rf node_modules"
     },
     "devDependencies": {
       "@types/node": "^20.0.0",
       "typescript": "^5.3.0"
     },
     "engines": {
       "node": ">=20.0.0",
       "pnpm": ">=8.0.0"
     }
   }
   ```

4. **Update mobile app package.json**:
   ```bash
   # Update the name in packages/mobile-app/package.json
   cd packages/mobile-app
   # Use jq or manually edit to change name to "@clientsync/mobile-app"
   ```

5. **Install dependencies**:
   ```bash
   # Return to root
   cd ../..
   
   # Install all dependencies
   pnpm install
   ```

**Verification**:
```bash
# Should show workspace structure
pnpm ls -r --depth 0

# Should run mobile app
pnpm dev:mobile
```

**Common Issues & Solutions**:
- **Error**: "Cannot find module" → Run `pnpm install` from root
- **Error**: "Workspace not found" → Ensure `pnpm-workspace.yaml` is in root
- **Error**: "Port already in use" → Kill existing processes or change port

---

### Task 0.2: Configure Shared Package

**Objective**: Set up the shared package for common TypeScript types and utilities used across mobile and web apps.

**Prerequisites**: Task 0.1 completed

**Implementation Steps**:

1. **Create shared package.json**:
   ```bash
   cd packages/shared
   cat > package.json << 'EOF'
   {
     "name": "@clientsync/shared",
     "version": "1.0.0",
     "type": "module",
     "main": "./dist/index.js",
     "types": "./dist/index.d.ts",
     "exports": {
       ".": {
         "types": "./dist/index.d.ts",
         "import": "./dist/index.js",
         "require": "./dist/index.cjs"
       }
     },
     "scripts": {
       "build": "tsup",
       "dev": "tsup --watch",
       "clean": "rm -rf dist"
     },
     "devDependencies": {
       "@types/node": "^20.0.0",
       "tsup": "^8.0.0",
       "typescript": "^5.3.0"
     }
   }
   EOF
   ```

2. **Create TypeScript configuration**:
   ```bash
   cat > tsconfig.json << 'EOF'
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
   EOF
   ```

3. **Create tsup configuration**:
   ```bash
   cat > tsup.config.ts << 'EOF'
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
   EOF
   ```

4. **Create source files**:
   ```bash
   mkdir -p src
   
   # Create index.ts
   cat > src/index.ts << 'EOF'
   export * from './types.js'
   export * from './constants.js'
   export * from './utils.js'
   EOF
   
   # Create types.ts
   cat > src/types.ts << 'EOF'
   // Client tier definitions
   export enum ClientTier {
     STANDARD = 'standard',
     PREMIUM = 'premium',
     ELITE = 'elite'
   }

   // User types
   export interface Client {
     id: string
     email: string
     tier: ClientTier
     profile: ClientProfile
     preferences: ClientPreferences
     created_at: string
     updated_at: string
   }

   export interface ClientProfile {
     first_name: string
     last_name: string
     phone: string
     emergency_contact: {
       name: string
       phone: string
       relationship: string
     }
   }

   export interface ClientPreferences {
     flight: FlightPreferences
     hotel: HotelPreferences
     activities: ActivityPreferences
     dining: DiningPreferences
   }

   export interface FlightPreferences {
     class: 'economy' | 'business' | 'first'
     airlines: string[]
     seat_preference: 'aisle' | 'window' | 'middle'
     meal_preference?: string
   }

   export interface HotelPreferences {
     category: '3-star' | '4-star' | '5-star' | 'boutique'
     room_type: 'standard' | 'suite' | 'villa'
     bed_preference: 'single' | 'double' | 'king'
     special_requests?: string
   }

   export interface ActivityPreferences {
     types: ActivityType[]
     intensity: 'relaxed' | 'moderate' | 'active'
     interests: string[]
   }

   export interface DiningPreferences {
     cuisines: string[]
     dietary_restrictions: string[]
     meal_times: {
       breakfast?: string
       lunch?: string
       dinner?: string
     }
   }

   export type ActivityType = 
     | 'cultural'
     | 'adventure'
     | 'relaxation'
     | 'culinary'
     | 'shopping'
     | 'entertainment'

   // Trip types
   export interface Trip {
     id: string
     client_id: string
     name: string
     destination: string
     start_date: string
     end_date: string
     status: TripStatus
     itinerary: Itinerary
   }

   export type TripStatus = 'planning' | 'confirmed' | 'in-progress' | 'completed'

   export interface Itinerary {
     flights: Flight[]
     hotels: Hotel[]
     activities: Activity[]
   }

   export interface Flight {
     id: string
     airline: string
     flight_number: string
     departure: DateTime
     arrival: DateTime
     class: string
     seat?: string
   }

   export interface Hotel {
     id: string
     name: string
     check_in: string
     check_out: string
     room_type: string
     confirmation_number?: string
   }

   export interface Activity {
     id: string
     name: string
     type: ActivityType
     date: string
     time: string
     duration: string
     location: string
   }

   export interface DateTime {
     date: string
     time: string
     timezone: string
     airport?: string
   }

   // Organizer types
   export interface Organizer {
     id: string
     email: string
     name: string
     role: 'admin' | 'organizer'
     permissions: string[]
   }

   // Allowlist types
   export interface AllowlistEntry {
     id: string
     email: string
     tier: ClientTier
     added_by: string
     added_at: string
   }

   // Audit types
   export interface AuditLog {
     id: string
     user_id: string
     action: string
     resource_type: string
     resource_id: string
     details: Record<string, any>
     timestamp: string
   }
   EOF
   ```

5. **Create constants.ts**:
   ```bash
   cat > src/constants.ts << 'EOF'
   import { ClientTier } from './types.js'

   // Tier-based options
   export const FLIGHT_CLASSES_BY_TIER = {
     [ClientTier.STANDARD]: ['economy'],
     [ClientTier.PREMIUM]: ['economy', 'business'],
     [ClientTier.ELITE]: ['business', 'first']
   } as const

   export const HOTEL_CATEGORIES_BY_TIER = {
     [ClientTier.STANDARD]: ['3-star'],
     [ClientTier.PREMIUM]: ['4-star', 'boutique'],
     [ClientTier.ELITE]: ['5-star', 'boutique']
   } as const

   // API Routes
   export const API_ROUTES = {
     AUTH: {
       LOGIN: '/auth/login',
       LOGOUT: '/auth/logout',
       VERIFY_EMAIL: '/auth/verify-email'
     },
     CLIENTS: {
       LIST: '/clients',
       DETAIL: '/clients/:id',
       PREFERENCES: '/clients/:id/preferences'
     },
     TRIPS: {
       LIST: '/trips',
       DETAIL: '/trips/:id'
     },
     ALLOWLIST: {
       LIST: '/allowlist',
       ADD: '/allowlist/add',
       REMOVE: '/allowlist/:id'
     }
   } as const

   // Validation
   export const VALIDATION = {
     EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
     PHONE_REGEX: /^\+?[1-9]\d{1,14}$/,
     MIN_PASSWORD_LENGTH: 8
   } as const
   EOF
   ```

6. **Create utils.ts**:
   ```bash
   cat > src/utils.ts << 'EOF'
   import { ClientTier } from './types.js'
   import { FLIGHT_CLASSES_BY_TIER, HOTEL_CATEGORIES_BY_TIER } from './constants.js'

   // Tier-based filtering utilities
   export function getAvailableFlightClasses(tier: ClientTier): string[] {
     return FLIGHT_CLASSES_BY_TIER[tier] || []
   }

   export function getAvailableHotelCategories(tier: ClientTier): string[] {
     return HOTEL_CATEGORIES_BY_TIER[tier] || []
   }

   // Date utilities
   export function formatDate(date: string | Date): string {
     const d = new Date(date)
     return d.toLocaleDateString('en-US', { 
       year: 'numeric', 
       month: 'long', 
       day: 'numeric' 
     })
   }

   export function formatDateTime(date: string | Date): string {
     const d = new Date(date)
     return d.toLocaleString('en-US', { 
       year: 'numeric', 
       month: 'short', 
       day: 'numeric',
       hour: '2-digit',
       minute: '2-digit'
     })
   }

   // Validation utilities
   export function isValidEmail(email: string): boolean {
     return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
   }

   export function isValidPhone(phone: string): boolean {
     return /^\+?[1-9]\d{1,14}$/.test(phone)
   }

   // Error handling
   export class ApiError extends Error {
     constructor(
       message: string,
       public statusCode: number,
       public code?: string
     ) {
       super(message)
       this.name = 'ApiError'
     }
   }

   export function handleApiError(error: unknown): ApiError {
     if (error instanceof ApiError) {
       return error
     }
     
     if (error instanceof Error) {
       return new ApiError(error.message, 500)
     }
     
     return new ApiError('An unexpected error occurred', 500)
   }
   EOF
   ```

7. **Build the package**:
   ```bash
   # Install dependencies
   pnpm install
   
   # Build
   pnpm build
   
   # Return to root
   cd ../..
   ```

**Verification**:
```bash
# From root directory
cd packages/shared

# Should build successfully
pnpm build

# Should see dist folder with compiled files
ls -la dist/

# Should contain:
# - index.js
# - index.cjs
# - index.d.ts
# - types.d.ts
# - constants.d.ts
# - utils.d.ts
```

**Integration with other packages**:

In `packages/mobile-app/package.json`, add:
```json
{
  "dependencies": {
    "@clientsync/shared": "workspace:*"
  }
}
```

In `packages/web-dashboard/package.json`, add:
```json
{
  "dependencies": {
    "@clientsync/shared": "workspace:*"
  }
}
```

Then run `pnpm install` from root to link packages.

---

### Task 0.3: Create Supabase Project

**Objective**: Set up a Supabase project with authentication and initial configuration.

**Prerequisites**: 
- Supabase account created
- Tasks 0.1 and 0.2 completed

**Implementation Steps**:

1. **Create Supabase Project**:
   - Go to https://supabase.com/dashboard
   - Click "New Project"
   - Fill in:
     - Project name: `clientsync-prod` (or `clientsync-dev` for development)
     - Database password: Generate a strong password and save it securely
     - Region: Choose closest to your users
     - Pricing plan: Free tier for development
   - Click "Create project" and wait for provisioning

2. **Note credentials**:
   ```bash
   # Create a secure credentials file (add to .gitignore)
   cat > .env.supabase << 'EOF'
   # Project URL (from Settings > API)
   SUPABASE_URL=https://[project-ref].supabase.co

   # Anon/Public key (from Settings > API)
   SUPABASE_ANON_KEY=[your-anon-key]

   # Service Role key (from Settings > API) - KEEP SECRET!
   SUPABASE_SERVICE_ROLE_KEY=[your-service-role-key]

   # Database URL (from Settings > Database)
   DATABASE_URL=postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres
   EOF
   ```

3. **Configure Authentication**:
   ```sql
   -- In Supabase SQL Editor, run:
   
   -- Enable email provider (it's enabled by default)
   -- Go to Authentication > Providers > Email and ensure it's enabled
   
   -- Create custom claims function for role management
   CREATE OR REPLACE FUNCTION public.handle_new_user()
   RETURNS TRIGGER AS $$
   BEGIN
     INSERT INTO public.user_profiles (id, email, role)
     VALUES (NEW.id, NEW.email, 'client');
     RETURN NEW;
   END;
   $$ LANGUAGE plpgsql SECURITY DEFINER;
   
   -- Trigger to create profile on signup
   CREATE TRIGGER on_auth_user_created
     AFTER INSERT ON auth.users
     FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
   ```

4. **Configure Google OAuth** (for future enhancement):
   - Go to Authentication > Providers > Google
   - Toggle "Enable Google provider"
   - Add your Google OAuth credentials (obtain from Google Cloud Console)
   - Set redirect URL: `https://[project-ref].supabase.co/auth/v1/callback`

5. **Configure Auth Settings**:
   - Go to Authentication > Settings
   - Set:
     - Site URL: `http://localhost:8081` (for development)
     - Redirect URLs: 
       ```
       http://localhost:8081/*
       exp://localhost:8081/*
       clientsync://auth/callback
       ```
     - JWT expiry: 3600 (1 hour)
     - Enable "Disable email confirmations" for development

6. **Create Edge Function for email verification**:
   ```bash
   # Install Supabase CLI
   brew install supabase/tap/supabase  # macOS
   # Or download from https://github.com/supabase/cli/releases
   
   # Login to Supabase
   supabase login
   
   # Initialize Supabase in project
   cd packages/backend  # or create if doesn't exist
   supabase init
   
   # Link to your project
   supabase link --project-ref [project-ref]
   ```

**Verification**:
```bash
# Test connection from project root
curl -X GET "${SUPABASE_URL}/rest/v1/" \
  -H "apikey: ${SUPABASE_ANON_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_ANON_KEY}"

# Should return: {"swagger":"2.0",...}
```

**Security Checklist**:
- [ ] Service role key is NOT in any client code
- [ ] `.env.supabase` is in `.gitignore`
- [ ] Row Level Security will be enabled in Task 0.4
- [ ] Auth redirect URLs are properly configured

---

### Task 0.4: Design Database Schema

**Objective**: Create the complete database schema with tables, relationships, and Row Level Security policies.

**Prerequisites**: Task 0.3 completed

**Database Design Diagram**:
```mermaid
erDiagram
    CLIENTS ||--o{ TRIPS : has
    CLIENTS ||--|| CLIENT_PREFERENCES : has
    CLIENTS ||--|| CLIENT_PROFILES : has
    TRIPS ||--o{ TRIP_FLIGHTS : contains
    TRIPS ||--o{ TRIP_HOTELS : contains
    TRIPS ||--o{ TRIP_ACTIVITIES : contains
    ALLOWLIST ||--o{ CLIENTS : validates
    ORGANIZERS ||--o{ AUDIT_LOGS : creates
    
    CLIENTS {
        uuid id PK
        string email UK
        enum tier
        uuid profile_id FK
        uuid preferences_id FK
        timestamp created_at
        timestamp updated_at
    }
    
    CLIENT_PROFILES {
        uuid id PK
        string first_name
        string last_name
        string phone
        jsonb emergency_contact
        timestamp updated_at
    }
    
    CLIENT_PREFERENCES {
        uuid id PK
        jsonb flight_preferences
        jsonb hotel_preferences
        jsonb activity_preferences
        jsonb dining_preferences
        timestamp updated_at
    }
    
    TRIPS {
        uuid id PK
        uuid client_id FK
        string name
        string destination
        date start_date
        date end_date
        enum status
        timestamp created_at
    }
    
    ALLOWLIST {
        uuid id PK
        string email UK
        enum tier
        uuid added_by FK
        timestamp added_at
    }
```

**Implementation SQL**:

1. **Create all tables**:
   ```sql
   -- Run this in Supabase SQL Editor
   
   -- Enable UUID extension
   CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
   
   -- Create enum types
   CREATE TYPE client_tier AS ENUM ('standard', 'premium', 'elite');
   CREATE TYPE trip_status AS ENUM ('planning', 'confirmed', 'in-progress', 'completed');
   CREATE TYPE user_role AS ENUM ('client', 'organizer', 'admin');
   
   -- User profiles table (extends auth.users)
   CREATE TABLE public.user_profiles (
     id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
     email TEXT UNIQUE NOT NULL,
     role user_role NOT NULL DEFAULT 'client',
     created_at TIMESTAMPTZ DEFAULT NOW(),
     updated_at TIMESTAMPTZ DEFAULT NOW()
   );
   
   -- Client profiles table
   CREATE TABLE public.client_profiles (
     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
     first_name TEXT NOT NULL,
     last_name TEXT NOT NULL,
     phone TEXT NOT NULL,
     emergency_contact JSONB NOT NULL DEFAULT '{}'::jsonb,
     updated_at TIMESTAMPTZ DEFAULT NOW()
   );
   
   -- Client preferences table
   CREATE TABLE public.client_preferences (
     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
     flight_preferences JSONB NOT NULL DEFAULT '{}'::jsonb,
     hotel_preferences JSONB NOT NULL DEFAULT '{}'::jsonb,
     activity_preferences JSONB NOT NULL DEFAULT '{}'::jsonb,
     dining_preferences JSONB NOT NULL DEFAULT '{}'::jsonb,
     updated_at TIMESTAMPTZ DEFAULT NOW()
   );
   
   -- Main clients table
   CREATE TABLE public.clients (
     id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
     email TEXT UNIQUE NOT NULL,
     tier client_tier NOT NULL DEFAULT 'standard',
     profile_id UUID REFERENCES public.client_profiles(id),
     preferences_id UUID REFERENCES public.client_preferences(id),
     onboarding_completed BOOLEAN DEFAULT FALSE,
     created_at TIMESTAMPTZ DEFAULT NOW(),
     updated_at TIMESTAMPTZ DEFAULT NOW()
   );
   
   -- Trips table
   CREATE TABLE public.trips (
     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
     client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
     name TEXT NOT NULL,
     destination TEXT NOT NULL,
     start_date DATE NOT NULL,
     end_date DATE NOT NULL,
     status trip_status NOT NULL DEFAULT 'planning',
     created_at TIMESTAMPTZ DEFAULT NOW(),
     updated_at TIMESTAMPTZ DEFAULT NOW()
   );
   
   -- Trip components
   CREATE TABLE public.trip_flights (
     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
     trip_id UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
     airline TEXT NOT NULL,
     flight_number TEXT NOT NULL,
     departure_date DATE NOT NULL,
     departure_time TIME NOT NULL,
     departure_airport TEXT NOT NULL,
     arrival_date DATE NOT NULL,
     arrival_time TIME NOT NULL,
     arrival_airport TEXT NOT NULL,
     class TEXT NOT NULL,
     seat TEXT,
     confirmation_number TEXT,
     created_at TIMESTAMPTZ DEFAULT NOW()
   );
   
   CREATE TABLE public.trip_hotels (
     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
     trip_id UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
     name TEXT NOT NULL,
     check_in_date DATE NOT NULL,
     check_out_date DATE NOT NULL,
     room_type TEXT NOT NULL,
     confirmation_number TEXT,
     address TEXT,
     created_at TIMESTAMPTZ DEFAULT NOW()
   );
   
   CREATE TABLE public.trip_activities (
     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
     trip_id UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
     name TEXT NOT NULL,
     type TEXT NOT NULL,
     date DATE NOT NULL,
     time TIME NOT NULL,
     duration INTERVAL NOT NULL,
     location TEXT NOT NULL,
     notes TEXT,
     created_at TIMESTAMPTZ DEFAULT NOW()
   );
   
   -- Allowlist table
   CREATE TABLE public.allowlist (
     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
     email TEXT UNIQUE NOT NULL,
     tier client_tier NOT NULL DEFAULT 'standard',
     added_by UUID REFERENCES auth.users(id),
     added_at TIMESTAMPTZ DEFAULT NOW()
   );
   
   -- Audit logs table
   CREATE TABLE public.audit_logs (
     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
     user_id UUID REFERENCES auth.users(id),
     action TEXT NOT NULL,
     resource_type TEXT NOT NULL,
     resource_id UUID,
     details JSONB DEFAULT '{}'::jsonb,
     ip_address INET,
     user_agent TEXT,
     timestamp TIMESTAMPTZ DEFAULT NOW()
   );
   
   -- Create indexes for performance
   CREATE INDEX idx_clients_email ON public.clients(email);
   CREATE INDEX idx_clients_tier ON public.clients(tier);
   CREATE INDEX idx_trips_client_id ON public.trips(client_id);
   CREATE INDEX idx_trips_status ON public.trips(status);
   CREATE INDEX idx_trips_dates ON public.trips(start_date, end_date);
   CREATE INDEX idx_allowlist_email ON public.allowlist(email);
   CREATE INDEX idx_audit_logs_user_id ON public.audit_logs(user_id);
   CREATE INDEX idx_audit_logs_timestamp ON public.audit_logs(timestamp);
   ```

2. **Create updated_at triggers**:
   ```sql
   -- Function to update updated_at timestamp
   CREATE OR REPLACE FUNCTION public.update_updated_at()
   RETURNS TRIGGER AS $$
   BEGIN
     NEW.updated_at = NOW();
     RETURN NEW;
   END;
   $$ LANGUAGE plpgsql;
   
   -- Apply triggers to tables with updated_at
   CREATE TRIGGER update_clients_updated_at
     BEFORE UPDATE ON public.clients
     FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
   
   CREATE TRIGGER update_client_profiles_updated_at
     BEFORE UPDATE ON public.client_profiles
     FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
   
   CREATE TRIGGER update_client_preferences_updated_at
     BEFORE UPDATE ON public.client_preferences
     FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
   
   CREATE TRIGGER update_trips_updated_at
     BEFORE UPDATE ON public.trips
     FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
   ```

3. **Set up Row Level Security (RLS)**:
   ```sql
   -- Enable RLS on all tables
   ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
   ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
   ALTER TABLE public.client_profiles ENABLE ROW LEVEL SECURITY;
   ALTER TABLE public.client_preferences ENABLE ROW LEVEL SECURITY;
   ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;
   ALTER TABLE public.trip_flights ENABLE ROW LEVEL SECURITY;
   ALTER TABLE public.trip_hotels ENABLE ROW LEVEL SECURITY;
   ALTER TABLE public.trip_activities ENABLE ROW LEVEL SECURITY;
   ALTER TABLE public.allowlist ENABLE ROW LEVEL SECURITY;
   ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
   
   -- User profiles policies
   CREATE POLICY "Users can view own profile" ON public.user_profiles
     FOR SELECT USING (auth.uid() = id);
   
   CREATE POLICY "Users can update own profile" ON public.user_profiles
     FOR UPDATE USING (auth.uid() = id);
   
   -- Clients policies
   CREATE POLICY "Clients can view own data" ON public.clients
     FOR SELECT USING (auth.uid() = id);
   
   CREATE POLICY "Clients can update own data" ON public.clients
     FOR UPDATE USING (auth.uid() = id);
   
   CREATE POLICY "Organizers can view all clients" ON public.clients
     FOR SELECT USING (
       EXISTS (
         SELECT 1 FROM public.user_profiles
         WHERE id = auth.uid() AND role IN ('organizer', 'admin')
       )
     );
   
   -- Client profiles policies
   CREATE POLICY "Clients can view own profile" ON public.client_profiles
     FOR SELECT USING (
       EXISTS (
         SELECT 1 FROM public.clients
         WHERE clients.profile_id = client_profiles.id
         AND clients.id = auth.uid()
       )
     );
   
   CREATE POLICY "Clients can update own profile" ON public.client_profiles
     FOR UPDATE USING (
       EXISTS (
         SELECT 1 FROM public.clients
         WHERE clients.profile_id = client_profiles.id
         AND clients.id = auth.uid()
       )
     );
   
   -- Similar policies for preferences
   CREATE POLICY "Clients can view own preferences" ON public.client_preferences
     FOR SELECT USING (
       EXISTS (
         SELECT 1 FROM public.clients
         WHERE clients.preferences_id = client_preferences.id
         AND clients.id = auth.uid()
       )
     );
   
   CREATE POLICY "Clients can update own preferences" ON public.client_preferences
     FOR UPDATE USING (
       EXISTS (
         SELECT 1 FROM public.clients
         WHERE clients.preferences_id = client_preferences.id
         AND clients.id = auth.uid()
       )
     );
   
   -- Trips policies
   CREATE POLICY "Clients can view own trips" ON public.trips
     FOR SELECT USING (client_id = auth.uid());
   
   CREATE POLICY "Organizers can view all trips" ON public.trips
     FOR SELECT USING (
       EXISTS (
         SELECT 1 FROM public.user_profiles
         WHERE id = auth.uid() AND role IN ('organizer', 'admin')
       )
     );
   
   CREATE POLICY "Organizers can create trips" ON public.trips
     FOR INSERT WITH CHECK (
       EXISTS (
         SELECT 1 FROM public.user_profiles
         WHERE id = auth.uid() AND role IN ('organizer', 'admin')
       )
     );
   
   -- Allowlist policies (organizers only)
   CREATE POLICY "Organizers can view allowlist" ON public.allowlist
     FOR SELECT USING (
       EXISTS (
         SELECT 1 FROM public.user_profiles
         WHERE id = auth.uid() AND role IN ('organizer', 'admin')
       )
     );
   
   CREATE POLICY "Organizers can manage allowlist" ON public.allowlist
     FOR ALL USING (
       EXISTS (
         SELECT 1 FROM public.user_profiles
         WHERE id = auth.uid() AND role IN ('organizer', 'admin')
       )
     );
   
   -- Audit logs policies (admins only)
   CREATE POLICY "Admins can view audit logs" ON public.audit_logs
     FOR SELECT USING (
       EXISTS (
         SELECT 1 FROM public.user_profiles
         WHERE id = auth.uid() AND role = 'admin'
       )
     );
   ```

4. **Create helper functions**:
   ```sql
   -- Function to check if email is in allowlist
   CREATE OR REPLACE FUNCTION public.check_email_allowlist(email_to_check TEXT)
   RETURNS TABLE (
     allowed BOOLEAN,
     tier client_tier
   ) AS $$
   BEGIN
     RETURN QUERY
     SELECT 
       CASE WHEN COUNT(*) > 0 THEN TRUE ELSE FALSE END as allowed,
       MAX(a.tier) as tier
     FROM public.allowlist a
     WHERE a.email = email_to_check;
   END;
   $$ LANGUAGE plpgsql SECURITY DEFINER;
   
   -- Function to create audit log
   CREATE OR REPLACE FUNCTION public.create_audit_log(
     p_action TEXT,
     p_resource_type TEXT,
     p_resource_id UUID DEFAULT NULL,
     p_details JSONB DEFAULT '{}'::jsonb
   ) RETURNS UUID AS $$
   DECLARE
     v_audit_id UUID;
   BEGIN
     INSERT INTO public.audit_logs (
       user_id, action, resource_type, resource_id, details
     ) VALUES (
       auth.uid(), p_action, p_resource_type, p_resource_id, p_details
     ) RETURNING id INTO v_audit_id;
     
     RETURN v_audit_id;
   END;
   $$ LANGUAGE plpgsql SECURITY DEFINER;
   ```

5. **Insert initial data**:
   ```sql
   -- Add some test allowlist entries (replace with real emails)
   INSERT INTO public.allowlist (email, tier) VALUES
     ('test.standard@example.com', 'standard'),
     ('test.premium@example.com', 'premium'),
     ('test.elite@example.com', 'elite');
   
   -- Create a test organizer (run after creating account)
   -- UPDATE public.user_profiles 
   -- SET role = 'organizer' 
   -- WHERE email = 'organizer@example.com';
   ```

**Verification**:
```sql
-- Check tables were created
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Check RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';

-- Test allowlist function
SELECT * FROM public.check_email_allowlist('test.standard@example.com');
```

**Rollback Script** (if needed):
```sql
-- Drop all tables and types
DROP TABLE IF EXISTS public.audit_logs CASCADE;
DROP TABLE IF EXISTS public.allowlist CASCADE;
DROP TABLE IF EXISTS public.trip_activities CASCADE;
DROP TABLE IF EXISTS public.trip_hotels CASCADE;
DROP TABLE IF EXISTS public.trip_flights CASCADE;
DROP TABLE IF EXISTS public.trips CASCADE;
DROP TABLE IF EXISTS public.clients CASCADE;
DROP TABLE IF EXISTS public.client_preferences CASCADE;
DROP TABLE IF EXISTS public.client_profiles CASCADE;
DROP TABLE IF EXISTS public.user_profiles CASCADE;
DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS trip_status CASCADE;
DROP TYPE IF EXISTS client_tier CASCADE;
```

---

## Phase 1: Mobile App - Authentication & Access Control

### Task 1.1: Implement Allowlist Check Function

**Objective**: Create a Supabase Edge Function to verify emails against the allowlist table.

**Prerequisites**: Tasks 0.3 and 0.4 completed

**Implementation Steps**:

1. **Create Edge Function structure**:
   ```bash
   # Navigate to backend directory
   cd backend  # or create: mkdir -p backend && cd backend
   
   # Initialize Supabase functions
   supabase functions new check-allowlist
   ```

2. **Implement the function**:
   ```typescript
   // backend/functions/check-allowlist/index.ts
   import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
   import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.0'
   
   const corsHeaders = {
     'Access-Control-Allow-Origin': '*',
     'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
   }
   
   serve(async (req) => {
     // Handle CORS preflight
     if (req.method === 'OPTIONS') {
       return new Response('ok', { headers: corsHeaders })
     }
   
     try {
       // Get request body
       const { email } = await req.json()
       
       if (!email) {
         return new Response(
           JSON.stringify({ error: 'Email is required' }),
           { 
             status: 400, 
             headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
           }
         )
       }
   
       // Initialize Supabase client
       const supabaseUrl = Deno.env.get('SUPABASE_URL')!
       const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
       const supabase = createClient(supabaseUrl, supabaseServiceKey)
   
       // Check allowlist
       const { data, error } = await supabase
         .rpc('check_email_allowlist', { email_to_check: email })
         .single()
   
       if (error) {
         console.error('Database error:', error)
         return new Response(
           JSON.stringify({ error: 'Failed to check allowlist' }),
           { 
             status: 500, 
             headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
           }
         )
       }
   
       // Return result
       return new Response(
         JSON.stringify({
           allowed: data?.allowed || false,
           tier: data?.tier || null
         }),
         { 
           status: 200, 
           headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
         }
       )
     } catch (error) {
       console.error('Function error:', error)
       return new Response(
         JSON.stringify({ error: 'Internal server error' }),
         { 
           status: 500, 
           headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
         }
       )
     }
   })
   ```

3. **Deploy the function**:
   ```bash
   # Deploy to Supabase
   supabase functions deploy check-allowlist
   
   # Set environment variables if needed
   supabase secrets set CUSTOM_ENV_VAR=value
   ```

4. **Create client-side hook** (in mobile app):
   ```typescript
   // packages/mobile-app/src/hooks/useAllowlist.ts
   import { useState } from 'react'
   import { supabase } from '../lib/supabase'
   
   interface AllowlistCheckResult {
     allowed: boolean
     tier: 'standard' | 'premium' | 'elite' | null
   }
   
   export function useAllowlist() {
     const [loading, setLoading] = useState(false)
     const [error, setError] = useState<string | null>(null)
   
     const checkEmail = async (email: string): Promise<AllowlistCheckResult | null> => {
       setLoading(true)
       setError(null)
   
       try {
         const { data, error: fnError } = await supabase.functions.invoke('check-allowlist', {
           body: { email }
         })
   
         if (fnError) throw fnError
   
         return data as AllowlistCheckResult
       } catch (err) {
         const message = err instanceof Error ? err.message : 'Failed to check email'
         setError(message)
         return null
       } finally {
         setLoading(false)
       }
     }
   
     return { checkEmail, loading, error }
   }
   ```

**Testing the function**:
```bash
# Test locally
supabase functions serve check-allowlist

# In another terminal, test with curl
curl -i --location --request POST 'http://localhost:54321/functions/v1/check-allowlist' \
  --header 'Authorization: Bearer YOUR_ANON_KEY' \
  --header 'Content-Type: application/json' \
  --data '{"email":"test.standard@example.com"}'

# Expected response:
# {"allowed":true,"tier":"standard"}
```

**Verification Checklist**:
- [ ] Function deploys without errors
- [ ] Returns correct response for allowed emails
- [ ] Returns allowed: false for non-allowlisted emails
- [ ] Handles missing email parameter
- [ ] CORS headers are properly set

---

### Task 1.2: Update Login Screen with Email Verification

**Objective**: Modify the existing login screen to check the allowlist before allowing access.

**Prerequisites**: Task 1.1 completed

**Implementation Steps**:

1. **First, set up Supabase client**:
   ```typescript
   // packages/mobile-app/src/lib/supabase.ts
   import { createClient } from '@supabase/supabase-js'
   import AsyncStorage from '@react-native-async-storage/async-storage'
   import 'react-native-url-polyfill/auto'
   
   const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!
   const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!
   
   export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
     auth: {
       storage: AsyncStorage,
       autoRefreshToken: true,
       persistSession: true,
       detectSessionInUrl: false,
     },
   })
   ```

2. **Update login screen**:
   ```typescript
   // packages/mobile-app/src/app/login.tsx
   import { useState } from 'react'
   import { 
     View, 
     TextInput, 
     TouchableOpacity, 
     KeyboardAvoidingView,
     Platform,
     ActivityIndicator,
     Alert
   } from 'react-native'
   import { router } from 'expo-router'
   import { useAllowlist } from '../hooks/useAllowlist'
   import { supabase } from '../lib/supabase'
   import { Text } from '../ui/Text'
   import { isValidEmail } from '@clientsync/shared'
   
   export default function LoginScreen() {
     const [email, setEmail] = useState('')
     const [password, setPassword] = useState('')
     const [loading, setLoading] = useState(false)
     const { checkEmail } = useAllowlist()
   
     const handleEmailVerification = async () => {
       // Validate email format
       if (!isValidEmail(email)) {
         Alert.alert('Invalid Email', 'Please enter a valid email address.')
         return
       }
   
       setLoading(true)
   
       try {
         // Check allowlist
         const allowlistResult = await checkEmail(email)
         
         if (!allowlistResult?.allowed) {
           Alert.alert(
             'Access Denied',
             'This email is not authorized to access ClientSync. Please contact your travel organizer.',
             [{ text: 'OK' }]
           )
           setLoading(false)
           return
         }
   
         // Store tier for later use
         await AsyncStorage.setItem('userTier', allowlistResult.tier || 'standard')
   
         // Check if user exists
         const { data: { user } } = await supabase.auth.getUser()
         
         if (user) {
           // Existing user - show password field
           // In a real app, you'd show a password input here
           await handleLogin()
         } else {
           // New user - navigate to onboarding
           router.push({
             pathname: '/(app)/onboarding/personal-details',
             params: { email, tier: allowlistResult.tier }
           })
         }
       } catch (error) {
         console.error('Verification error:', error)
         Alert.alert('Error', 'Failed to verify email. Please try again.')
       } finally {
         setLoading(false)
       }
     }
   
     const handleLogin = async () => {
       setLoading(true)
   
       try {
         const { data, error } = await supabase.auth.signInWithPassword({
           email,
           password
         })
   
         if (error) throw error
   
         // Check if onboarding is complete
         const { data: clientData } = await supabase
           .from('clients')
           .select('onboarding_completed')
           .eq('id', data.user.id)
           .single()
   
         if (clientData?.onboarding_completed) {
           router.replace('/(app)/(tabs)')
         } else {
           router.replace('/(app)/onboarding/personal-details')
         }
       } catch (error) {
         console.error('Login error:', error)
         Alert.alert('Login Failed', 'Invalid email or password.')
       } finally {
         setLoading(false)
       }
     }
   
     return (
       <KeyboardAvoidingView 
         behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
         className="flex-1 bg-white"
       >
         <View className="flex-1 justify-center px-6">
           {/* Logo/Header */}
           <View className="items-center mb-8">
             <Text className="text-4xl font-bold text-gray-900">ClientSync</Text>
             <Text className="text-lg text-gray-600 mt-2">
               Your Premium Travel Companion
             </Text>
           </View>
   
           {/* Email Input */}
           <View className="mb-4">
             <Text className="text-gray-700 mb-2 font-medium">Email Address</Text>
             <TextInput
               className="border border-gray-300 rounded-lg px-4 py-3 text-base"
               placeholder="Enter your email"
               value={email}
               onChangeText={setEmail}
               keyboardType="email-address"
               autoCapitalize="none"
               autoCorrect={false}
               editable={!loading}
             />
           </View>
   
           {/* Password Input (shown after email verification) */}
           {false && ( // This would be conditionally shown based on state
             <View className="mb-6">
               <Text className="text-gray-700 mb-2 font-medium">Password</Text>
               <TextInput
                 className="border border-gray-300 rounded-lg px-4 py-3 text-base"
                 placeholder="Enter your password"
                 value={password}
                 onChangeText={setPassword}
                 secureTextEntry
                 editable={!loading}
               />
             </View>
           )}
   
           {/* Submit Button */}
           <TouchableOpacity
             className={`bg-blue-600 rounded-lg py-4 items-center ${
               loading ? 'opacity-70' : ''
             }`}
             onPress={handleEmailVerification}
             disabled={loading || !email}
           >
             {loading ? (
               <ActivityIndicator color="white" />
             ) : (
               <Text className="text-white font-semibold text-lg">
                 Continue
               </Text>
             )}
           </TouchableOpacity>
   
           {/* Help Text */}
           <View className="mt-6 items-center">
             <Text className="text-gray-500 text-sm text-center">
               Access to ClientSync is by invitation only.{'\n'}
               Contact your travel organizer if you need assistance.
             </Text>
           </View>
         </View>
       </KeyboardAvoidingView>
     )
   }
   ```

3. **Add required dependencies**:
   ```bash
   cd packages/mobile-app
   pnpm add @supabase/supabase-js @react-native-async-storage/async-storage react-native-url-polyfill
   ```

4. **Update app layout to handle auth state**:
   ```typescript
   // packages/mobile-app/src/app/(app)/_layout.tsx
   import { useEffect } from 'react'
   import { Stack, router } from 'expo-router'
   import { supabase } from '../../lib/supabase'
   
   export default function AppLayout() {
     useEffect(() => {
       // Listen for auth changes
       const { data: { subscription } } = supabase.auth.onAuthStateChange(
         async (event, session) => {
           if (event === 'SIGNED_OUT') {
             router.replace('/login')
           }
         }
       )
   
       return () => subscription.unsubscribe()
     }, [])
   
     return (
       <Stack
         screenOptions={{
           headerShown: false,
         }}
       />
     )
   }
   ```

**Verification Steps**:
1. Start the app: `pnpm dev:mobile`
2. Test with an email in the allowlist - should proceed
3. Test with an email NOT in the allowlist - should show error
4. Test with invalid email format - should show validation error
5. Check that tier is stored in AsyncStorage

**UI/UX Considerations**:
- Loading states during verification
- Clear error messages for unauthorized emails
- Smooth transition to onboarding for new users
- Password field appears for existing users (implement in production)

---

### Task 1.3: Extend ViewerContext for Client Data

**Objective**: Enhance the authentication context to include client tier and profile data.

**Prerequisites**: Tasks 1.1 and 1.2 completed

**Implementation Steps**:

1. **Create enhanced ViewerContext**:
   ```typescript
   // packages/mobile-app/src/user/useViewerContext.tsx
   import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
   import { Session, User } from '@supabase/supabase-js'
   import AsyncStorage from '@react-native-async-storage/async-storage'
   import { supabase } from '../lib/supabase'
   import { Client, ClientTier } from '@clientsync/shared'
   
   interface ViewerContextType {
     // Auth state
     user: User | null
     session: Session | null
     isAuthenticated: boolean
     isLoading: boolean
   
     // Client data
     client: Client | null
     tier: ClientTier | null
     isOnboarded: boolean
   
     // Methods
     signIn: (email: string, password: string) => Promise<void>
     signUp: (email: string, password: string, tier: ClientTier) => Promise<void>
     signOut: () => Promise<void>
     refreshClientData: () => Promise<void>
   
     // Tier-based helpers
     hasAccessToTier: (requiredTier: ClientTier) => boolean
     canAccessPremiumFeatures: () => boolean
     canAccessEliteFeatures: () => boolean
   }
   
   const ViewerContext = createContext<ViewerContextType | undefined>(undefined)
   
   export function ViewerProvider({ children }: { children: ReactNode }) {
     const [user, setUser] = useState<User | null>(null)
     const [session, setSession] = useState<Session | null>(null)
     const [client, setClient] = useState<Client | null>(null)
     const [isLoading, setIsLoading] = useState(true)
   
     // Initialize auth state
     useEffect(() => {
       // Get initial session
       supabase.auth.getSession().then(({ data: { session } }) => {
         setSession(session)
         setUser(session?.user ?? null)
         if (session?.user) {
           fetchClientData(session.user.id)
         }
         setIsLoading(false)
       })
   
       // Listen for auth changes
       const { data: { subscription } } = supabase.auth.onAuthStateChange(
         async (_event, session) => {
           setSession(session)
           setUser(session?.user ?? null)
           
           if (session?.user) {
             await fetchClientData(session.user.id)
           } else {
             setClient(null)
           }
         }
       )
   
       return () => subscription.unsubscribe()
     }, [])
   
     // Fetch client data from database
     const fetchClientData = async (userId: string) => {
       try {
         const { data, error } = await supabase
           .from('clients')
           .select(`
             *,
             profile:client_profiles(*),
             preferences:client_preferences(*)
           `)
           .eq('id', userId)
           .single()
   
         if (error) throw error
   
         if (data) {
           const clientData: Client = {
             id: data.id,
             email: data.email,
             tier: data.tier,
             profile: data.profile,
             preferences: data.preferences,
             created_at: data.created_at,
             updated_at: data.updated_at
           }
           setClient(clientData)
           
           // Cache tier for offline access
           await AsyncStorage.setItem('userTier', data.tier)
         }
       } catch (error) {
         console.error('Error fetching client data:', error)
       }
     }
   
     // Sign in method
     const signIn = async (email: string, password: string) => {
       const { error } = await supabase.auth.signInWithPassword({
         email,
         password
       })
       
       if (error) throw error
     }
   
     // Sign up method
     const signUp = async (email: string, password: string, tier: ClientTier) => {
       const { data, error } = await supabase.auth.signUp({
         email,
         password,
         options: {
           data: { tier } // Pass tier as metadata
         }
       })
       
       if (error) throw error
   
       // Create client record
       if (data.user) {
         const { error: clientError } = await supabase
           .from('clients')
           .insert({
             id: data.user.id,
             email,
             tier
           })
         
         if (clientError) throw clientError
       }
     }
   
     // Sign out method
     const signOut = async () => {
       const { error } = await supabase.auth.signOut()
       if (error) throw error
       
       // Clear cached data
       await AsyncStorage.multiRemove(['userTier', 'onboardingData'])
     }
   
     // Refresh client data
     const refreshClientData = async () => {
       if (user) {
         await fetchClientData(user.id)
       }
     }
   
     // Tier-based access helpers
     const tierHierarchy: Record<ClientTier, number> = {
       [ClientTier.STANDARD]: 1,
       [ClientTier.PREMIUM]: 2,
       [ClientTier.ELITE]: 3
     }
   
     const hasAccessToTier = (requiredTier: ClientTier): boolean => {
       if (!client?.tier) return false
       return tierHierarchy[client.tier] >= tierHierarchy[requiredTier]
     }
   
     const canAccessPremiumFeatures = () => hasAccessToTier(ClientTier.PREMIUM)
     const canAccessEliteFeatures = () => hasAccessToTier(ClientTier.ELITE)
   
     // Context value
     const value: ViewerContextType = {
       // Auth state
       user,
       session,
       isAuthenticated: !!session,
       isLoading,
   
       // Client data
       client,
       tier: client?.tier ?? null,
       isOnboarded: client?.onboarding_completed ?? false,
   
       // Methods
       signIn,
       signUp,
       signOut,
       refreshClientData,
   
       // Tier helpers
       hasAccessToTier,
       canAccessPremiumFeatures,
       canAccessEliteFeatures
     }
   
     return (
       <ViewerContext.Provider value={value}>
         {children}
       </ViewerContext.Provider>
     )
   }
   
   // Hook to use the context
   export function useViewer() {
     const context = useContext(ViewerContext)
     if (!context) {
       throw new Error('useViewer must be used within ViewerProvider')
     }
     return context
   }
   
   // Convenience hooks
   export function useClientTier() {
     const { tier } = useViewer()
     return tier
   }
   
   export function useTierAccess() {
     const { hasAccessToTier, canAccessPremiumFeatures, canAccessEliteFeatures } = useViewer()
     return { hasAccessToTier, canAccessPremiumFeatures, canAccessEliteFeatures }
   }
   ```

2. **Update root layout to use ViewerProvider**:
   ```typescript
   // packages/mobile-app/src/app/_layout.tsx
   import { Slot } from 'expo-router'
   import { ViewerProvider } from '../user/useViewerContext'
   
   export default function RootLayout() {
     return (
       <ViewerProvider>
         <Slot />
       </ViewerProvider>
     )
   }
   ```

3. **Create auth guard for protected routes**:
   ```typescript
   // packages/mobile-app/src/components/AuthGuard.tsx
   import { useEffect } from 'react'
   import { router } from 'expo-router'
   import { View, ActivityIndicator } from 'react-native'
   import { useViewer } from '../user/useViewerContext'
   
   interface AuthGuardProps {
     children: React.ReactNode
     requireOnboarding?: boolean
   }
   
   export function AuthGuard({ children, requireOnboarding = false }: AuthGuardProps) {
     const { isAuthenticated, isLoading, isOnboarded } = useViewer()
   
     useEffect(() => {
       if (!isLoading) {
         if (!isAuthenticated) {
           router.replace('/login')
         } else if (requireOnboarding && !isOnboarded) {
           router.replace('/(app)/onboarding/personal-details')
         }
       }
     }, [isAuthenticated, isLoading, isOnboarded, requireOnboarding])
   
     if (isLoading) {
       return (
         <View className="flex-1 justify-center items-center">
           <ActivityIndicator size="large" />
         </View>
       )
     }
   
     if (!isAuthenticated || (requireOnboarding && !isOnboarded)) {
       return null
     }
   
     return <>{children}</>
   }
   ```

**Usage Examples**:

1. **In components**:
   ```typescript
   // Example: Tier-based content
   function PremiumFeature() {
     const { canAccessPremiumFeatures } = useTierAccess()
     
     if (!canAccessPremiumFeatures()) {
       return <UpgradePrompt />
     }
     
     return <PremiumContent />
   }
   ```

2. **In screens**:
   ```typescript
   // Example: Profile screen
   function ProfileScreen() {
     const { client, tier, refreshClientData } = useViewer()
     
     return (
       <View>
         <Text>Welcome, {client?.profile.first_name}!</Text>
         <Text>Your tier: {tier}</Text>
         <Button onPress={refreshClientData} title="Refresh" />
       </View>
     )
   }
   ```

**Verification Checklist**:
- [ ] User data loads on app start
- [ ] Client data includes profile and preferences
- [ ] Tier-based access helpers work correctly
- [ ] Sign out clears all cached data
- [ ] Auth state changes trigger navigation
- [ ] Loading states display during data fetch

---

## Phase 2: Mobile App - Client Onboarding Flow

### Task 2.1: Create Progress Indicator Component

**Objective**: Build a reusable progress indicator for the multi-step onboarding process.

**Prerequisites**: Phase 1 completed

**Implementation Steps**:

1. **Create ProgressIndicator component**:
   ```typescript
   // packages/mobile-app/src/ui/ProgressIndicator.tsx
   import React, { useEffect } from 'react'
   import { View, Text, Dimensions } from 'react-native'
   import Animated, {
     useAnimatedStyle,
     useSharedValue,
     withSpring,
     withTiming,
     interpolate,
     Extrapolate
   } from 'react-native-reanimated'
   
   interface ProgressIndicatorProps {
     steps: string[]
     currentStep: number
     className?: string
   }
   
   export function ProgressIndicator({ 
     steps, 
     currentStep, 
     className = '' 
   }: ProgressIndicatorProps) {
     const progress = useSharedValue(0)
     const screenWidth = Dimensions.get('window').width
   
     useEffect(() => {
       progress.value = withSpring(currentStep / (steps.length - 1))
     }, [currentStep, steps.length])
   
     const progressBarStyle = useAnimatedStyle(() => {
       const width = interpolate(
         progress.value,
         [0, 1],
         [0, screenWidth - 48], // Account for padding
         Extrapolate.CLAMP
       )
   
       return {
         width: withTiming(width, { duration: 300 }),
       }
     })
   
     return (
       <View className={`px-6 py-4 ${className}`}>
         {/* Step Labels */}
         <View className="flex-row justify-between mb-2">
           {steps.map((step, index) => (
             <Text
               key={step}
               className={`text-xs ${
                 index <= currentStep ? 'text-blue-600' : 'text-gray-400'
               }`}
               style={{ maxWidth: screenWidth / steps.length - 20 }}
               numberOfLines={1}
             >
               {step}
             </Text>
           ))}
         </View>
   
         {/* Progress Bar */}
         <View className="relative">
           {/* Background */}
           <View className="h-2 bg-gray-200 rounded-full" />
           
           {/* Progress */}
           <Animated.View
             className="absolute top-0 left-0 h-2 bg-blue-600 rounded-full"
             style={progressBarStyle}
           />
           
           {/* Step Dots */}
           <View className="absolute top-0 left-0 right-0 flex-row justify-between">
             {steps.map((_, index) => (
               <StepDot
                 key={index}
                 isActive={index <= currentStep}
                 isComplete={index < currentStep}
                 isCurrent={index === currentStep}
               />
             ))}
           </View>
         </View>
   
         {/* Current Step Indicator */}
         <View className="mt-4 items-center">
           <Text className="text-sm text-gray-600">
             Step {currentStep + 1} of {steps.length}
           </Text>
         </View>
       </View>
     )
   }
   
   interface StepDotProps {
     isActive: boolean
     isComplete: boolean
     isCurrent: boolean
   }
   
   function StepDot({ isActive, isComplete, isCurrent }: StepDotProps) {
     const scale = useSharedValue(1)
     const opacity = useSharedValue(1)
   
     useEffect(() => {
       if (isCurrent) {
         // Pulse animation for current step
         scale.value = withSpring(1.2)
         opacity.value = withTiming(1)
       } else {
         scale.value = withSpring(1)
         opacity.value = withTiming(isActive ? 1 : 0.5)
       }
     }, [isCurrent, isActive])
   
     const animatedStyle = useAnimatedStyle(() => ({
       transform: [{ scale: scale.value }],
       opacity: opacity.value,
     }))
   
     return (
       <Animated.View
         className={`w-3 h-3 rounded-full ${
           isActive ? 'bg-blue-600' : 'bg-gray-300'
         } ${isCurrent ? 'ring-2 ring-blue-200' : ''}`}
         style={animatedStyle}
       >
         {isComplete && (
           <View className="flex-1 items-center justify-center">
             <Text className="text-white text-xs">✓</Text>
           </View>
         )}
       </Animated.View>
     )
   }
   ```

2. **Create alternative simple version** (if Reanimated causes issues):
   ```typescript
   // packages/mobile-app/src/ui/SimpleProgressIndicator.tsx
   import React from 'react'
   import { View, Text } from 'react-native'
   
   interface SimpleProgressIndicatorProps {
     steps: string[]
     currentStep: number
     className?: string
   }
   
   export function SimpleProgressIndicator({ 
     steps, 
     currentStep, 
     className = '' 
   }: SimpleProgressIndicatorProps) {
     const progressPercentage = (currentStep / (steps.length - 1)) * 100
   
     return (
       <View className={`px-6 py-4 ${className}`}>
         {/* Progress Bar */}
         <View className="h-2 bg-gray-200 rounded-full overflow-hidden">
           <View
             className="h-full bg-blue-600"
             style={{ width: `${progressPercentage}%` }}
           />
         </View>
   
         {/* Step Indicators */}
         <View className="flex-row justify-between mt-3">
           {steps.map((step, index) => (
             <View key={step} className="items-center">
               <View
                 className={`w-8 h-8 rounded-full items-center justify-center ${
                   index <= currentStep ? 'bg-blue-600' : 'bg-gray-300'
                 }`}
               >
                 <Text className="text-white text-xs font-bold">
                   {index + 1}
                 </Text>
               </View>
               <Text 
                 className={`text-xs mt-1 ${
                   index <= currentStep ? 'text-blue-600' : 'text-gray-400'
                 }`}
                 numberOfLines={1}
               >
                 {step}
               </Text>
             </View>
           ))}
         </View>
       </View>
     )
   }
   ```

3. **Add to UI exports**:
   ```typescript
   // packages/mobile-app/src/ui/index.ts
   export { ProgressIndicator } from './ProgressIndicator'
   export { SimpleProgressIndicator } from './SimpleProgressIndicator'
   ```

**Usage Example**:
```typescript
// In onboarding screens
const ONBOARDING_STEPS = [
  'Personal',
  'Flight',
  'Hotel',
  'Activities',
  'Review'
]

function OnboardingScreen() {
  const [currentStep, setCurrentStep] = useState(0)
  
  return (
    <View>
      <ProgressIndicator 
        steps={ONBOARDING_STEPS}
        currentStep={currentStep}
      />
      {/* Rest of screen content */}
    </View>
  )
}
```

**Verification**:
- [ ] Progress bar animates smoothly between steps
- [ ] Current step is highlighted
- [ ] Step labels are readable
- [ ] Component is responsive to different screen sizes
- [ ] Fallback version works without animations

---

### Task 2.2: Create Onboarding Layout

**Objective**: Build the base layout for onboarding screens with navigation controls.

**Prerequisites**: Task 2.1 completed

**Implementation Steps**:

1. **Create onboarding context**:
   ```typescript
   // packages/mobile-app/src/contexts/OnboardingContext.tsx
   import { createContext, useContext, useState, ReactNode } from 'react'
   import { ClientProfile, ClientPreferences, ClientTier } from '@clientsync/shared'
   
   interface OnboardingData {
     email: string
     tier: ClientTier
     profile: Partial<ClientProfile>
     preferences: Partial<ClientPreferences>
   }
   
   interface OnboardingContextType {
     data: OnboardingData
     currentStep: number
     totalSteps: number
     updateProfile: (profile: Partial<ClientProfile>) => void
     updatePreferences: (preferences: Partial<ClientPreferences>) => void
     nextStep: () => void
     previousStep: () => void
     canGoNext: boolean
     canGoPrevious: boolean
   }
   
   const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined)
   
   export function OnboardingProvider({ 
     children,
     initialData
   }: { 
     children: ReactNode
     initialData: { email: string; tier: ClientTier }
   }) {
     const [currentStep, setCurrentStep] = useState(0)
     const [data, setData] = useState<OnboardingData>({
       email: initialData.email,
       tier: initialData.tier,
       profile: {},
       preferences: {}
     })
   
     const totalSteps = 5 // Personal, Flight, Hotel, Activities, Review
   
     const updateProfile = (profile: Partial<ClientProfile>) => {
       setData(prev => ({
         ...prev,
         profile: { ...prev.profile, ...profile }
       }))
     }
   
     const updatePreferences = (preferences: Partial<ClientPreferences>) => {
       setData(prev => ({
         ...prev,
         preferences: { ...prev.preferences, ...preferences }
       }))
     }
   
     const nextStep = () => {
       if (currentStep < totalSteps - 1) {
         setCurrentStep(prev => prev + 1)
       }
     }
   
     const previousStep = () => {
       if (currentStep > 0) {
         setCurrentStep(prev => prev - 1)
       }
     }
   
     const value: OnboardingContextType = {
       data,
       currentStep,
       totalSteps,
       updateProfile,
       updatePreferences,
       nextStep,
       previousStep,
       canGoNext: currentStep < totalSteps - 1,
       canGoPrevious: currentStep > 0
     }
   
     return (
       <OnboardingContext.Provider value={value}>
         {children}
       </OnboardingContext.Provider>
     )
   }
   
   export function useOnboarding() {
     const context = useContext(OnboardingContext)
     if (!context) {
       throw new Error('useOnboarding must be used within OnboardingProvider')
     }
     return context
   }
   ```

2. **Create onboarding layout**:
   ```typescript
   // packages/mobile-app/src/app/(app)/onboarding/_layout.tsx
   import { useEffect } from 'react'
   import { View, TouchableOpacity, SafeAreaView } from 'react-native'
   import { Stack, useLocalSearchParams, router } from 'expo-router'
   import { Ionicons } from '@expo/vector-icons'
   import { OnboardingProvider, useOnboarding } from '../../../contexts/OnboardingContext'
   import { ProgressIndicator } from '../../../ui/ProgressIndicator'
   import { Text } from '../../../ui/Text'
   import { ClientTier } from '@clientsync/shared'
   
   const ONBOARDING_STEPS = [
     'Personal',
     'Flight',
     'Hotel',
     'Activities',
     'Review'
   ]
   
   const STEP_ROUTES = [
     'personal-details',
     'flight-preferences',
     'hotel-preferences',
     'activities-dining',
     'review'
   ]
   
   function OnboardingLayoutContent() {
     const { currentStep, canGoPrevious, previousStep } = useOnboarding()
   
     const handleBack = () => {
       if (canGoPrevious) {
         previousStep()
         router.push(`/onboarding/${STEP_ROUTES[currentStep - 1]}`)
       } else {
         router.back()
       }
     }
   
     return (
       <SafeAreaView className="flex-1 bg-white">
         {/* Header */}
         <View className="flex-row items-center px-4 py-2">
           <TouchableOpacity
             onPress={handleBack}
             className="p-2"
           >
             <Ionicons name="arrow-back" size={24} color="#000" />
           </TouchableOpacity>
           
           <View className="flex-1 items-center">
             <Text className="text-lg font-semibold">Welcome to ClientSync</Text>
           </View>
           
           <View className="w-10" /> {/* Spacer for centering */}
         </View>
   
         {/* Progress Indicator */}
         <ProgressIndicator
           steps={ONBOARDING_STEPS}
           currentStep={currentStep}
           className="mb-4"
         />
   
         {/* Stack Navigator */}
         <Stack
           screenOptions={{
             headerShown: false,
             animation: 'slide_from_right'
           }}
         />
       </SafeAreaView>
     )
   }
   
   export default function OnboardingLayout() {
     const params = useLocalSearchParams<{ email: string; tier: ClientTier }>()
     
     if (!params.email || !params.tier) {
       // Redirect if missing required params
       router.replace('/login')
       return null
     }
   
     return (
       <OnboardingProvider 
         initialData={{ 
           email: params.email, 
           tier: params.tier as ClientTier 
         }}
       >
         <OnboardingLayoutContent />
       </OnboardingProvider>
     )
   }
   ```

3. **Create navigation footer component**:
   ```typescript
   // packages/mobile-app/src/components/OnboardingFooter.tsx
   import { View, TouchableOpacity, ActivityIndicator } from 'react-native'
   import { router } from 'expo-router'
   import { Text } from '../ui/Text'
   import { useOnboarding } from '../contexts/OnboardingContext'
   
   interface OnboardingFooterProps {
     onNext?: () => Promise<boolean> | boolean
     onPrevious?: () => void
     nextLabel?: string
     previousLabel?: string
     loading?: boolean
   }
   
   const STEP_ROUTES = [
     'personal-details',
     'flight-preferences',
     'hotel-preferences',
     'activities-dining',
     'review'
   ]
   
   export function OnboardingFooter({
     onNext,
     onPrevious,
     nextLabel = 'Continue',
     previousLabel = 'Back',
     loading = false
   }: OnboardingFooterProps) {
     const { 
       currentStep, 
       totalSteps,
       canGoNext, 
       canGoPrevious, 
       nextStep, 
       previousStep 
     } = useOnboarding()
   
     const handleNext = async () => {
       if (onNext) {
         const canProceed = await onNext()
         if (!canProceed) return
       }
   
       if (canGoNext) {
         nextStep()
         router.push(`/onboarding/${STEP_ROUTES[currentStep + 1]}`)
       }
     }
   
     const handlePrevious = () => {
       if (onPrevious) {
         onPrevious()
       }
       
       if (canGoPrevious) {
         previousStep()
         router.push(`/onboarding/${STEP_ROUTES[currentStep - 1]}`)
       }
     }
   
     const isLastStep = currentStep === totalSteps - 1
   
     return (
       <View className="px-6 py-4 border-t border-gray-200">
         <View className="flex-row justify-between">
           {/* Previous Button */}
           <TouchableOpacity
             onPress={handlePrevious}
             disabled={!canGoPrevious || loading}
             className={`px-6 py-3 rounded-lg ${
               canGoPrevious ? 'bg-gray-200' : 'bg-gray-100'
             }`}
           >
             <Text className={canGoPrevious ? 'text-gray-700' : 'text-gray-400'}>
               {previousLabel}
             </Text>
           </TouchableOpacity>
   
           {/* Next Button */}
           <TouchableOpacity
             onPress={handleNext}
             disabled={loading}
             className={`px-6 py-3 rounded-lg flex-1 ml-4 ${
               isLastStep ? 'bg-green-600' : 'bg-blue-600'
             } ${loading ? 'opacity-70' : ''}`}
           >
             {loading ? (
               <ActivityIndicator color="white" />
             ) : (
               <Text className="text-white text-center font-semibold">
                 {isLastStep ? 'Complete' : nextLabel}
               </Text>
             )}
           </TouchableOpacity>
         </View>
       </View>
     )
   }
   ```

4. **Create base onboarding screen template**:
   ```typescript
   // packages/mobile-app/src/components/OnboardingScreen.tsx
   import { ReactNode } from 'react'
   import { View, ScrollView, KeyboardAvoidingView, Platform } from 'react-native'
   import { Text } from '../ui/Text'
   import { OnboardingFooter } from './OnboardingFooter'
   
   interface OnboardingScreenProps {
     title: string
     subtitle?: string
     children: ReactNode
     onNext?: () => Promise<boolean> | boolean
     onPrevious?: () => void
     nextLabel?: string
     loading?: boolean
   }
   
   export function OnboardingScreen({
     title,
     subtitle,
     children,
     onNext,
     onPrevious,
     nextLabel,
     loading
   }: OnboardingScreenProps) {
     return (
       <KeyboardAvoidingView 
         behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
         className="flex-1"
       >
         <ScrollView 
           className="flex-1"
           contentContainerStyle={{ flexGrow: 1 }}
           keyboardShouldPersistTaps="handled"
         >
           <View className="flex-1 px-6 py-4">
             {/* Header */}
             <View className="mb-6">
               <Text className="text-2xl font-bold text-gray-900 mb-2">
                 {title}
               </Text>
               {subtitle && (
                 <Text className="text-gray-600">
                   {subtitle}
                 </Text>
               )}
             </View>
   
             {/* Content */}
             <View className="flex-1">
               {children}
             </View>
           </View>
         </ScrollView>
   
         {/* Footer */}
         <OnboardingFooter
           onNext={onNext}
           onPrevious={onPrevious}
           nextLabel={nextLabel}
           loading={loading}
         />
       </KeyboardAvoidingView>
     )
   }
   ```

**Verification**:
- [ ] Layout renders with progress indicator
- [ ] Navigation between steps works smoothly
- [ ] Back button navigates to previous step
- [ ] Context maintains data across steps
- [ ] Keyboard avoiding works on both platforms

---

### Task 2.3: Implement Personal Details Step

**Objective**: Create the first onboarding step for collecting personal information.

**Prerequisites**: Task 2.2 completed

**Implementation Steps**:

1. **Create personal details screen**:
   ```typescript
   // packages/mobile-app/src/app/(app)/onboarding/personal-details.tsx
   import { useState } from 'react'
   import { View, TextInput, Alert } from 'react-native'
   import { OnboardingScreen } from '../../../components/OnboardingScreen'
   import { useOnboarding } from '../../../contexts/OnboardingContext'
   import { Text } from '../../../ui/Text'
   import { isValidPhone } from '@clientsync/shared'
   
   export default function PersonalDetailsScreen() {
     const { data, updateProfile } = useOnboarding()
     
     // Form state
     const [firstName, setFirstName] = useState(data.profile.first_name || '')
     const [lastName, setLastName] = useState(data.profile.last_name || '')
     const [phone, setPhone] = useState(data.profile.phone || '')
     const [emergencyName, setEmergencyName] = useState(
       data.profile.emergency_contact?.name || ''
     )
     const [emergencyPhone, setEmergencyPhone] = useState(
       data.profile.emergency_contact?.phone || ''
     )
     const [emergencyRelation, setEmergencyRelation] = useState(
       data.profile.emergency_contact?.relationship || ''
     )
   
     const validateAndSave = async (): Promise<boolean> => {
       // Validate required fields
       if (!firstName.trim() || !lastName.trim()) {
         Alert.alert('Required Fields', 'Please enter your first and last name.')
         return false
       }
   
       if (!phone.trim() || !isValidPhone(phone)) {
         Alert.alert('Invalid Phone', 'Please enter a valid phone number.')
         return false
       }
   
       if (!emergencyName.trim() || !emergencyPhone.trim() || !emergencyRelation.trim()) {
         Alert.alert('Emergency Contact', 'Please provide complete emergency contact information.')
         return false
       }
   
       if (!isValidPhone(emergencyPhone)) {
         Alert.alert('Invalid Phone', 'Please enter a valid emergency contact phone number.')
         return false
       }
   
       // Save to context
       updateProfile({
         first_name: firstName.trim(),
         last_name: lastName.trim(),
         phone: phone.trim(),
         emergency_contact: {
           name: emergencyName.trim(),
           phone: emergencyPhone.trim(),
           relationship: emergencyRelation.trim()
         }
       })
   
       return true
     }
   
     return (
       <OnboardingScreen
         title="Personal Information"
         subtitle="Let's start with some basic information about you."
         onNext={validateAndSave}
       >
         {/* Name Fields */}
         <View className="mb-6">
           <Text className="text-gray-700 mb-1 font-medium">First Name *</Text>
           <TextInput
             className="border border-gray-300 rounded-lg px-4 py-3 text-base"
             placeholder="John"
             value={firstName}
             onChangeText={setFirstName}
             autoCapitalize="words"
             autoCorrect={false}
           />
         </View>
   
         <View className="mb-6">
           <Text className="text-gray-700 mb-1 font-medium">Last Name *</Text>
           <TextInput
             className="border border-gray-300 rounded-lg px-4 py-3 text-base"
             placeholder="Doe"
             value={lastName}
             onChangeText={setLastName}
             autoCapitalize="words"
             autoCorrect={false}
           />
         </View>
   
         <View className="mb-6">
           <Text className="text-gray-700 mb-1 font-medium">Phone Number *</Text>
           <TextInput
             className="border border-gray-300 rounded-lg px-4 py-3 text-base"
             placeholder="+1 (555) 123-4567"
             value={phone}
             onChangeText={setPhone}
             keyboardType="phone-pad"
             autoCorrect={false}
           />
         </View>
   
         {/* Emergency Contact Section */}
         <View className="mb-4">
           <Text className="text-lg font-semibold text-gray-900 mb-3">
             Emergency Contact
           </Text>
           <Text className="text-sm text-gray-600 mb-4">
             Please provide someone we can contact in case of emergency during your travels.
           </Text>
         </View>
   
         <View className="mb-4">
           <Text className="text-gray-700 mb-1 font-medium">Contact Name *</Text>
           <TextInput
             className="border border-gray-300 rounded-lg px-4 py-3 text-base"
             placeholder="Jane Doe"
             value={emergencyName}
             onChangeText={setEmergencyName}
             autoCapitalize="words"
             autoCorrect={false}
           />
         </View>
   
         <View className="mb-4">
           <Text className="text-gray-700 mb-1 font-medium">Contact Phone *</Text>
           <TextInput
             className="border border-gray-300 rounded-lg px-4 py-3 text-base"
             placeholder="+1 (555) 987-6543"
             value={emergencyPhone}
             onChangeText={setEmergencyPhone}
             keyboardType="phone-pad"
             autoCorrect={false}
           />
         </View>
   
         <View className="mb-6">
           <Text className="text-gray-700 mb-1 font-medium">Relationship *</Text>
           <TextInput
             className="border border-gray-300 rounded-lg px-4 py-3 text-base"
             placeholder="Spouse, Parent, Sibling, etc."
             value={emergencyRelation}
             onChangeText={setEmergencyRelation}
             autoCapitalize="words"
             autoCorrect={false}
           />
         </View>
       </OnboardingScreen>
     )
   }
   ```

2. **Add phone number formatting utility**:
   ```typescript
   // packages/mobile-app/src/utils/formatters.ts
   export function formatPhoneNumber(value: string): string {
     // Remove all non-digits
     const cleaned = value.replace(/\D/g, '')
     
     // Format as US phone number
     if (cleaned.length <= 3) {
       return cleaned
     } else if (cleaned.length <= 6) {
       return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`
     } else if (cleaned.length <= 10) {
       return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`
     } else {
       return `+${cleaned.slice(0, 1)} (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7, 11)}`
     }
   }
   ```

**Verification**:
- [ ] All fields accept and validate input correctly
- [ ] Phone numbers format automatically
- [ ] Validation prevents proceeding with incomplete data
- [ ] Data persists when navigating back to this screen
- [ ] Keyboard dismisses appropriately

---

### Task 2.4: Implement Flight Preferences Step

**Objective**: Create flight preferences selection screen with tier-based options.

**Prerequisites**: Task 2.3 completed

**Implementation Steps**:

1. **Create flight preferences screen**:
   ```typescript
   // packages/mobile-app/src/app/(app)/onboarding/flight-preferences.tsx
   import { useState } from 'react'
   import { View, ScrollView, TouchableOpacity } from 'react-native'
   import { OnboardingScreen } from '../../../components/OnboardingScreen'
   import { useOnboarding } from '../../../contexts/OnboardingContext'
   import { Text } from '../../../ui/Text'
   import { 
     ClientTier, 
     FLIGHT_CLASSES_BY_TIER,
     FlightPreferences 
   } from '@clientsync/shared'
   import { Ionicons } from '@expo/vector-icons'
   
   // Common airlines
   const AIRLINES = [
     'American Airlines',
     'Delta',
     'United',
     'Southwest',
     'JetBlue',
     'Alaska Airlines',
     'British Airways',
     'Lufthansa',
     'Emirates',
     'Singapore Airlines'
   ]
   
   const SEAT_PREFERENCES = [
     { value: 'aisle', label: 'Aisle', icon: 'walk-outline' },
     { value: 'window', label: 'Window', icon: 'sunny-outline' },
     { value: 'middle', label: 'No Preference', icon: 'remove-outline' }
   ] as const
   
   export default function FlightPreferencesScreen() {
     const { data, updatePreferences } = useOnboarding()
     
     // Get available classes based on tier
     const availableClasses = FLIGHT_CLASSES_BY_TIER[data.tier] || ['economy']
     
     // Form state
     const [selectedClass, setSelectedClass] = useState<string>(
       data.preferences.flight?.class || availableClasses[0]
     )
     const [selectedAirlines, setSelectedAirlines] = useState<string[]>(
       data.preferences.flight?.airlines || []
     )
     const [seatPreference, setSeatPreference] = useState<string>(
       data.preferences.flight?.seat_preference || 'aisle'
     )
     const [mealPreference, setMealPreference] = useState(
       data.preferences.flight?.meal_preference || ''
     )
   
     const toggleAirline = (airline: string) => {
       setSelectedAirlines(prev => 
         prev.includes(airline)
           ? prev.filter(a => a !== airline)
           : [...prev, airline]
       )
     }
   
     const savePreferences = async (): Promise<boolean> => {
       const flightPrefs: FlightPreferences = {
         class: selectedClass as 'economy' | 'business' | 'first',
         airlines: selectedAirlines,
         seat_preference: seatPreference as 'aisle' | 'window' | 'middle',
         meal_preference: mealPreference || undefined
       }
   
       updatePreferences({ flight: flightPrefs })
       return true
     }
   
     return (
       <OnboardingScreen
         title="Flight Preferences"
         subtitle={`As a ${data.tier} member, let us know your flight preferences.`}
         onNext={savePreferences}
       >
         <ScrollView showsVerticalScrollIndicator={false}>
           {/* Class Selection */}
           <View className="mb-6">
             <Text className="text-lg font-semibold text-gray-900 mb-3">
               Preferred Class
             </Text>
             <View className="flex-row flex-wrap gap-3">
               {availableClasses.map(flightClass => (
                 <TouchableOpacity
                   key={flightClass}
                   onPress={() => setSelectedClass(flightClass)}
                   className={`px-4 py-2 rounded-lg border ${
                     selectedClass === flightClass
                       ? 'bg-blue-600 border-blue-600'
                       : 'bg-white border-gray-300'
                   }`}
                 >
                   <Text className={
                     selectedClass === flightClass ? 'text-white' : 'text-gray-700'
                   }>
                     {flightClass.charAt(0).toUpperCase() + flightClass.slice(1)}
                   </Text>
                 </TouchableOpacity>
               ))}
             </View>
             {data.tier === ClientTier.ELITE && (
               <Text className="text-sm text-gray-600 mt-2">
                 As an Elite member, you have access to all cabin classes.
               </Text>
             )}
           </View>
   
           {/* Airline Preferences */}
           <View className="mb-6">
             <Text className="text-lg font-semibold text-gray-900 mb-3">
               Preferred Airlines
             </Text>
             <Text className="text-sm text-gray-600 mb-3">
               Select all that apply
             </Text>
             <View className="flex-row flex-wrap gap-2">
               {AIRLINES.map(airline => (
                 <TouchableOpacity
                   key={airline}
                   onPress={() => toggleAirline(airline)}
                   className={`px-3 py-2 rounded-full border ${
                     selectedAirlines.includes(airline)
                       ? 'bg-blue-100 border-blue-600'
                       : 'bg-white border-gray-300'
                   }`}
                 >
                   <Text className={
                     selectedAirlines.includes(airline) 
                       ? 'text-blue-600 font-medium' 
                       : 'text-gray-700'
                   }>
                     {airline}
                   </Text>
                 </TouchableOpacity>
               ))}
             </View>
           </View>
   
           {/* Seat Preference */}
           <View className="mb-6">
             <Text className="text-lg font-semibold text-gray-900 mb-3">
               Seat Preference
             </Text>
             <View className="flex-row gap-3">
               {SEAT_PREFERENCES.map(seat => (
                 <TouchableOpacity
                   key={seat.value}
                   onPress={() => setSeatPreference(seat.value)}
                   className={`flex-1 items-center p-4 rounded-lg border ${
                     seatPreference === seat.value
                       ? 'bg-blue-50 border-blue-600'
                       : 'bg-white border-gray-300'
                   }`}
                 >
                   <Ionicons
                     name={seat.icon as any}
                     size={24}
                     color={seatPreference === seat.value ? '#2563eb' : '#6b7280'}
                   />
                   <Text className={`mt-2 ${
                     seatPreference === seat.value 
                       ? 'text-blue-600 font-medium' 
                       : 'text-gray-700'
                   }`}>
                     {seat.label}
                   </Text>
                 </TouchableOpacity>
               ))}
             </View>
           </View>
   
           {/* Meal Preference */}
           <View className="mb-6">
             <Text className="text-lg font-semibold text-gray-900 mb-3">
               Special Meal Requirements
             </Text>
             <TextInput
               className="border border-gray-300 rounded-lg px-4 py-3 text-base"
               placeholder="e.g., Vegetarian, Kosher, Gluten-free"
               value={mealPreference}
               onChangeText={setMealPreference}
               multiline
               numberOfLines={2}
             />
             <Text className="text-sm text-gray-600 mt-2">
               Optional - Leave blank if no special requirements
             </Text>
           </View>
         </ScrollView>
       </OnboardingScreen>
     )
   }
   ```

2. **Create visual flight class selector** (optional enhancement):
   ```typescript
   // packages/mobile-app/src/components/FlightClassCard.tsx
   import { TouchableOpacity, View } from 'react-native'
   import { Text } from '../ui/Text'
   import { Ionicons } from '@expo/vector-icons'
   
   interface FlightClassCardProps {
     type: 'economy' | 'business' | 'first'
     selected: boolean
     onPress: () => void
     available: boolean
   }
   
   const CLASS_CONFIG = {
     economy: {
       title: 'Economy',
       icon: 'airplane-outline',
       features: ['Standard seats', 'Basic meals', 'Standard baggage']
     },
     business: {
       title: 'Business',
       icon: 'briefcase-outline',
       features: ['Priority boarding', 'Extra legroom', 'Premium meals']
     },
     first: {
       title: 'First Class',
       icon: 'star-outline',
       features: ['Luxury seats', 'Gourmet dining', 'Premium amenities']
     }
   }
   
   export function FlightClassCard({ 
     type, 
     selected, 
     onPress, 
     available 
   }: FlightClassCardProps) {
     const config = CLASS_CONFIG[type]
     
     return (
       <TouchableOpacity
         onPress={onPress}
         disabled={!available}
         className={`p-4 rounded-lg border mb-3 ${
           selected ? 'bg-blue-50 border-blue-600' : 
           available ? 'bg-white border-gray-300' : 'bg-gray-50 border-gray-200'
         } ${!available ? 'opacity-50' : ''}`}
       >
         <View className="flex-row items-center mb-2">
           <Ionicons
             name={config.icon as any}
             size={24}
             color={selected ? '#2563eb' : available ? '#374151' : '#9ca3af'}
           />
           <Text className={`ml-3 text-lg font-semibold ${
             selected ? 'text-blue-600' : 
             available ? 'text-gray-900' : 'text-gray-400'
           }`}>
             {config.title}
           </Text>
         </View>
         <View className="ml-9">
           {config.features.map(feature => (
             <Text key={feature} className="text-sm text-gray-600 mb-1">
               • {feature}
             </Text>
           ))}
         </View>
       </TouchableOpacity>
     )
   }
   ```

**Verification**:
- [ ] Tier-based flight classes display correctly
- [ ] Multiple airlines can be selected
- [ ] Seat preference selection works
- [ ] Data persists when navigating back
- [ ] Elite tier shows all class options

---

### Task 2.5-2.7: Implement Remaining Onboarding Steps

**Objective**: Complete hotel preferences, activities/dining preferences, and review steps.

**Implementation**: Due to space constraints, here's the structure for the remaining steps:

1. **Hotel Preferences** (`hotel-preferences.tsx`):
   - Tier-based hotel categories
   - Room type selection
   - Bed preferences
   - Special requests field

2. **Activities & Dining** (`activities-dining.tsx`):
   - Activity type multi-select
   - Intensity level selection
   - Cuisine preferences
   - Dietary restrictions

3. **Review & Submit** (`review.tsx`):
   - Summary of all selections
   - Edit capability for each section
   - Final submission to Supabase
   - Loading state during save

Each follows the same pattern as the flight preferences screen, using the `OnboardingScreen` component and saving to the onboarding context.

---

## Phase 3: Mobile App - Itinerary & Trip Management

### Task 3.1: Create Itinerary List Screen

**Objective**: Build the main screen showing the client's trips.

**Implementation**: This involves creating a trip list component that fetches from Supabase and displays trip cards with navigation to detail views.

### Task 3.2: Create Detailed Itinerary View

**Objective**: Build comprehensive trip details screen with timeline view.

### Task 3.3: Create Profile Screen

**Objective**: Allow clients to view and edit their preferences after onboarding.

---

## Phase 4: Web Dashboard - Setup & Core Features

### Task 4.1: Initialize Web Dashboard Project

**Objective**: Set up React + Vite project for the organizer dashboard.

**Implementation Steps**:

1. **Create Vite project**:
   ```bash
   cd packages/web-dashboard
   npm create vite@latest . -- --template react-ts
   ```

2. **Configure for monorepo**:
   - Update package.json name to `@clientsync/web-dashboard`
   - Add shared package dependency
   - Configure Tailwind CSS
   - Set up React Router

### Tasks 4.2-4.6: Dashboard Features

**Implementation**: Create organizer dashboard with:
- Authentication with role checks
- Client list with real-time updates
- Allowlist management
- Alert system with Supabase subscriptions

---

## Phase 5: Integration, Testing & Deployment

### Task 5.1-5.5: Final Integration

**Implementation**: Complete E2E testing, security measures, and deployment to production.

---

## Troubleshooting Guide

### Common Issues & Solutions

#### Monorepo Issues

**Problem**: "Cannot find module '@clientsync/shared'"
```bash
# Solution
cd project-root
pnpm install
pnpm --filter @clientsync/shared build
```

**Problem**: "Workspace packages not linking"
```bash
# Solution
pnpm store prune
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

#### Supabase Issues

**Problem**: "Failed to fetch" errors
```bash
# Check:
1. Verify SUPABASE_URL and SUPABASE_ANON_KEY in .env
2. Check Supabase project is not paused
3. Verify RLS policies are correct
```

**Problem**: "Permission denied" on database operations
```sql
-- Check RLS policies
SELECT * FROM pg_policies WHERE tablename = 'your_table';

-- Temporarily disable RLS for testing (DO NOT use in production)
ALTER TABLE your_table DISABLE ROW LEVEL SECURITY;
```

#### React Native Issues

**Problem**: "Unable to resolve module" in React Native
```bash
# Clear caches
cd packages/mobile-app
npx expo start -c
# or
npx react-native start --reset-cache
```

**Problem**: iOS build fails with "onGeometryChange"
```bash
# Apply the patch mentioned in CLAUDE.md
pnpm patch expo-modules-core
# Edit the Swift file as documented
pnpm patch-commit [path]
```

#### Build Issues

**Problem**: TypeScript errors in shared package
```bash
cd packages/shared
pnpm tsc --noEmit  # Check for errors
pnpm build          # Rebuild
```

**Problem**: Web dashboard build fails
```bash
cd packages/web-dashboard
# Check for missing dependencies
pnpm ls
# Clear Vite cache
rm -rf node_modules/.vite
pnpm build
```

### Debug Commands

```bash
# Check monorepo structure
pnpm ls -r --depth 0

# Verify environment variables
env | grep SUPABASE

# Test Supabase connection
curl -X GET "${SUPABASE_URL}/rest/v1/" \
  -H "apikey: ${SUPABASE_ANON_KEY}"

# Check TypeScript compilation
pnpm --filter '*' tsc --noEmit

# Run all tests
pnpm test:all
```

---

## Validation Checklist

### Phase 0 Validation
- [ ] Monorepo structure created with PNPM workspaces
- [ ] Shared package builds and exports types correctly
- [ ] Supabase project accessible with valid credentials
- [ ] Database schema created with all tables and RLS policies
- [ ] Can query allowlist table successfully

### Phase 1 Validation
- [ ] Edge function deployed and returns correct responses
- [ ] Login screen validates emails against allowlist
- [ ] ViewerContext provides authenticated user data
- [ ] Tier-based access helpers function correctly

### Phase 2 Validation
- [ ] Progress indicator animates between steps
- [ ] All onboarding steps save data to context
- [ ] Form validation prevents invalid data
- [ ] Data persists to Supabase on completion

### Phase 3 Validation
- [ ] Trip list displays user's itineraries
- [ ] Detail view shows all trip components
- [ ] Profile screen allows preference updates

### Phase 4 Validation
- [ ] Dashboard authenticates organizers only
- [ ] Client list updates in real-time
- [ ] Allowlist management functions correctly
- [ ] Alerts appear for relevant events

### Phase 5 Validation
- [ ] E2E tests pass for critical paths
- [ ] Security measures implemented
- [ ] Apps deploy successfully
- [ ] Documentation is complete

---

## Conclusion

This implementation guide provides a complete roadmap for building the ClientSync Travel Platform. Each task includes:

1. **Clear objectives** explaining the purpose
2. **Detailed prerequisites** to prevent blocking
3. **Step-by-step implementation** with exact code
4. **Verification steps** to ensure correctness
5. **Troubleshooting guidance** for common issues

Engineers can execute this plan sequentially, with clear understanding of dependencies and validation criteria at each step. The modular approach allows for parallel development where indicated, while maintaining system integrity throughout the build process.
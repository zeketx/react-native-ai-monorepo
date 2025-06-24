# ClientSync Travel Platform

A comprehensive travel management platform built with React Native, featuring a mobile app for clients and a web dashboard for organizers. This project is currently transforming from a single React Native app into a full monorepo architecture.

<img src="https://github.com/user-attachments/assets/91a4b790-fde8-46f9-8052-1f678b319fbf" width="49%" />
<img src="https://github.com/user-attachments/assets/e93b1a95-cd44-4df8-9b6d-8ae797810375" width="49%" />

## 🎯 Project Vision

ClientSync addresses the inefficiencies travel agencies face in managing high-value clients' trip preferences and reservations. The platform provides:

- **Mobile App (React Native)**: Client-facing app for email verification, onboarding, and itinerary viewing
- **Web Dashboard (React)**: Organizer interface for client management, alerts, and allowlist control
- **Supabase Backend**: Secure cloud database with real-time capabilities and authentication

## 🏗️ Architecture Overview

### Current Status: Phase 0 - Foundation

- ✅ **Monorepo Setup**: PNPM workspace configuration established
- 🚧 **In Progress**: Transforming single React Native app into full platform
- 📋 **65 Tasks Planned**: Organized across 5 development phases

### Target Architecture (Monorepo)

```
packages/
├── mobile-app/          # React Native client app (Expo)
├── web-dashboard/       # React web dashboard (Vite)
├── shared/             # Common types and utilities
└── backend/            # Supabase Edge Functions
```

## 🤖 AI-Assisted Development System

This project uses a neat `.ai/` folder system for managing development workflow:

### `.ai/` Directory Structure

- **`.ai/backlog/`** - Remaining bite-sized tasks with clear acceptance criteria
- **`.ai/doing/`** - Currently active tasks (follow SDLC workflow)
- **`.ai/done/`** - Completed tasks with implementation notes
- **`.ai/reference/`** - PRD, project pitch, and complete task overview
- **`.ai/rules/`** - Architecture guidelines, system patterns, and implementation guides
- **`.ai/sdlc/`** - Software Development Life Cycle workflow documentation

### Development Workflow

1. **Pick a task** from `.ai/backlog/` (respecting dependencies)
2. **Move to `.ai/doing/`** and create feature branch
3. **Implement** following documented patterns and acceptance criteria
4. **Mark complete** and move to `.ai/done/` with notes
5. **Commit and merge** following established conventions

## 🛠️ Technology Stack

### Core Technologies

- **React Native 0.79** with New Architecture enabled
- **Expo 53** with development build workflow
- **React 19** with React Compiler (experimental)
- **TypeScript** with strict ESM configuration
- **pnpm** package manager with workspaces

### Frontend Stack

- **Expo Router** - File-based routing
- **NativeWind** - Tailwind CSS for React Native
- **fbtee** - Internationalization system
- **React Hook Form** - Form management
- **Reanimated** - Animations

### Backend & Data

- **Supabase** - Backend-as-a-Service with PostgreSQL
- **Row Level Security** - Database security policies
- **Real-time subscriptions** - Live updates for dashboard
- **Edge Functions** - Custom serverless logic

## 🚀 Getting Started

### Prerequisites

- Node.js 22+
- pnpm 10+
- Cocoapods (for iOS)

```bash
brew install node pnpm cocoapods
```

### Installation

```bash
# Clone and install dependencies
git clone https://github.com/zeketx/react-native-ai-monorepo.git
cd react-native-ai-monorepo
pnpm install && pnpm dev:setup
```

### Development Commands

**Mobile App Development:**

```bash
pnpm dev                   # Start development server
pnpm prebuild              # Generate native iOS/Android code
pnpm ios                   # Build and run on iOS simulator
pnpm android               # Build and run on Android
```

**Testing & Quality:**

```bash
pnpm test                 # Run all tests (TypeScript, Vitest, ESLint, Prettier)
pnpm tsc:check            # TypeScript compilation check only
pnpm vitest:run           # Unit tests only
pnpm lint                 # ESLint check
pnpm format               # Auto-format code with Prettier
```

**Internationalization:**

```bash
pnpm fbtee                # Full i18n workflow (manifest → collect → translate)
pnpm fbtee:manifest       # Extract translatable strings
pnpm fbtee:collect        # Generate source_strings.json
pnpm fbtee:translate      # Process translations
```

## 🏛️ Key Architectural Patterns

### Authentication Flow

1. Root layout wraps app in `ViewerContext`
2. App layout checks `isAuthenticated` status
3. Unauthenticated users redirected to `/login`
4. Login validates against email allowlist
5. Successful auth loads user tier and preferences

### Data Management

- **Repository Pattern**: Centralized API access in `services/api.ts`
- **Service Layer**: Business logic encapsulation
- **Observer Pattern**: Real-time updates via Supabase subscriptions

### Component Architecture

- **Mobile**: Screens use shared UI components from `src/ui/`
- **Web**: Pages render components with shared service layer
- **Shared**: Common types and utilities across packages

## 🔒 Security & Compliance

- **Email Allowlist**: Exclusive access control
- **Row Level Security**: Database-level permissions
- **End-to-end Encryption**: Sensitive data protection
- **GDPR/CCPA Compliance**: Privacy regulation adherence
- **Audit Logging**: Change tracking for security

## 📚 Documentation

- **[Product Requirements](/.ai/reference/prd.md)** - Complete feature specifications
- **[Architecture Guide](/.ai/rules/architecture.md)** - System design and patterns
- **[Development Workflow](/.ai/sdlc/sdlc.md)** - SDLC process and standards
- **[Implementation Guide](/.ai/rules/clientsync-implementation-guide.md)** - Development guidelines

## 🤝 Contributing

This project follows a structured development workflow:

1. **Review** available tasks in `.ai/backlog/`
2. **Follow** the SDLC process documented in `.ai/sdlc/sdlc.md`
3. **Respect** architectural patterns in `.ai/rules/`
4. **Test** thoroughly using `pnpm test`
5. **Document** progress in task files

---

Shoutout to IndyDevDan & Parker Rex for some of the workflows!

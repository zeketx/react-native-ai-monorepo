
## Side Project: Monorepo Exploration with AI Agent Workflow

This is a side project focused on building a niche travel platform. This setup is primarily an exploration of a **monorepo architecture** housing both a **Payload CMS** backend and a **React Native** mobile application. Additionally, I'm integrating and testing a theoretical **AI agent workflow** to streamline development.


## 🏗️ Monorepo Architecture

This project uses a **pnpm workspace monorepo** that enables:

- **Shared TypeScript types** between backend and mobile app
- **Atomic deployments** - API changes and mobile updates in the same commit
- **Unified development experience** - single install, consistent tooling
- **Independent deployment flexibility** - backend and mobile can deploy separately

### 📦 Package Structure

```
clientsync-travel-platform/
├── packages/
│   ├── mobile-app/          # React Native mobile application
│   └── cms/                 # Payload CMS backend API
├── .ai/                     # AI-assisted development workflow
├── CLAUDE.md               # Monorepo development guidelines
└── README.md               # This file
```

## 🚀 Technology Stack

### Mobile Application (`packages/mobile-app/`)
- **React Native 0.79** with New Architecture
- **Expo 53** with development build workflow
- **React 19** with React Compiler (experimental)
- **NativeWind** (Tailwind CSS for React Native)
- **Expo Router** for file-based navigation
- **TypeScript** with strict ESM configuration

### Backend API (`packages/cms/`)
- **Payload CMS 3.0** (Next.js native)
- **PostgreSQL** database (SQLite for development)
- **TypeScript** with auto-generated types
- **REST & GraphQL APIs** auto-generated
- **Built-in Admin UI** for content management

## ⚡ Quick Start

### Prerequisites
- **Node.js** ≥20.0.0
- **pnpm** ≥8.0.0
- **iOS**: Xcode 15+ (for iOS development)
- **Android**: JDK 17 (for Android development)

### Installation
```bash
# Clone and install all dependencies
git clone <repository-url>
cd clientsync-travel-platform
pnpm install
```

### Development Commands

```bash
# Start both mobile app and CMS
pnpm dev:all

# Start mobile app only (React Native)
pnpm dev:mobile

# Start CMS only (Payload backend)
pnpm dev:cms

# Build all packages
pnpm build:all

# Run tests across all packages
pnpm test:all

# Lint all packages
pnpm lint:all
```

### Quick Development Setup
1. **Start CMS**: `pnpm dev:cms` (runs on http://localhost:3001)
2. **Start Mobile**: `pnpm dev:mobile` (opens Expo development server)
3. **Access Admin**: Navigate to http://localhost:3001/admin for CMS management

## 🔄 Deployment & Update Strategy

### Understanding Update Types

| Update Type | Timeline | Approval Required | Examples |
|-------------|----------|------------------|----------|
| **Backend (CMS)** | Instant | None | API changes, data updates, business logic |
| **Mobile (EAS Updates)** | 15-30 minutes | None | UI fixes, JavaScript changes, new screens |
| **Native Updates** | 1-7 days | App Store | New permissions, native features, libraries |

### Mobile App Updates with Expo EAS

**Over-the-Air Updates (No Store Approval)**:
- UI/UX changes and bug fixes
- Business logic updates
- New React Native screens
- API endpoint changes
- Feature flag toggles

**Store Updates Required**:
- New native permissions (camera, location)
- Native library additions
- iOS/Android SDK updates
- App icon or splash screen changes

### Backend API Updates
- **Instant deployment** - changes go live immediately
- **Backward compatibility** - mobile app versions gracefully handle API changes
- **Feature flags** - enable/disable features without app updates
- **Version management** - support multiple API versions simultaneously

## 🤖 AI-Assisted Development Workflow

The `.ai/` folder contains our **Software Development Life Cycle (SDLC)** management system that enables organized, task-driven development.

### .ai Directory Structure

```
.ai/
├── backlog/                 # Planned tasks (ready to start)
├── doing/                   # Active tasks (in development)
├── done/                    # Completed tasks (with notes)
├── backlog-archive/         # Archived/postponed tasks
├── sdlc/                    # SDLC documentation and guidelines
├── rules/                   # Project architecture and patterns
└── reference/               # Supporting documentation
```

### SDLC Task Lifecycle

Our development follows a structured **4-phase lifecycle**:

#### 1. 📋 **Task Initiation**
- Select task from `.ai/backlog/`
- Create feature branch: `git checkout -b feature/task-name`
- Move task file: `backlog/` → `doing/`

#### 2. 💻 **Development**
- Implement feature following project guidelines
- Update task file with progress notes
- Follow TypeScript and React best practices
- Test API endpoints and mobile integration

#### 3. 🧪 **Quality Assurance**
- Ensure environment works with committed changes
- Run tests and validation
- Verify mobile app and CMS integration

#### 4. ✅ **Completion**
- Update task file with completion notes
- Move task file: `doing/` → `done/`
- Commit changes with descriptive message
- Update documentation if needed

### Task Management Benefits

- **Organized Development**: Every feature starts as a planned task
- **Progress Tracking**: Clear visibility of what's being worked on
- **Knowledge Retention**: Task files document decisions and learnings
- **Team Coordination**: Shared understanding of project status
- **Historical Context**: Completed tasks serve as project documentation

### Example Task Workflow

```bash
# 1. Start new task
git checkout -b feature/user-authentication
mv .ai/backlog/CS-PC-002-auth-system.md .ai/doing/

# 2. Develop feature
# ... implement authentication ...

# 3. Complete task
# Update task file with completion notes
mv .ai/doing/CS-PC-002-auth-system.md .ai/done/
git add -A && git commit -m "Complete user authentication system"
```

## 📁 Project Structure Deep Dive

### Mobile App (`packages/mobile-app/`)
```
mobile-app/
├── src/
│   ├── app/                 # Expo Router navigation
│   │   ├── (app)/          # Authenticated routes
│   │   └── login.tsx       # Authentication screen
│   ├── auth/               # Authentication services
│   ├── ui/                 # Reusable UI components
│   └── user/               # User context and state
├── assets/                 # Images, icons, splash screens
├── android/                # Native Android code
├── ios/                    # Native iOS code
└── package.json           # Dependencies and scripts
```

### CMS Backend (`packages/cms/`)
```
cms/
├── src/
│   ├── app/                # Next.js app router
│   │   ├── (payload)/      # Payload admin UI routes
│   │   └── api/            # REST API endpoints
│   ├── collections/        # Payload data models
│   ├── access/            # Access control functions
│   ├── hooks/             # Collection lifecycle hooks
│   └── payload.config.ts  # Payload configuration
├── .env.example           # Environment variables template
└── package.json          # Dependencies and scripts
```

## 🔧 Development Guidelines

### Branching Strategy
- **Main branch**: Production-ready code
- **Feature branches**: `feature/task-name` for each task
- **Never push directly** to main branch
- **One branch per task** from `.ai/` workflow

### Code Standards
- **TypeScript strict mode** across all packages
- **ESLint + Prettier** for consistent formatting
- **Conventional commits** for clear git history
- **JSDoc comments** for public APIs

### Testing Strategy
- **Unit tests** for business logic
- **Integration tests** for API endpoints
- **E2E tests** for critical user flows
- **Type checking** as part of CI/CD

## 📚 Additional Documentation

- **[CLAUDE.md](CLAUDE.md)** - Monorepo development guidelines for AI assistance
- **[Mobile App Guide](packages/mobile-app/CLAUDE.md)** - React Native specific guidelines
- **[CMS Guide](packages/cms/)** - Payload CMS development patterns
- **[SDLC Documentation](.ai/sdlc/sdlc.md)** - Complete development lifecycle guide

## 📋 Common Development Scenarios

### Adding a New Feature
1. Create task file in `.ai/backlog/`
2. Follow SDLC workflow
3. Update both CMS collections and mobile UI
4. Deploy CMS first, then push EAS update

### Fixing a Bug
1. Identify if it's backend (CMS) or frontend (mobile)
2. Create hotfix task in `.ai/doing/`
3. Implement fix
4. Deploy immediately (no store approval needed)

### API Changes
1. Update Payload CMS collections
2. Generate new TypeScript types
3. Update mobile app to use new types
4. Test integration
5. Deploy as coordinated release

## 🚀 Deployment

### CMS Deployment
- **Platform**: Vercel, Railway, or self-hosted
- **Database**: PostgreSQL (production)
- **Environment**: Configure via environment variables
- **Timeline**: Instant deployment

### Mobile App Deployment
- **Development**: Expo development builds
- **Testing**: TestFlight (iOS) / Internal App Sharing (Android)
- **Production**: App Store / Google Play
- **Updates**: EAS Updates for JavaScript changes

---

### Shoutout ParkerRex and IndyDevDan for ai dev workflow inspo ###
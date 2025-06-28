# Proposed Architecture for ClientSync Travel Platform

## Proposed File Structure

The project is structured as a monorepo using PNPM workspaces to manage the mobile app, web dashboard, and shared code efficiently. The current file structure for the React Native app is moved into packages/mobile-app/, with new directories added for the web dashboard and shared utilities.

## clientsync-travel-platform/

├── packages/
│   ├── mobile-app/                      # React Native mobile app (Expo)
│   │   ├── src/
│   │   │   ├── app/                     # Routing and navigation (Expo Router)
│   │   │   │   ├── (app)/
│   │   │   │   │   ├── (tabs)/
│   │   │   │   │   │   ├── _layout.tsx
│   │   │   │   │   │   ├── index.tsx
│   │   │   │   │   │   └── two.tsx
│   │   │   │   │   └── _layout.tsx
│   │   │   │   ├── +html.tsx
│   │   │   │   ├── +not-found.tsx
│   │   │   │   ├── _layout.tsx
│   │   │   │   └── login.tsx
│   │   │   ├── i18n/                    # Internationalization
│   │   │   │   └── getLocale.tsx
│   │   │   ├── lib/                     # Library utilities
│   │   │   │   └── cx.tsx
│   │   │   ├── setup.tsx                # App setup and initialization
│   │   │   ├── tests/                   # Unit tests
│   │   │   │   └── App.test.tsx
│   │   │   ├── translations/            # Translation files
│   │   │   │   └── ja_JP.json
│   │   │   ├── ui/                      # Reusable UI components
│   │   │   │   ├── BottomSheetModal.tsx
│   │   │   │   ├── Text.tsx
│   │   │   │   └── colors.ts
│   │   │   └── user/                    # User context and hooks
│   │   │       └── useViewerContext.tsx
│   │   ├── assets/                      # Images, fonts, etc.
│   │   │   ├── adaptive-icon.png
│   │   │   ├── favicon.png
│   │   │   ├── icon.png
│   │   │   └── splash.png
│   │   ├── .expo/                       # Expo configuration
│   │   │   ├── README.md
│   │   │   ├── devices.json
│   │   │   └── prebuild/
│   │   ├── git-hooks/                   # Git hooks
│   │   │   └── pre-commit
│   │   ├── app.json
│   │   ├── babel.config.js
│   │   ├── eas.json
│   │   ├── eslint.config.js
│   │   ├── expo-env.d.ts
│   │   ├── metro.config.cjs
│   │   ├── nativewind-env.d.ts
│   │   ├── package.json
│   │   ├── pnpm-lock.yaml
│   │   ├── tailwind.config.ts
│   │   ├── tsconfig.json
│   │   └── vitest.config.js
│   │
│   ├── web-dashboard/                   # React web dashboard (Vite)
│   │   ├── src/
│   │   │   ├── components/              # Reusable UI components
│   │   │   │   ├── ClientList.tsx
│   │   │   │   ├── Alerts.tsx
│   │   │   │   └── AllowlistManager.tsx
│   │   │   ├── pages/                   # Dashboard pages
│   │   │   │   ├── Dashboard.tsx
│   │   │   │   └── ClientManagement.tsx
│   │   │   ├── services/                # API and data services
│   │   │   │   └── api.ts
│   │   │   ├── utils/                   # Utility functions
│   │   │   └── main.tsx                 # Main app entry point
│   │   ├── public/                      # Static assets
│   │   ├── index.html
│   │   ├── package.json
│   │   ├── vite.config.js
│   │   └── tailwind.config.ts
│   │
│   └── shared/                          # Shared utilities or types
│       ├── src/
│       │   └── types.ts                 # Shared TypeScript types
│       └── package.json
│
├── packages/cms/                        # Payload CMS application
│   ├── src/
│   │   ├── collections/                 # Payload collections (data models)
│   │   ├── components/                  # Admin UI components
│   │   ├── endpoints/                   # Custom API endpoints
│   │   ├── access/                      # Access control functions
│   │   └── hooks/                       # Collection hooks
│   ├── payload.config.ts                # Payload configuration
│   └── package.json
│
├── .gitignore
├── .npmrc
├── .prettierignore
├── .svgrrc
├── .vscode/                             # VSCode settings
│   ├── extensions.json
│   └── settings.json
├── package.json                         # Root package.json for monorepo
├── prettier.config.js
└── pnpm-lock.yaml                       # Root PNPM lock file

## Explanation of File Structure

packages/mobile-app/: Contains the existing React Native app structure, moved from the project root, including src/, assets/, and Expo-related files. Subdirectories like .expo/ and git-hooks/ are preserved.
packages/web-dashboard/: A new React project using Vite, structured with components/, pages/, and services/ for the organizer dashboard.
packages/shared/: Stores shared TypeScript types and utilities to reduce duplication.
packages/cms/: Houses the Payload CMS application with collections, custom endpoints, and admin UI.
Root-Level Files: Configuration files like .gitignore, .npmrc, and package.json remain at the root to manage the monorepo.

Notes: 

Directories like .ai/ and .claude/ from the current structure are omitted in this proposal as they appear unrelated to the core application (e.g., development tools or notes). They can be retained in the root if needed for workflows.

The monorepo is configured with PNPM workspaces in the root package.json:{
  "private": true,
  "workspaces": ["packages/*"]
}




## System Architecture
A. System Architecture

Type: Modular Monolith
Description: A single application with distinct modules for the mobile app, web dashboard, and backend, managed within a monorepo.
Rationale: Simplifies deployment and maintenance for a project targeting 500 concurrent users, avoiding microservices complexity.

B. Key Technical Decisions

Core Programming Languages and Frameworks:
Frontend: JavaScript/TypeScript with React Native (mobile) and React (web).
Backend: TypeScript with Payload CMS (Next.js based).
Rationale: Unified language stack speeds up development and leverages React’s ecosystem.


Database: PostgreSQL via Payload CMS.
Rationale: Offers scalability, built-in content management, authentication, and API generation out of the box.


Key Libraries/Tools:
Expo: Streamlines mobile app development.
Vite: Provides fast builds for the web dashboard.
Tailwind CSS: Ensures consistent, responsive styling.
Rationale: These tools enhance productivity and meet usability goals.



C. Design Patterns in Use

Repository Pattern:
Description: Centralizes data access logic.
Application: Used in services/api.ts to interact with Payload CMS APIs.


Service Layer Pattern:
Description: Encapsulates business logic.
Application: Handles API calls and data processing in services/.


Observer Pattern:
Description: Reacts to state changes.
Application: Powers alerts in the web dashboard via Payload webhooks or polling.



D. Component Relationships

Mobile App:
Screens (e.g., app/login.tsx) use Components (e.g., ui/Text.tsx).
Services (services/api.ts) connect to Payload CMS REST/GraphQL APIs.
Navigation (Expo Router in app/) manages routing.


Web Dashboard:
Pages (e.g., Dashboard.tsx) render Components (e.g., ClientList.tsx).
Services (services/api.ts) fetch data from Payload CMS APIs.


Backend:
Custom functions (e.g., emailVerification.ts) process frontend requests.


Flow: Components call services, which interact with Payload CMS APIs.

E. Critical Implementation Paths

Set Up Payload CMS: Define collections (clients, trips, allowlists) and authentication.
Develop Mobile App: Implement email verification, onboarding, and itinerary views.
Develop Web Dashboard: Build client overview, alerts, and allowlist management.
Integrate and Test: Ensure seamless data flow and usability.


Rationale for Architectural Choices

Monorepo with PNPM Workspaces: Facilitates code sharing and dependency management.
Modular Monolith: Keeps the architecture simple and robust.
Payload CMS Backend: Provides complete CMS capabilities with built-in admin UI and API generation.
React Ecosystem: Enables rapid development and consistency across platforms.

This architecture aligns with the current file structure, extends it for the web dashboard, and meets all project requirements efficiently.

# Our Software Development Life Cycle Workflow

## Project Overview
ClientSync Travel Platform - Transitioning from Supabase to Payload CMS for improved content management and simplified architecture.

## Architecture & Key Patterns
- **Stack**: React Native (Expo) + Payload CMS + PostgreSQL
- **Monorepo**: pnpm workspaces with packages for mobile-app, shared, cms
- **API**: Payload CMS REST/GraphQL APIs
- **Auth**: Payload CMS authentication with JWT for mobile

## Standard Workflow with Task Stages & Branch Management

### 1. Task Planning & Setup
- **Ensure your tasks in `.ai/tasks/backlog/` are individual markdown files.**
  - Each task should be a separate `.md` file with descriptive filename: `task_name.md`
  - File should contain task description, acceptance criteria, and implementation notes
- **Before starting any work, think step by step, verify your plan with me.**
  - I will review the tasks in `.ai/tasks/backlog/` and confirm the next steps.

### 2. Development Lifecycle (Full Cycle)

#### Phase 1: Task Initiation
- [ ] Select task file from `.ai/tasks/backlog/`
- [ ] Create new feature branch: `git checkout -b feature/task-name`
- [ ] Move entire task file from `.ai/tasks/backlog/` to `.ai/tasks/doing/`

#### Phase 2: Development
- [ ] Implement the feature/fix following project guidelines
- [ ] Follow TypeScript and React best practices
- [ ] Ensure responsive design (mobile-first)
- [ ] Write proper JSDoc comments
- [ ] Update task file in `.ai/tasks/doing/` with progress notes as needed
- [ ] For Payload CMS tasks:
  - [ ] Follow Payload conventions and best practices
  - [ ] Ensure proper collection access control
  - [ ] Test API endpoints with REST/GraphQL
  - [ ] Update mobile app services accordingly

#### Phase 3: Quality Assurance
- [ ] Ensure environment is working with commited changes
- [ ] Run necessary tests

#### Phase 4: Completion
- [ ] Update task file with completion notes and review summary
- [ ] Move completed task file from `.ai/tasks/doing/` to `.ai/tasks/done/`
- [ ] Update Project Structure in documentation if needed
- [ ] Commit changes with descriptive message

### 3. Branch Management Rules
- **Never delete .ai folder**
- **Never push directly to main/master branch**
- **Never delete .ai/tasks/doing/, .ai/tasks/done/,or .ai/tasks/backlog/ folders and markdown files unless instructred**
- **Always create feature branches for new tasks**
- **Branch naming convention**: `feature/brief-task-description`
- **One branch per task**
- **Merge to main only after PR approval (or personal review)**
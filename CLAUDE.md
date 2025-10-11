# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Build & Development
- `yarn build` - Build all apps and packages using Turbo
- `yarn dev` - Start development servers for all apps with Turbo parallel execution 
- `yarn start` - Start production servers for all apps

### Code Quality
- `yarn lint` - Lint all projects using Turbo
- `yarn fmt` or `yarn fix` - Format all TypeScript, TSX, and Markdown files with Prettier
- `yarn prettier-check` - Check code formatting without making changes
- `yarn test` - Run tests across all packages using Turbo

### Individual App Development
Navigate to specific app directories and run:
- `yarn dev` - Start development (blog runs on port 3000 with Turbopack)
- `yarn build` - Build specific app
- `yarn check-types` - TypeScript type checking
- `yarn analyze` - Bundle analysis (available in blog app)

## Architecture Overview

This is a **Yarn Workspaces monorepo** managed by **Turborepo** containing:

### Apps (`/apps/`)
1. **blog** (`apps/blog/`) - Next.js blog with Auth0 authentication and Vercel KV for comments
   - Main blog at https://blog.duyet.net / https://duyet.vercel.app
   - Uses Auth0 for auth, Vercel KV for Redis storage
   - Supports markdown posts with KaTeX math rendering

2. **cv** (`apps/cv/`) - Simple CV hosting application
   - Live at https://cv.duyet.net / https://duyet-cv.vercel.app  
   - Serves PDF CV from `/public` directory

3. **insights** (`apps/insights/`) - Analytics dashboard
   - Live at https://insights.duyet.net / https://duyet-insights.vercel.app
   - Integrates Cloudflare Analytics, GitHub data, PostHog, WakaTime

### Shared Packages (`/packages/`)
- `@duyet/components` - Shared React components
- `@duyet/libs` - Utility libraries and functions
- `@duyet/interfaces` - TypeScript type definitions
- `@duyet/eslint-config-custom` - ESLint configuration
- `@duyet/prettier` - Prettier configuration
- `@duyet/tailwind-config` - Tailwind CSS configuration
- `@duyet/tsconfig` - TypeScript configurations

## Environment Variables

Global environment variables are defined in `turbo.json` and include:
- Next.js public URLs for cross-app linking
- Auth0 configuration (domain, client ID, admin email)
- Vercel KV Redis credentials
- PostgreSQL database connections
- External API tokens (PostHog, GitHub, Cloudflare, etc.)

Place environment files as `.env` or `.env.local` in the root directory.

## Technology Stack

- **Framework**: Next.js 15 with React 19
- **Build Tool**: Turborepo for monorepo management
- **Package Manager**: Yarn v1 (specified in package.json)
- **Styling**: Tailwind CSS with custom configurations
- **Authentication**: Auth0 (blog app)
- **Database**: PostgreSQL + Vercel KV Redis
- **Analytics**: PostHog, Cloudflare Analytics
- **Deployment**: Vercel

## Development Patterns

- Use Yarn workspaces for cross-package dependencies (`@duyet/package-name`)
- Turbo handles build orchestration and dependency management
- All apps share common ESLint, Prettier, and TypeScript configurations
- Environment variables are globally managed through Turborepo
- Shared components and utilities live in `/packages` and are imported as workspace dependencies

## Git Workflow

- Use the `/commit` command to create a signed commit with the message
- Follow semantic commit conventions (feat, fix, chore, docs, etc.)
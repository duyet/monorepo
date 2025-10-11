# AI Chat App

AI chat application powered by OpenAI's ChatKit, deployed at [ai.duyet.net](https://ai.duyet.net).

## Overview

This is a Next.js application integrating OpenAI's ChatKit web component (`@openai/chatkit-react`) to create a chatbot interface powered by workflows from OpenAI's Agent Builder platform. The app provides a themed chat interface with session management, custom client tools, and error handling.

## Development

```bash
# Install dependencies
yarn install

# Development server (http://localhost:3002)
yarn dev

# Production build
yarn build

# Start production server
yarn start

# Lint code
yarn lint

# Run tests
yarn test
```

## Environment Configuration

Required environment variables in `.env.local`:

- `OPENAI_API_KEY` - API key from the same org/project as your Agent Builder workflow
- `NEXT_PUBLIC_CHATKIT_WORKFLOW_ID` - Workflow ID from Agent Builder (format: `wf_...`)
- `CHATKIT_API_BASE` (optional) - Custom base URL for ChatKit API (defaults to `https://api.openai.com`)

Copy `.env.example` to `.env.local` and populate with your credentials.

## Architecture

### Component Hierarchy

```
app/page.tsx (Home)
  └── ChatKitPanel (components/ChatKitPanel.tsx)
      ├── useChatKit hook (manages theme, session, client tools)
      ├── <ChatKit> web component (@openai/chatkit-react)
      └── ErrorOverlay (components/ErrorOverlay.tsx)
```

### Key Integration Points

- **lib/config.ts**: Central configuration for workflow ID, starter prompts, greeting text, placeholder text, and model options
- **components/ChatKitPanel.tsx**: Main integration component handling session initialization, theme configuration, and client tool handlers
- **hooks/useColorScheme.ts**: Manages light/dark theme with localStorage persistence

### Client Tools

The ChatKit workflow can invoke client-side tools that execute in the browser:

- **`switch_theme`**: Changes theme between light/dark modes
- **`record_fact`**: Saves conversation facts (example integration)

Add new client tools by extending the `onClientTool` handler in `ChatKitPanel.tsx`.

## Technology Stack

- **Framework**: Next.js 15 with React 19
- **UI Components**: OpenAI ChatKit
- **Styling**: Tailwind CSS v4
- **Testing**: Vitest
- **Deployment**: Vercel

## Integration with Monorepo

This app is part of the main monorepo and shares:

- `@duyet/components` - Shared React components
- `@duyet/libs` - Utility libraries
- `@duyet/eslint-config-custom` - ESLint configuration
- `@duyet/prettier` - Prettier configuration
- `@duyet/tailwind-config` - Tailwind CSS configuration
- `@duyet/tsconfig` - TypeScript configuration

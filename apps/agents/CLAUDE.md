# CLAUDE.md - Agents App

This file provides guidance to Claude Code when working with the AI agents application.

## Overview

AI chat interface backed by a Cloudflare Agents SDK-powered agent (`DuyetAgent`). The agent has tools to search blog posts, get CV data, GitHub activity, and analytics. The frontend is a static Next.js site; the agent backend runs as a Cloudflare Durable Object.

- **Live**: Cloudflare Pages (duyet-agents project)
- **Port**: 3004 (development)
- **Output**: Static export for frontend; Cloudflare Worker for agent backend

## Development Commands

```bash
bun run dev          # Start dev server on port 3004 (Turbopack)
bun run build        # Build static export
bun run lint         # Run Biome linter
bun run check-types  # TypeScript type check

# Deploy to Cloudflare Pages
bun run cf:deploy        # Preview deployment
bun run cf:deploy:prod   # Production deployment
```

## Architecture

### Tech Stack

- **Framework**: Next.js 15, App Router, static export (frontend)
- **Agent**: `@cloudflare/ai-chat` (AIChatAgent) — Cloudflare Agents SDK
- **AI SDK**: `@ai-sdk/react` for streaming chat UI
- **UI**: Radix UI components, Framer Motion animations, `react-markdown`
- **Deployment**: Cloudflare Pages (frontend) + Cloudflare Worker (agent)

### Project Structure

```
apps/agents/
├── app/
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Main chat page
│   ├── server.ts           # DuyetAgent class (Durable Object)
│   ├── globals.css
│   └── api/
│       └── chat/           # Chat API route (proxies to Worker)
├── components/
│   ├── chat-interface.tsx  # Main chat UI component
│   ├── agent-switcher.tsx  # Switch between agent types
│   ├── tool-call.tsx       # Tool call display in chat
│   ├── chat/               # Chat sub-components
│   ├── activity/           # Agent activity display
│   └── ui/                 # Reusable UI primitives
├── lib/
│   ├── agent.ts            # Agent configuration
│   ├── agents.ts           # Agent registry
│   ├── tools/              # Agent tool definitions
│   ├── mcp-client.ts       # MCP protocol client
│   ├── hooks/              # Custom React hooks
│   ├── types.ts            # TypeScript interfaces
│   └── utils.ts            # Utility functions
└── wrangler.toml           # Cloudflare deployment config
```

## Key Patterns

### DuyetAgent (Durable Object)

The agent extends `AIChatAgent` from `@cloudflare/ai-chat`:

```typescript
// app/server.ts
import { AIChatAgent } from '@cloudflare/ai-chat'

export class DuyetAgent extends AIChatAgent {
  async init() {
    // Initialize agent state
  }

  async onBeforeChat(args: { message: string }) {
    // Pre-process messages, select tools
  }
}
```

### Agent Tools

Tools are defined in `lib/tools/` and registered on the agent:

```typescript
// Available tools:
// - searchBlogTool    — search blog posts
// - getCVTool         — get CV/resume data
// - getGitHubTool     — get GitHub activity
// - getAnalyticsTool  — get site analytics
// - getAboutTool      — get about info
```

### Adding a New Tool

1. Create tool definition in `lib/tools/my-tool.ts`
2. Export from `lib/tools/index.ts`
3. Import and register in `app/server.ts`

### Chat UI Pattern

The frontend uses `@ai-sdk/react` hooks for streaming:

```typescript
// components/chat-interface.tsx
import { useChat } from '@ai-sdk/react'

const { messages, input, handleSubmit } = useChat({
  api: '/api/chat',
})
```

## Environment Variables

```bash
# Cloudflare AI Gateway (optional)
AI_GATEWAY_URL=https://gateway.ai.cloudflare.com/v1/xxx/xxx

# Cross-app URLs for tool responses
NEXT_PUBLIC_DUYET_BLOG_URL=https://blog.duyet.net
NEXT_PUBLIC_DUYET_CV_URL=https://cv.duyet.net
```

## Deployment Notes

- Frontend deploys to Cloudflare Pages as static export
- Agent backend deploys as a Cloudflare Worker (Durable Object)
- See `app/api/AI_GATEWAY_SETUP.md` for AI Gateway configuration
- `wrangler.toml` configures the Cloudflare project name and compatibility date

## Common Tasks

### Add a New Agent Type

1. Create agent class in `lib/agents.ts`
2. Register it in the agent registry
3. Add it to `components/agent-switcher.tsx`

### Update Agent System Prompt

Edit the `DuyetAgent` class in `app/server.ts` to modify the system prompt or tool selection logic.

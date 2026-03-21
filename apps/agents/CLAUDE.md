# CLAUDE.md - Agents App

This file provides guidance to Claude Code when working with the AI agents application.

## Overview

AI chat interface using Cloudflare Pages Functions + Workers AI via AI Gateway. The agent has tools to search blog posts, get CV data, GitHub activity, and analytics. The frontend is a Vite SPA; the backend runs as Cloudflare Pages Functions.

- **Live**: Cloudflare Pages (duyet-agents project)
- **Port**: 3004 (development)
- **Output**: Static SPA (`out/`) for frontend; Pages Functions for API

## Development Commands

```bash
bun run dev          # Start dev server on port 3004
bun run build        # Build static export
bun run lint         # Run Biome linter
bun run check-types  # TypeScript type check

# Deploy to Cloudflare Pages
bun run cf:deploy        # Preview deployment
bun run cf:deploy:prod   # Production deployment
```

## Architecture

### Tech Stack

- **Framework**: Vite + TanStack Router (SPA, file-based routing; frontend)
- **AI**: Workers AI via `workers-ai-provider` + AI SDK v6 (`streamText`, `tool`, `stepCountIs`)
- **Chat UI**: `@ai-sdk/react` for streaming chat with tool rendering
- **UI**: Radix UI components, Framer Motion animations, `react-markdown`
- **Deployment**: Cloudflare Pages (static frontend + Pages Functions API)

### Project Structure

```
apps/agents/
├── app/
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Main chat page
│   └── globals.css
├── functions/api/          # Cloudflare Pages Functions (API backend)
│   ├── chat.ts             # Chat API — streamText + tool calling
│   ├── chat.test.ts        # Chat API tests (34 tests)
│   └── title.ts            # Title generation API
├── components/
│   ├── chat/               # Chat UI components (messages, tool cards)
│   ├── activity/           # Agent activity display
│   └── ui/                 # Reusable UI primitives
├── lib/
│   ├── agent.ts            # Model IDs, system prompts, tool schemas
│   ├── agents.ts           # Agent registry
│   ├── tools/              # Tool implementations (searchBlog, getCV, etc.)
│   ├── hooks/              # Custom React hooks (use-chat, use-conversations)
│   ├── types.ts            # TypeScript interfaces
│   └── utils.ts            # Utility functions
└── wrangler.toml           # Cloudflare deployment config
```

## Key Patterns

### Chat API (Pages Function)

The chat API uses AI SDK v6 `streamText` with Workers AI:

```typescript
// functions/api/chat.ts
import { streamText, tool, stepCountIs, pruneMessages } from "ai";
// Fast mode: no tools. Agent mode: full tool calling with stepCountIs(30).
```

### Agent Tools

Tools are defined in `lib/tools/` and wired in `functions/api/chat.ts`:

- `searchBlog` — search blog posts
- `getBlogPost` — get full blog post content
- `getCV` — get CV/resume data
- `getGitHub` — get GitHub activity (needsApproval)
- `getAnalytics` — get site analytics (needsApproval)
- `getAbout` — get about info

### Adding a New Tool

1. Create tool implementation in `lib/tools/my-tool.ts`
2. Export from `lib/tools/index.ts`
3. Add AI SDK `tool()` wrapper in `functions/api/chat.ts` AGENT_TOOLS
4. Add tool schema in `lib/agent.ts` AGENT_TOOLS array

## Environment Variables

```bash
# Cloudflare AI Gateway (optional)
AI_GATEWAY_URL=https://gateway.ai.cloudflare.com/v1/xxx/xxx

# Cross-app URLs for tool responses
NEXT_PUBLIC_DUYET_BLOG_URL=https://blog.duyet.net
NEXT_PUBLIC_DUYET_CV_URL=https://cv.duyet.net
```

## Deployment Notes

- Deploys to Cloudflare Pages (static frontend + Pages Functions API)
- Workers AI accessed via AI Gateway (`monorepo` gateway ID)
- Model: `@cf/meta/llama-4-scout-17b-16e-instruct` for both fast and agent modes
- `wrangler.toml` configures the Cloudflare project name and AI binding

## Common Tasks

### Update Agent System Prompt

Edit `lib/agent.ts` to modify `SYSTEM_PROMPT` (agent mode) or `FAST_SYSTEM_PROMPT` (fast mode).

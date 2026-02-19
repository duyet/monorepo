# CLAUDE.md - AI App

This file provides guidance to Claude Code when working with the AI chat application.

## Overview

AI chat interface built with OpenAI ChatKit. Supports conversation history, color scheme switching, and deploys to Cloudflare via OpenNext.

- **Port**: 3002 (development)
- **Output**: Cloudflare Workers via `@opennextjs/cloudflare` (NOT static export)

## Development Commands

```bash
bun run dev          # Start dev server on port 3002
bun run build        # Build for production
bun run lint         # Run Biome linter
bun run check-types  # TypeScript type check
bun run fmt          # Format code with Biome

# Cloudflare deployment
bun run preview      # Build + local preview with Wrangler
bun run deploy       # Build + deploy to Cloudflare
bun run upload       # Build + upload (without deploy)
bun run cf-typegen   # Regenerate Cloudflare type bindings
```

## Architecture

### Tech Stack

- **Framework**: Next.js (Server-side, **not** static export)
- **Chat UI**: `@openai/chatkit` + `@openai/chatkit-react`
- **Deployment**: Cloudflare Workers via `@opennextjs/cloudflare`
- **Shared**: `@duyet/components`, `@duyet/libs`
- **Package Manager**: Bun

### Project Structure

```
apps/ai/
├── app/
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Main chat page (client component)
│   └── api/                # API routes for chat
├── components/
│   ├── ChatKitPanel.tsx     # Main chat panel wrapper
│   ├── ConversationList.tsx # Conversation history sidebar
│   ├── ConversationItem.tsx # Individual conversation entry
│   ├── ConversationSidebar.tsx
│   └── ErrorOverlay.tsx    # Error display component
├── lib/
│   ├── client-tools.ts     # Client-side tool definitions
│   ├── client-tools.test.ts
│   ├── conversation-storage.ts  # Conversation persistence
│   ├── conversation-storage.test.ts
│   ├── errors.ts           # Error types and handling
│   ├── errors.test.ts
│   └── config.ts           # App configuration
├── hooks/
│   ├── useChatKitScript.ts     # ChatKit script loader hook
│   ├── useChatKitSession.ts    # Chat session management
│   ├── useColorScheme.ts       # Light/dark theme hook
│   ├── useColorScheme.test.ts
│   └── useConversationHistory.ts
├── types/
│   └── conversation.ts     # Conversation type definitions
├── open-next.config.ts     # OpenNext Cloudflare config
└── wrangler.jsonc          # Cloudflare Workers config
```

## Key Patterns

### Cloudflare Deployment (Not Static)

Unlike other apps, this uses `@opennextjs/cloudflare` for server-side rendering on Cloudflare Workers:

```typescript
// open-next.config.ts
const config: OpenNextConfig = {
  default: {
    override: {
      wrapper: 'cloudflare-node',
      converter: 'edge',
      // ...
    },
  },
}
```

Do **not** add `output: 'export'` to `next.config.ts` — this app requires server-side capabilities.

### ChatKit Integration

The main UI uses `@openai/chatkit-react`:

```typescript
// components/ChatKitPanel.tsx
import { ChatKitPanel } from '@openai/chatkit-react'

// app/page.tsx - client component with hooks
'use client'
const { scheme, setScheme } = useColorScheme('light')
```

### Color Scheme

Theme toggling is managed by `hooks/useColorScheme.ts`. The ChatKit panel accepts a `theme` prop.

### Conversation Storage

Conversation history is persisted via `lib/conversation-storage.ts`. This uses client-side storage.

### Testing

Tests use Bun's built-in test runner:

```bash
bun test                   # Run all tests
bun test lib/errors.test.ts # Run specific test
```

Test files are co-located with source files (`.test.ts` suffix).

## Environment Variables

```bash
# OpenAI / ChatKit
OPENAI_API_KEY=sk-xxxxxxxxxx

# Cross-app URLs
NEXT_PUBLIC_DUYET_BLOG_URL=https://blog.duyet.net
```

## Deployment Notes

- Uses `wrangler.jsonc` for Cloudflare configuration
- OpenNext adapter handles Next.js → Cloudflare Workers translation
- Run `bun run cf-typegen` after updating Cloudflare bindings in `wrangler.jsonc`
- The `preview` command runs a local Cloudflare Worker emulator via Wrangler

## Common Tasks

### Add a Client Tool

Edit `lib/client-tools.ts` to define a new tool the AI can use on the client side.

### Update Conversation Storage

Modify `lib/conversation-storage.ts` to change how conversations are saved/loaded.

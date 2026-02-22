# CLAUDE.md - Homelab Dashboard App

This file provides guidance to Claude Code when working with the homelab dashboard application.

## Overview

Beautiful monitoring dashboard for a 3-node minipc cluster, styled with Claude-inspired colors. Provides visualization of cluster metrics, service status, network topology, and incident tracking using **dynamically generated mock data** (refreshes at build time).

- **Live**: https://homelab.duyet.net | https://duyet-homelab.pages.dev
- **Port**: 3002 (development)
- **Output**: Static export (`output: 'export'`)

## Development Commands

```bash
bun run dev          # Start dev server on port 3002 (Turbopack)
bun run build        # Build static export to 'out/'
bun run lint         # Run Biome linter
bun run check-types  # TypeScript type check

# Deploy to Cloudflare Pages
bun run cf:deploy        # Preview deployment
bun run cf:deploy:prod   # Production deployment
```

## Architecture

### Tech Stack

- **Framework**: Next.js 15 with App Router, static export
- **Styling**: Tailwind CSS v4 with custom Claude color palette (OKLCH)
- **Charts**: Recharts for data visualization
- **Icons**: Lucide React
- **Deployment**: Cloudflare Pages (static export)
- **Package Manager**: Bun

### Project Structure

```
apps/homelab/
├── app/
│   ├── layout.tsx          # Root layout with theme provider
│   ├── page.tsx            # Main dashboard page
│   └── globals.css         # Tailwind v4 CSS with OKLCH colors
├── components/
│   ├── Card.tsx            # Reusable card component
│   └── dashboard/
│       ├── ClusterOverview.tsx      # 3-node cluster stats
│       ├── ResourceMetrics.tsx      # CPU & memory charts
│       ├── ServicesStatus.tsx       # Service grid with status
│       ├── NetworkStats.tsx         # Network traffic charts
│       ├── ServiceDowntime.tsx      # Incident history
│       └── NetworkTopology.tsx      # Network diagram
├── lib/
│   └── data/
│       ├── nodes.ts         # Node data (used by apps/home too)
│       └── mockData.ts      # Dynamic mock data generator
├── next.config.mjs         # Next.js config with static export
├── tailwind.config.mjs     # Tailwind v4 config with Claude colors
└── postcss.config.mjs      # PostCSS with @tailwindcss/postcss
```

## Key Patterns

### Mock Data System

All data is dynamically generated at build time in `lib/data/mockData.ts`. Data refreshes on each build.

```typescript
const random = (min: number, max: number) => Math.random() * (max - min) + min

// Node CPU ranges — adjust these to change displayed values
cpu: Number(random(40, 55).toFixed(1))
```

### Claude Color Palette

```css
claude-peach: #f5dcd0     /* Warm, welcoming */
claude-yellow: #f0d9a8    /* Soft, friendly */
claude-mint: #a8d5ba      /* Fresh, calm */
claude-lavender: #c5c5ff  /* Gentle, tech */
claude-coral: #ff9999     /* Alerts, emphasis */
claude-sky: #b3d9ff       /* Network, flow */
```

Use these consistently for new components:

```tsx
className="bg-gradient-to-br from-claude-lavender to-white"
```

### Tailwind v4 Configuration

Uses `@tailwindcss/postcss` plugin. Important: `postcss.config.mjs` must use ES module format and the new plugin.

```javascript
// postcss.config.mjs — correct format
export default { plugins: { '@tailwindcss/postcss': {} } }
```

### Node Data (Shared with Home App)

Node data in `lib/data/nodes.ts` is imported by `apps/home` at build time. Changes here affect both apps.

## Common Tasks

### Add a New Dashboard Component

1. Create component in `components/dashboard/MyComponent.tsx`
2. Use Claude color palette and Recharts for charts
3. Add mock data generator in `lib/data/mockData.ts`
4. Import in `app/page.tsx`

### Add a New Node

Edit `lib/data/nodes.ts`:

```typescript
export const nodes: Node[] = [
  // ...existing nodes
  {
    id: 'node-4',
    name: 'minipc-04',
    ip: '192.168.1.104',
    status: 'online',
    cpu: Number(random(20, 40).toFixed(1)),
    memory: Number(random(30, 50).toFixed(1)),
    memoryUsed: Number(random(5, 7).toFixed(2)),
    memoryTotal: 16,
    uptime: generateUptime(),
    services: 4,
  },
]
```

### Add a New Service

Edit `lib/data/mockData.ts` and add to `serviceConfigs`:

```typescript
{
  name: 'newservice',
  node: 'minipc-03',
  port: 8000,
  cpuRange: [2, 5],
  memRange: [500, 800],
}
```

## Environment Variables

```bash
NEXT_PUBLIC_DUYET_HOMELAB_URL=https://homelab.duyet.net
```

## Shared Dependencies

- `@duyet/components` — Header, Footer, Container, ThemeProvider
- `@duyet/config` — homelabConfig (metadata, fonts, header text)
- `@duyet/tailwind-config` — Base Tailwind configuration

## Troubleshooting

| Issue | Cause | Fix |
|-------|-------|-----|
| `@layer base` error | Wrong PostCSS config | Use `@tailwindcss/postcss` in `postcss.config.mjs` |
| Module not found | Wrong tailwind import path | Use full path in tailwind config imports |
| ES module error | Using `module.exports` | Use `export default` in `.mjs` files |
| Colors not working | Config not extending shared | Check `tailwind.config.mjs` extends base config |
| Stale data | Mock data is static | Rebuild to refresh dynamically generated data |

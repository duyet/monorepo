# Homelab Dashboard - CLAUDE.md

This file provides guidance to Claude Code when working with the homelab dashboard application.

## Overview

The **Homelab Dashboard** is a beautiful monitoring dashboard for a 3-node minipc cluster, styled with Claude-inspired colors. It provides real-time visualization of cluster metrics, services status, network topology, and incident tracking.

- **Live URL**: https://homelab.duyet.net (when deployed)
- **Port**: 3002 (development)
- **Type**: Static Site (Next.js with `output: 'export'`)

## Architecture

### Tech Stack

- **Framework**: Next.js 15 with React 19
- **Styling**: Tailwind CSS v4 with custom Claude color palette
- **Charts**: Recharts for data visualization
- **Icons**: Lucide React
- **Deployment**: Cloudflare Pages (static export)
- **Build**: Turborepo + Yarn workspaces

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
│   └── mockData.ts         # Dynamic mock data generator
├── next.config.mjs         # Next.js config with static export
├── tailwind.config.mjs     # Tailwind v4 config with Claude colors
├── postcss.config.mjs      # PostCSS with @tailwindcss/postcss
└── package.json            # Dependencies and scripts
```

## Development

### Commands

```bash
# Development (from root)
yarn dev  # Starts all apps including homelab on port 3002

# Development (from apps/homelab)
yarn dev  # Starts homelab only on port 3002

# Build
yarn build  # Creates static export in 'out' directory

# Lint & Format
yarn lint
yarn fmt
```

### Key Configuration Files

#### `next.config.mjs`
- **Important**: Has `output: 'export'` for static site generation
- Transpiles shared packages: `@duyet/components`, `@duyet/config`, `@duyet/libs`

#### `postcss.config.mjs`
- Uses `@tailwindcss/postcss` (Tailwind v4 plugin)
- ES module format (`export default`)

#### `tailwind.config.mjs`
- Extends `@duyet/tailwind-config/tailwind.config.mjs`
- Adds Claude-inspired colors:
  - `claude-peach`: #f5dcd0
  - `claude-yellow`: #f0d9a8
  - `claude-mint`: #a8d5ba
  - `claude-lavender`: #c5c5ff
  - `claude-coral`: #ff9999
  - `claude-sky`: #b3d9ff

#### `globals.css`
- Uses Tailwind v4 syntax: `@import 'tailwindcss'`
- OKLCH color format for better color accuracy
- `@theme inline` block for color mappings

## Mock Data System

The dashboard uses **dynamically generated mock data** that refreshes at build time.

### Data Generation (`lib/mockData.ts`)

All data is generated at build time using helper functions:

```typescript
// Generates random values within realistic ranges
const random = (min: number, max: number) => ...

// Generates uptime strings (20-30 days)
const generateUptime = () => ...

// Generates historical timestamps
const getHistoricalTime = (hoursAgo: number) => ...
```

### Dynamic Components

1. **Node Metrics**
   - CPU: 25-55% (varies per node)
   - Memory: 38-75% (varies per node)
   - Uptime: Random 20-30 days

2. **Service Resources**
   - Each service has realistic CPU/memory ranges
   - Example: postgres (7-10% CPU, 1800-2300MB)

3. **Historical Charts**
   - 24-hour data with realistic daily patterns
   - Lower usage at night, higher during day
   - Current values match node data

4. **Network Traffic**
   - Day/night usage patterns
   - Higher traffic during business hours
   - Values in MB/s

5. **Downtime Incidents**
   - Relative dates (7, 10, 15 days ago)
   - Recalculated on each build

### Customizing Mock Data

To adjust ranges or add services, edit `lib/mockData.ts`:

```typescript
// Example: Add a new service
const serviceConfigs = [
  ...
  {
    name: 'newservice',
    node: 'minipc-03',
    port: 8000,
    cpuRange: [2, 5],
    memRange: [500, 800]
  },
]
```

## Dashboard Components

### 1. ClusterOverview
- **Purpose**: Shows 3-node cluster summary
- **Displays**: Total nodes, services, avg CPU/memory
- **Colors**: Gradient cards with Claude colors

### 2. ResourceMetrics
- **Purpose**: Historical CPU & memory charts
- **Charts**: 24-hour area charts per node
- **Colors**: Lavender, mint, yellow for each node

### 3. ServicesStatus
- **Purpose**: Grid of all running services
- **Shows**: Name, node, port, uptime, CPU, memory
- **Services**: 10 services (traefik, postgres, jellyfin, etc.)

### 4. NetworkStats
- **Purpose**: Network traffic visualization
- **Shows**: Current inbound/outbound speeds
- **Chart**: 24-hour traffic with day/night patterns

### 5. ServiceDowntime
- **Purpose**: Track service incidents
- **Shows**: Recent downtime with duration and reason
- **History**: Last 3 incidents (dynamically dated)

### 6. NetworkTopology
- **Purpose**: Visual network diagram
- **Shows**: FPT Internet → Router → Services → Nodes
- **Nodes**: Tailscale VPN, Cloudflare Tunnel, 3 minipcs

## Claude Color Palette

The dashboard uses Claude-inspired colors throughout:

```css
claude-peach: #f5dcd0     /* Warm, welcoming */
claude-yellow: #f0d9a8    /* Soft, friendly */
claude-mint: #a8d5ba      /* Fresh, calm */
claude-lavender: #c5c5ff  /* Gentle, tech */
claude-coral: #ff9999     /* Alerts, emphasis */
claude-sky: #b3d9ff       /* Network, flow */
```

### Usage Examples

```tsx
// Gradient backgrounds
className="bg-gradient-to-br from-claude-lavender to-white"

// Chart colors (in Recharts)
<Area stroke="#9090ff" fill="url(#cpu1)" />  // Lavender
<Area stroke="#76c893" fill="url(#cpu2)" />  // Mint
<Area stroke="#ffc857" fill="url(#cpu3)" />  // Yellow
```

## Deployment

### Static Export

The app is configured for static site generation:

```javascript
// next.config.mjs
output: 'export'  // Generates static HTML in 'out' directory
```

### Cloudflare Pages

- **Output Directory**: `apps/homelab/out`
- **Build Command**: `yarn build`
- **No server-side features** - fully static

### Environment Variables

Defined in root `turbo.json`:

```json
"NEXT_PUBLIC_DUYET_HOMELAB_URL": "https://homelab.duyet.net"
```

## Shared Dependencies

The homelab app uses shared packages from the monorepo:

- `@duyet/components` - Header, Footer, Container, ThemeProvider
- `@duyet/config` - homelabConfig (metadata, fonts, header text)
- `@duyet/libs` - Utility functions (if needed)
- `@duyet/tailwind-config` - Base Tailwind configuration

## Common Tasks

### Adding a New Chart

1. Create component in `components/dashboard/`
2. Import Recharts components
3. Use Claude colors for consistency
4. Add mock data generator in `lib/mockData.ts`
5. Import in `app/page.tsx`

### Adding a New Node

Edit `lib/mockData.ts`:

```typescript
export const nodes: Node[] = [
  ...
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

### Adjusting Data Ranges

All ranges are in `lib/mockData.ts`:

```typescript
// Node CPU ranges
cpu: Number(random(40, 55).toFixed(1))  // Adjust min/max

// Service memory ranges
memRange: [200, 300]  // Adjust for service
```

## Design Principles

1. **Claude Aesthetics**: Use soft, friendly colors from the palette
2. **Clean Layout**: Generous whitespace, rounded corners
3. **Readable Typography**: Clear hierarchy with Inter font
4. **Responsive**: Mobile-friendly grid layouts
5. **Performance**: Static export, optimized charts
6. **Realistic Data**: Values within actual homelab ranges

## Troubleshooting

### Build Errors

- **@layer base error**: Ensure `postcss.config.mjs` uses `@tailwindcss/postcss`
- **Module not found**: Check tailwind config imports use full path
- **ES module error**: Use `export default`, not `module.exports`

### Styling Issues

- **Colors not working**: Check Tailwind config extends shared config
- **CSS not loading**: Verify `globals.css` imports in `layout.tsx`
- **Dark mode**: Uses `next-themes` from `@duyet/components`

### Data Issues

- **Stale data**: Mock data generates at build time, rebuild to refresh
- **Wrong ranges**: Check `random()` calls in `mockData.ts`
- **Chart issues**: Verify data structure matches Recharts expectations

## Future Enhancements

Ideas for extending the dashboard:

- [ ] Real-time data integration via API
- [ ] Historical data storage
- [ ] Alert system for thresholds
- [ ] Custom metric dashboards
- [ ] Docker container metrics
- [ ] Resource usage predictions
- [ ] Mobile app companion
- [ ] Grafana/Prometheus integration

## Resources

- [Next.js Static Export](https://nextjs.org/docs/app/building-your-application/deploying/static-exports)
- [Tailwind CSS v4](https://tailwindcss.com/docs)
- [Recharts Documentation](https://recharts.org/)
- [Cloudflare Pages](https://pages.cloudflare.com/)

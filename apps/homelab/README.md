# Homelab Dashboard

A beautiful monitoring dashboard for a 3-node minipc cluster, styled with Claude-inspired colors.

- **Live: https://homelab.duyet.net** (official)
- **Live: https://duyet-homelab.pages.dev** (Cloudflare Pages)

## Features

- **Cluster Overview**: Real-time stats for all nodes including CPU, memory, and service count
- **Resource Metrics**: Historical CPU and memory usage charts
- **Services Status**: Monitor all running services across the cluster
- **Network Statistics**: Track inbound and outbound network traffic
- **Service Downtime**: View recent service incidents and maintenance windows
- **Network Topology**: Visual representation of your network infrastructure (FPT Internet, Tailscale, Cloudflare, and cluster nodes)

## Tech Stack

- **Framework**: Next.js 15 with React 19
- **Styling**: Tailwind CSS with custom Claude-inspired color palette
- **Charts**: Recharts for data visualization
- **Icons**: Lucide React

## Development

```bash
# Install dependencies
yarn install

# Run development server (port 3002)
yarn dev

# Build for production
yarn build

# Start production server
yarn start
```

## Color Palette

The dashboard uses a Claude-inspired color palette:

- **Lavender** (#c5c5ff): Cluster nodes
- **Mint** (#a8d5ba): VPN services
- **Peach** (#f5dcd0): CPU metrics
- **Yellow** (#f0d9a8): Memory & CDN
- **Coral** (#ff9999): Network outbound
- **Sky** (#b3d9ff): Network inbound

## Mock Data

Currently displays mock data for demonstration purposes. To integrate with real cluster data:

1. Replace mock data in `lib/mockData.ts` with actual API calls
2. Add environment variables for your cluster endpoints
3. Implement data fetching hooks or server-side data fetching

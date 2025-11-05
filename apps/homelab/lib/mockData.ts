/**
 * Mock data for homelab cluster dashboard
 * Simulates a 3-node minipc cluster with various services and metrics
 */

export interface Node {
  id: string
  name: string
  ip: string
  status: 'online' | 'offline' | 'degraded'
  cpu: number // percentage
  memory: number // percentage
  memoryUsed: number // GB
  memoryTotal: number // GB
  uptime: string
  services: number
}

export interface Service {
  name: string
  status: 'running' | 'stopped' | 'error'
  node: string
  port: number
  uptime: string
  cpu: number
  memory: number
}

export interface NetworkStats {
  bytesIn: number
  bytesOut: number
  packetsIn: number
  packetsOut: number
  timestamp: string
}

export interface ServiceDowntime {
  service: string
  start: string
  end: string
  duration: string
  reason: string
}

// 3 minipc nodes
export const nodes: Node[] = [
  {
    id: 'node-1',
    name: 'minipc-01',
    ip: '192.168.1.101',
    status: 'online',
    cpu: 45.2,
    memory: 68.5,
    memoryUsed: 10.96,
    memoryTotal: 16,
    uptime: '23d 14h 32m',
    services: 8,
  },
  {
    id: 'node-2',
    name: 'minipc-02',
    ip: '192.168.1.102',
    status: 'online',
    cpu: 32.7,
    memory: 52.3,
    memoryUsed: 8.37,
    memoryTotal: 16,
    uptime: '23d 14h 29m',
    services: 6,
  },
  {
    id: 'node-3',
    name: 'minipc-03',
    ip: '192.168.1.103',
    status: 'online',
    cpu: 28.4,
    memory: 41.8,
    memoryUsed: 6.69,
    memoryTotal: 16,
    uptime: '23d 14h 31m',
    services: 5,
  },
]

// Running services
export const services: Service[] = [
  {
    name: 'traefik',
    status: 'running',
    node: 'minipc-01',
    port: 80,
    uptime: '23d 14h',
    cpu: 2.1,
    memory: 256,
  },
  {
    name: 'portainer',
    status: 'running',
    node: 'minipc-01',
    port: 9000,
    uptime: '23d 14h',
    cpu: 1.5,
    memory: 512,
  },
  {
    name: 'prometheus',
    status: 'running',
    node: 'minipc-01',
    port: 9090,
    uptime: '23d 14h',
    cpu: 3.2,
    memory: 1024,
  },
  {
    name: 'grafana',
    status: 'running',
    node: 'minipc-01',
    port: 3000,
    uptime: '23d 14h',
    cpu: 2.8,
    memory: 768,
  },
  {
    name: 'postgres',
    status: 'running',
    node: 'minipc-02',
    port: 5432,
    uptime: '23d 14h',
    cpu: 8.4,
    memory: 2048,
  },
  {
    name: 'redis',
    status: 'running',
    node: 'minipc-02',
    port: 6379,
    uptime: '23d 14h',
    cpu: 1.2,
    memory: 512,
  },
  {
    name: 'nginx',
    status: 'running',
    node: 'minipc-02',
    port: 8080,
    uptime: '23d 14h',
    cpu: 1.8,
    memory: 128,
  },
  {
    name: 'minio',
    status: 'running',
    node: 'minipc-03',
    port: 9001,
    uptime: '23d 14h',
    cpu: 2.5,
    memory: 1024,
  },
  {
    name: 'jellyfin',
    status: 'running',
    node: 'minipc-03',
    port: 8096,
    uptime: '23d 14h',
    cpu: 12.3,
    memory: 2048,
  },
  {
    name: 'pihole',
    status: 'running',
    node: 'minipc-03',
    port: 53,
    uptime: '23d 14h',
    cpu: 0.8,
    memory: 256,
  },
]

// Historical CPU data (last 24 hours)
export const cpuHistory = [
  { time: '00:00', 'minipc-01': 35, 'minipc-02': 28, 'minipc-03': 22 },
  { time: '02:00', 'minipc-01': 32, 'minipc-02': 25, 'minipc-03': 20 },
  { time: '04:00', 'minipc-01': 30, 'minipc-02': 24, 'minipc-03': 19 },
  { time: '06:00', 'minipc-01': 38, 'minipc-02': 30, 'minipc-03': 25 },
  { time: '08:00', 'minipc-01': 48, 'minipc-02': 38, 'minipc-03': 32 },
  { time: '10:00', 'minipc-01': 52, 'minipc-02': 42, 'minipc-03': 35 },
  { time: '12:00', 'minipc-01': 45, 'minipc-02': 35, 'minipc-03': 30 },
  { time: '14:00', 'minipc-01': 50, 'minipc-02': 40, 'minipc-03': 33 },
  { time: '16:00', 'minipc-01': 55, 'minipc-02': 45, 'minipc-03': 38 },
  { time: '18:00', 'minipc-01': 48, 'minipc-02': 38, 'minipc-03': 32 },
  { time: '20:00', 'minipc-01': 42, 'minipc-02': 35, 'minipc-03': 28 },
  { time: '22:00', 'minipc-01': 40, 'minipc-02': 32, 'minipc-03': 26 },
  { time: 'Now', 'minipc-01': 45, 'minipc-02': 33, 'minipc-03': 28 },
]

// Historical Memory data (last 24 hours)
export const memoryHistory = [
  { time: '00:00', 'minipc-01': 65, 'minipc-02': 50, 'minipc-03': 40 },
  { time: '02:00', 'minipc-01': 64, 'minipc-02': 49, 'minipc-03': 39 },
  { time: '04:00', 'minipc-01': 63, 'minipc-02': 48, 'minipc-03': 38 },
  { time: '06:00', 'minipc-01': 66, 'minipc-02': 51, 'minipc-03': 41 },
  { time: '08:00', 'minipc-01': 70, 'minipc-02': 54, 'minipc-03': 44 },
  { time: '10:00', 'minipc-01': 72, 'minipc-02': 56, 'minipc-03': 45 },
  { time: '12:00', 'minipc-01': 68, 'minipc-02': 52, 'minipc-03': 42 },
  { time: '14:00', 'minipc-01': 69, 'minipc-02': 53, 'minipc-03': 43 },
  { time: '16:00', 'minipc-01': 71, 'minipc-02': 55, 'minipc-03': 44 },
  { time: '18:00', 'minipc-01': 70, 'minipc-02': 54, 'minipc-03': 43 },
  { time: '20:00', 'minipc-01': 68, 'minipc-02': 52, 'minipc-03': 42 },
  { time: '22:00', 'minipc-01': 67, 'minipc-02': 51, 'minipc-03': 41 },
  { time: 'Now', 'minipc-01': 69, 'minipc-02': 52, 'minipc-03': 42 },
]

// Network traffic (last 24 hours)
export const networkTraffic = [
  { time: '00:00', in: 1.2, out: 0.8 },
  { time: '02:00', in: 0.9, out: 0.6 },
  { time: '04:00', in: 0.7, out: 0.5 },
  { time: '06:00', in: 1.5, out: 1.0 },
  { time: '08:00', in: 2.8, out: 1.8 },
  { time: '10:00', in: 3.2, out: 2.1 },
  { time: '12:00', in: 2.5, out: 1.6 },
  { time: '14:00', in: 3.0, out: 2.0 },
  { time: '16:00', in: 3.5, out: 2.3 },
  { time: '18:00', in: 4.2, out: 2.8 },
  { time: '20:00', in: 3.8, out: 2.5 },
  { time: '22:00', in: 2.2, out: 1.4 },
  { time: 'Now', in: 2.8, out: 1.8 },
]

// Service downtime history
export const downtimeHistory: ServiceDowntime[] = [
  {
    service: 'postgres',
    start: '2024-10-15 14:23:00',
    end: '2024-10-15 14:31:00',
    duration: '8m',
    reason: 'Planned maintenance',
  },
  {
    service: 'nginx',
    start: '2024-10-12 09:15:00',
    end: '2024-10-12 09:18:00',
    duration: '3m',
    reason: 'Configuration update',
  },
  {
    service: 'jellyfin',
    start: '2024-10-08 22:45:00',
    end: '2024-10-08 23:02:00',
    duration: '17m',
    reason: 'Unexpected restart',
  },
]

// Network topology
export interface NetworkNode {
  id: string
  name: string
  type: 'gateway' | 'node' | 'service' | 'external'
  connections: string[]
  color?: string
}

export const networkTopology: NetworkNode[] = [
  {
    id: 'fpt',
    name: 'FPT Internet',
    type: 'external',
    connections: ['router'],
    color: '#ff6b6b',
  },
  {
    id: 'router',
    name: 'Home Router',
    type: 'gateway',
    connections: ['tailscale', 'cloudflare', 'minipc-01', 'minipc-02', 'minipc-03'],
    color: '#4dabf7',
  },
  {
    id: 'tailscale',
    name: 'Tailscale VPN',
    type: 'service',
    connections: ['router'],
    color: '#a8d5ba',
  },
  {
    id: 'cloudflare',
    name: 'Cloudflare Tunnel',
    type: 'service',
    connections: ['router'],
    color: '#f0d9a8',
  },
  {
    id: 'minipc-01',
    name: 'minipc-01',
    type: 'node',
    connections: ['router'],
    color: '#c5c5ff',
  },
  {
    id: 'minipc-02',
    name: 'minipc-02',
    type: 'node',
    connections: ['router'],
    color: '#c5c5ff',
  },
  {
    id: 'minipc-03',
    name: 'minipc-03',
    type: 'node',
    connections: ['router'],
    color: '#c5c5ff',
  },
]

// Cluster summary stats
export const clusterStats = {
  totalNodes: nodes.length,
  onlineNodes: nodes.filter((n) => n.status === 'online').length,
  totalServices: services.length,
  runningServices: services.filter((s) => s.status === 'running').length,
  avgCpu: nodes.reduce((acc, n) => acc + n.cpu, 0) / nodes.length,
  avgMemory: nodes.reduce((acc, n) => acc + n.memory, 0) / nodes.length,
  totalMemory: nodes.reduce((acc, n) => acc + n.memoryTotal, 0),
  usedMemory: nodes.reduce((acc, n) => acc + n.memoryUsed, 0),
}

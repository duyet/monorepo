/**
 * Mock data for homelab cluster dashboard
 * Dynamically generated at build time for realistic demo data
 */

export interface Node {
  id: string
  name: string
  ip: string
  status: 'online' | 'offline' | 'degraded'
  type: 'minipc' | 'raspberry-pi' | 'banana-board'
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

export interface NetworkSpeedTest {
  download: number // Mbps
  upload: number // Mbps
  ping: number // ms
  timestamp: string
}

export interface ServiceDowntime {
  service: string
  start: string
  end: string
  duration: string
  reason: string
}

// Helper function to generate random value within range
const random = (min: number, max: number) => Math.random() * (max - min) + min

// Helper function to generate uptime string
const generateUptime = () => {
  const days = Math.floor(random(20, 30))
  const hours = Math.floor(random(0, 24))
  const minutes = Math.floor(random(0, 60))
  return `${days}d ${hours}h ${minutes}m`
}

// Generate timestamp for historical data
const getHistoricalTime = (hoursAgo: number) => {
  const d = new Date()
  d.setHours(d.getHours() - hoursAgo)
  return d.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
}

// Generate 5 nodes with dynamic data (microk8s cluster)
export const nodes: Node[] = [
  {
    id: 'node-1',
    name: 'minipc-01',
    ip: '192.168.1.101',
    status: 'online',
    type: 'minipc',
    cpu: Number(random(40, 55).toFixed(1)),
    memory: Number(random(65, 75).toFixed(1)),
    memoryUsed: Number(random(10, 12).toFixed(2)),
    memoryTotal: 16,
    uptime: generateUptime(),
    services: 3,
  },
  {
    id: 'node-2',
    name: 'minipc-02',
    ip: '192.168.1.102',
    status: 'online',
    type: 'minipc',
    cpu: Number(random(28, 38).toFixed(1)),
    memory: Number(random(48, 58).toFixed(1)),
    memoryUsed: Number(random(7.5, 9.5).toFixed(2)),
    memoryTotal: 16,
    uptime: generateUptime(),
    services: 3,
  },
  {
    id: 'node-3',
    name: 'minipc-03',
    ip: '192.168.1.103',
    status: 'online',
    type: 'minipc',
    cpu: Number(random(25, 35).toFixed(1)),
    memory: Number(random(38, 48).toFixed(1)),
    memoryUsed: Number(random(6, 8).toFixed(2)),
    memoryTotal: 16,
    uptime: generateUptime(),
    services: 3,
  },
  {
    id: 'node-4',
    name: 'rp-01',
    ip: '192.168.1.104',
    status: 'online',
    type: 'raspberry-pi',
    cpu: Number(random(15, 25).toFixed(1)),
    memory: Number(random(35, 45).toFixed(1)),
    memoryUsed: Number(random(2.8, 3.6).toFixed(2)),
    memoryTotal: 8,
    uptime: generateUptime(),
    services: 2,
  },
  {
    id: 'node-5',
    name: 'dienquangsmart',
    ip: '192.168.1.105',
    status: 'online',
    type: 'banana-board',
    cpu: Number(random(20, 30).toFixed(1)),
    memory: Number(random(40, 50).toFixed(1)),
    memoryUsed: Number(random(1.6, 2).toFixed(2)),
    memoryTotal: 4,
    uptime: generateUptime(),
    services: 1,
  },
]

// Generate running services with dynamic CPU/Memory
const serviceConfigs = [
  { name: 'traefik', node: 'minipc-01', port: 80, cpuRange: [1.5, 2.5], memRange: [200, 300] },
  {
    name: 'portainer',
    node: 'minipc-01',
    port: 9000,
    cpuRange: [1, 2],
    memRange: [400, 600],
  },
  {
    name: 'prometheus',
    node: 'minipc-01',
    port: 9090,
    cpuRange: [2.5, 4],
    memRange: [800, 1200],
  },
  {
    name: 'postgres',
    node: 'minipc-02',
    port: 5432,
    cpuRange: [7, 10],
    memRange: [1800, 2300],
  },
  { name: 'redis', node: 'minipc-02', port: 6379, cpuRange: [0.8, 1.6], memRange: [400, 600] },
  {
    name: 'clickhouse',
    node: 'minipc-02',
    port: 8123,
    cpuRange: [5, 8],
    memRange: [1500, 2000],
  },
  { name: 'minio', node: 'minipc-03', port: 9001, cpuRange: [2, 3.5], memRange: [800, 1300] },
  {
    name: 'home-assistant',
    node: 'minipc-03',
    port: 8123,
    cpuRange: [3, 5],
    memRange: [600, 900],
  },
  {
    name: 'clickhouse-monitoring-ui',
    node: 'minipc-03',
    port: 3000,
    cpuRange: [1.5, 2.5],
    memRange: [300, 500],
  },
  { name: 'pihole', node: 'rp-01', port: 53, cpuRange: [0.5, 1.2], memRange: [200, 350] },
  {
    name: 'grafana',
    node: 'rp-01',
    port: 3001,
    cpuRange: [2, 3.5],
    memRange: [400, 600],
  },
  {
    name: 'node-exporter',
    node: 'dienquangsmart',
    port: 9100,
    cpuRange: [0.3, 0.8],
    memRange: [100, 200],
  },
]

export const services: Service[] = serviceConfigs.map((config) => ({
  name: config.name,
  status: 'running' as const,
  node: config.node,
  port: config.port,
  uptime: generateUptime(),
  cpu: Number(random(config.cpuRange[0], config.cpuRange[1]).toFixed(1)),
  memory: Math.floor(random(config.memRange[0], config.memRange[1])),
}))

// Generate historical CPU data (last 24 hours) with realistic patterns
const generateCpuData = (baseLoad: number, variance: number) => {
  return [
    {
      time: getHistoricalTime(24),
      'minipc-01': baseLoad - variance,
      'minipc-02': baseLoad - variance - 5,
      'minipc-03': baseLoad - variance - 8,
    },
    {
      time: getHistoricalTime(22),
      'minipc-01': baseLoad - variance + 2,
      'minipc-02': baseLoad - variance - 3,
      'minipc-03': baseLoad - variance - 6,
    },
    {
      time: getHistoricalTime(20),
      'minipc-01': baseLoad - variance + 5,
      'minipc-02': baseLoad - variance,
      'minipc-03': baseLoad - variance - 4,
    },
    {
      time: getHistoricalTime(18),
      'minipc-01': baseLoad + 3,
      'minipc-02': baseLoad,
      'minipc-03': baseLoad - 3,
    },
    {
      time: getHistoricalTime(16),
      'minipc-01': baseLoad + 8,
      'minipc-02': baseLoad + 5,
      'minipc-03': baseLoad + 2,
    },
    {
      time: getHistoricalTime(14),
      'minipc-01': baseLoad + 12,
      'minipc-02': baseLoad + 8,
      'minipc-03': baseLoad + 5,
    },
    {
      time: getHistoricalTime(12),
      'minipc-01': baseLoad + 5,
      'minipc-02': baseLoad + 2,
      'minipc-03': baseLoad,
    },
    {
      time: getHistoricalTime(10),
      'minipc-01': baseLoad + 8,
      'minipc-02': baseLoad + 5,
      'minipc-03': baseLoad + 3,
    },
    {
      time: getHistoricalTime(8),
      'minipc-01': baseLoad + 15,
      'minipc-02': baseLoad + 12,
      'minipc-03': baseLoad + 8,
    },
    {
      time: getHistoricalTime(6),
      'minipc-01': baseLoad + 8,
      'minipc-02': baseLoad + 5,
      'minipc-03': baseLoad + 2,
    },
    {
      time: getHistoricalTime(4),
      'minipc-01': baseLoad + 2,
      'minipc-02': baseLoad,
      'minipc-03': baseLoad - 2,
    },
    {
      time: getHistoricalTime(2),
      'minipc-01': baseLoad,
      'minipc-02': baseLoad - 2,
      'minipc-03': baseLoad - 4,
    },
    {
      time: 'Now',
      'minipc-01': nodes[0].cpu,
      'minipc-02': nodes[1].cpu,
      'minipc-03': nodes[2].cpu,
    },
  ]
}

export const cpuHistory = generateCpuData(40, 10)

// Generate historical Memory data with realistic patterns
const generateMemoryData = (baseLoad: number, variance: number) => {
  return [
    {
      time: getHistoricalTime(24),
      'minipc-01': baseLoad - variance,
      'minipc-02': baseLoad - variance - 2,
      'minipc-03': baseLoad - variance - 2,
    },
    {
      time: getHistoricalTime(22),
      'minipc-01': baseLoad - variance + 1,
      'minipc-02': baseLoad - variance - 1,
      'minipc-03': baseLoad - variance - 1,
    },
    {
      time: getHistoricalTime(20),
      'minipc-01': baseLoad - variance + 2,
      'minipc-02': baseLoad - variance,
      'minipc-03': baseLoad - variance,
    },
    {
      time: getHistoricalTime(18),
      'minipc-01': baseLoad + 1,
      'minipc-02': baseLoad,
      'minipc-03': baseLoad,
    },
    {
      time: getHistoricalTime(16),
      'minipc-01': baseLoad + 4,
      'minipc-02': baseLoad + 2,
      'minipc-03': baseLoad + 2,
    },
    {
      time: getHistoricalTime(14),
      'minipc-01': baseLoad + 6,
      'minipc-02': baseLoad + 4,
      'minipc-03': baseLoad + 3,
    },
    {
      time: getHistoricalTime(12),
      'minipc-01': baseLoad + 2,
      'minipc-02': baseLoad + 1,
      'minipc-03': baseLoad,
    },
    {
      time: getHistoricalTime(10),
      'minipc-01': baseLoad + 3,
      'minipc-02': baseLoad + 2,
      'minipc-03': baseLoad + 1,
    },
    {
      time: getHistoricalTime(8),
      'minipc-01': baseLoad + 5,
      'minipc-02': baseLoad + 4,
      'minipc-03': baseLoad + 3,
    },
    {
      time: getHistoricalTime(6),
      'minipc-01': baseLoad + 4,
      'minipc-02': baseLoad + 3,
      'minipc-03': baseLoad + 2,
    },
    {
      time: getHistoricalTime(4),
      'minipc-01': baseLoad + 2,
      'minipc-02': baseLoad + 1,
      'minipc-03': baseLoad + 1,
    },
    {
      time: getHistoricalTime(2),
      'minipc-01': baseLoad + 1,
      'minipc-02': baseLoad,
      'minipc-03': baseLoad,
    },
    {
      time: 'Now',
      'minipc-01': nodes[0].memory,
      'minipc-02': nodes[1].memory,
      'minipc-03': nodes[2].memory,
    },
  ]
}

export const memoryHistory = generateMemoryData(65, 5)

// Generate network traffic with realistic patterns
const generateNetworkTraffic = () => {
  return [
    { time: getHistoricalTime(24), in: random(0.8, 1.5), out: random(0.5, 1.0) },
    { time: getHistoricalTime(22), in: random(0.6, 1.2), out: random(0.4, 0.8) },
    { time: getHistoricalTime(20), in: random(0.5, 1.0), out: random(0.3, 0.7) },
    { time: getHistoricalTime(18), in: random(1.2, 2.0), out: random(0.8, 1.3) },
    { time: getHistoricalTime(16), in: random(2.5, 3.5), out: random(1.6, 2.3) },
    { time: getHistoricalTime(14), in: random(2.8, 3.8), out: random(1.8, 2.5) },
    { time: getHistoricalTime(12), in: random(2.2, 3.0), out: random(1.4, 2.0) },
    { time: getHistoricalTime(10), in: random(2.6, 3.4), out: random(1.7, 2.3) },
    { time: getHistoricalTime(8), in: random(3.0, 4.0), out: random(2.0, 2.8) },
    { time: getHistoricalTime(6), in: random(3.5, 4.5), out: random(2.3, 3.0) },
    { time: getHistoricalTime(4), in: random(3.2, 4.0), out: random(2.1, 2.7) },
    { time: getHistoricalTime(2), in: random(1.8, 2.8), out: random(1.2, 1.8) },
    { time: 'Now', in: random(2.5, 3.5), out: random(1.6, 2.3) },
  ].map((item) => ({
    ...item,
    in: Number(item.in.toFixed(1)),
    out: Number(item.out.toFixed(1)),
  }))
}

export const networkTraffic = generateNetworkTraffic()

// Generate speedtest data
export const speedTest: NetworkSpeedTest = {
  download: Number(random(180, 220).toFixed(1)),
  upload: Number(random(80, 100).toFixed(1)),
  ping: Number(random(8, 15).toFixed(1)),
  timestamp: new Date().toLocaleString(),
}

// Generate recent downtime incidents (dynamically dated)
const generateDowntimeHistory = (): ServiceDowntime[] => {
  const now = new Date()
  const incidents: ServiceDowntime[] = []

  // Incident 1: 7 days ago
  const incident1Start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  incident1Start.setHours(14, 23, 0)
  const incident1End = new Date(incident1Start.getTime() + 8 * 60 * 1000)
  incidents.push({
    service: 'postgres',
    start: incident1Start.toLocaleString(),
    end: incident1End.toLocaleString(),
    duration: '8m',
    reason: 'Planned maintenance',
  })

  // Incident 2: 10 days ago
  const incident2Start = new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000)
  incident2Start.setHours(9, 15, 0)
  const incident2End = new Date(incident2Start.getTime() + 3 * 60 * 1000)
  incidents.push({
    service: 'clickhouse',
    start: incident2Start.toLocaleString(),
    end: incident2End.toLocaleString(),
    duration: '3m',
    reason: 'Configuration update',
  })

  // Incident 3: 15 days ago
  const incident3Start = new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000)
  incident3Start.setHours(22, 45, 0)
  const incident3End = new Date(incident3Start.getTime() + 17 * 60 * 1000)
  incidents.push({
    service: 'home-assistant',
    start: incident3Start.toLocaleString(),
    end: incident3End.toLocaleString(),
    duration: '17m',
    reason: 'Unexpected restart',
  })

  return incidents
}

export const downtimeHistory = generateDowntimeHistory()

// Cluster summary stats (computed from nodes)
export const clusterStats = {
  totalNodes: nodes.length,
  onlineNodes: nodes.filter((n) => n.status === 'online').length,
  totalServices: services.length,
  runningServices: services.filter((s) => s.status === 'running').length,
  avgCpu: Number((nodes.reduce((acc, n) => acc + n.cpu, 0) / nodes.length).toFixed(1)),
  avgMemory: Number((nodes.reduce((acc, n) => acc + n.memory, 0) / nodes.length).toFixed(1)),
  totalMemory: nodes.reduce((acc, n) => acc + n.memoryTotal, 0),
  usedMemory: Number(nodes.reduce((acc, n) => acc + n.memoryUsed, 0).toFixed(1)),
}

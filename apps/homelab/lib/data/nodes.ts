/**
 * Node mock data generation
 */

import { HISTORICAL_DATA, NODE_RESOURCE_RANGES } from "../constants";
import type { Node } from "./types";
import { generateUptime, getHistoricalTime, random } from "./utils";

/**
 * Generate 5 nodes with dynamic data (microk8s cluster)
 */
export const nodes: Node[] = [
  {
    id: "node-1",
    name: "minipc-01",
    ip: "192.168.1.110",
    status: "online",
    type: "minipc",
    cpu: Number(
      random(
        NODE_RESOURCE_RANGES.MINIPC_01.CPU.min,
        NODE_RESOURCE_RANGES.MINIPC_01.CPU.max
      ).toFixed(1)
    ),
    memory: Number(
      random(
        NODE_RESOURCE_RANGES.MINIPC_01.MEMORY.min,
        NODE_RESOURCE_RANGES.MINIPC_01.MEMORY.max
      ).toFixed(1)
    ),
    memoryUsed: Number(
      random(
        NODE_RESOURCE_RANGES.MINIPC_01.MEMORY_USED.min,
        NODE_RESOURCE_RANGES.MINIPC_01.MEMORY_USED.max
      ).toFixed(2)
    ),
    memoryTotal: 16,
    storage: 512,
    uptime: generateUptime(),
    services: 6,
  },
  {
    id: "node-2",
    name: "minipc-02",
    ip: "192.168.1.111",
    status: "online",
    type: "minipc",
    cpu: Number(
      random(
        NODE_RESOURCE_RANGES.MINIPC_02.CPU.min,
        NODE_RESOURCE_RANGES.MINIPC_02.CPU.max
      ).toFixed(1)
    ),
    memory: Number(
      random(
        NODE_RESOURCE_RANGES.MINIPC_02.MEMORY.min,
        NODE_RESOURCE_RANGES.MINIPC_02.MEMORY.max
      ).toFixed(1)
    ),
    memoryUsed: Number(
      random(
        NODE_RESOURCE_RANGES.MINIPC_02.MEMORY_USED.min,
        NODE_RESOURCE_RANGES.MINIPC_02.MEMORY_USED.max
      ).toFixed(2)
    ),
    memoryTotal: 16,
    storage: 512,
    uptime: generateUptime(),
    services: 7,
  },
  {
    id: "node-3",
    name: "minipc-03",
    ip: "192.168.1.112",
    status: "offline",
    type: "minipc",
    cpu: 0,
    memory: 0,
    memoryUsed: 0,
    memoryTotal: 16,
    storage: 512,
    uptime: "0d 0h 0m",
    services: 0,
  },
  {
    id: "node-4",
    name: "rp-01",
    ip: "192.168.1.120",
    status: "online",
    type: "raspberry-pi",
    cpu: Number(
      random(
        NODE_RESOURCE_RANGES.RASPBERRY_PI.CPU.min,
        NODE_RESOURCE_RANGES.RASPBERRY_PI.CPU.max
      ).toFixed(1)
    ),
    memory: Number(
      random(
        NODE_RESOURCE_RANGES.RASPBERRY_PI.MEMORY.min,
        NODE_RESOURCE_RANGES.RASPBERRY_PI.MEMORY.max
      ).toFixed(1)
    ),
    memoryUsed: Number(
      random(
        NODE_RESOURCE_RANGES.RASPBERRY_PI.MEMORY_USED.min,
        NODE_RESOURCE_RANGES.RASPBERRY_PI.MEMORY_USED.max
      ).toFixed(2)
    ),
    memoryTotal: 8,
    storage: 128,
    uptime: generateUptime(),
    services: 3,
  },
  {
    id: "node-5",
    name: "dienquangsmart",
    ip: "192.168.1.130",
    status: "online",
    type: "banana-board",
    cpu: Number(
      random(
        NODE_RESOURCE_RANGES.BANANA_BOARD.CPU.min,
        NODE_RESOURCE_RANGES.BANANA_BOARD.CPU.max
      ).toFixed(1)
    ),
    memory: Number(
      random(
        NODE_RESOURCE_RANGES.BANANA_BOARD.MEMORY.min,
        NODE_RESOURCE_RANGES.BANANA_BOARD.MEMORY.max
      ).toFixed(1)
    ),
    memoryUsed: Number(
      random(
        NODE_RESOURCE_RANGES.BANANA_BOARD.MEMORY_USED.min,
        NODE_RESOURCE_RANGES.BANANA_BOARD.MEMORY_USED.max
      ).toFixed(2)
    ),
    memoryTotal: 4,
    storage: 64,
    uptime: generateUptime(),
    services: 1,
  },
];

/**
 * Generate historical CPU data (last 24 hours) with realistic patterns
 */
const generateCpuData = (baseLoad: number, variance: number) => {
  return [
    {
      time: getHistoricalTime(24),
      "minipc-01": baseLoad - variance,
      "minipc-02": baseLoad - variance - 5,
      "minipc-03": 0,
    },
    {
      time: getHistoricalTime(22),
      "minipc-01": baseLoad - variance + 2,
      "minipc-02": baseLoad - variance - 3,
      "minipc-03": 0,
    },
    {
      time: getHistoricalTime(20),
      "minipc-01": baseLoad - variance + 5,
      "minipc-02": baseLoad - variance,
      "minipc-03": 0,
    },
    {
      time: getHistoricalTime(18),
      "minipc-01": baseLoad + 3,
      "minipc-02": baseLoad,
      "minipc-03": 0,
    },
    {
      time: getHistoricalTime(16),
      "minipc-01": baseLoad + 8,
      "minipc-02": baseLoad + 5,
      "minipc-03": 0,
    },
    {
      time: getHistoricalTime(14),
      "minipc-01": baseLoad + 12,
      "minipc-02": baseLoad + 8,
      "minipc-03": 0,
    },
    {
      time: getHistoricalTime(12),
      "minipc-01": baseLoad + 5,
      "minipc-02": baseLoad + 2,
      "minipc-03": 0,
    },
    {
      time: getHistoricalTime(10),
      "minipc-01": baseLoad + 8,
      "minipc-02": baseLoad + 5,
      "minipc-03": 0,
    },
    {
      time: getHistoricalTime(8),
      "minipc-01": baseLoad + 15,
      "minipc-02": baseLoad + 12,
      "minipc-03": 0,
    },
    {
      time: getHistoricalTime(6),
      "minipc-01": baseLoad + 8,
      "minipc-02": baseLoad + 5,
      "minipc-03": 0,
    },
    {
      time: getHistoricalTime(4),
      "minipc-01": baseLoad + 2,
      "minipc-02": baseLoad,
      "minipc-03": 0,
    },
    {
      time: getHistoricalTime(2),
      "minipc-01": baseLoad,
      "minipc-02": baseLoad - 2,
      "minipc-03": 0,
    },
    {
      time: "Now",
      "minipc-01": nodes[0].cpu,
      "minipc-02": nodes[1].cpu,
      "minipc-03": 0,
    },
  ];
};

export const cpuHistory = generateCpuData(
  HISTORICAL_DATA.CPU.BASE_LOAD,
  HISTORICAL_DATA.CPU.VARIANCE
);

/**
 * Generate historical Memory data with realistic patterns
 */
const generateMemoryData = (baseLoad: number, variance: number) => {
  return [
    {
      time: getHistoricalTime(24),
      "minipc-01": baseLoad - variance,
      "minipc-02": baseLoad - variance - 2,
      "minipc-03": 0,
    },
    {
      time: getHistoricalTime(22),
      "minipc-01": baseLoad - variance + 1,
      "minipc-02": baseLoad - variance - 1,
      "minipc-03": 0,
    },
    {
      time: getHistoricalTime(20),
      "minipc-01": baseLoad - variance + 2,
      "minipc-02": baseLoad - variance,
      "minipc-03": 0,
    },
    {
      time: getHistoricalTime(18),
      "minipc-01": baseLoad + 1,
      "minipc-02": baseLoad,
      "minipc-03": 0,
    },
    {
      time: getHistoricalTime(16),
      "minipc-01": baseLoad + 4,
      "minipc-02": baseLoad + 2,
      "minipc-03": 0,
    },
    {
      time: getHistoricalTime(14),
      "minipc-01": baseLoad + 6,
      "minipc-02": baseLoad + 4,
      "minipc-03": 0,
    },
    {
      time: getHistoricalTime(12),
      "minipc-01": baseLoad + 2,
      "minipc-02": baseLoad + 1,
      "minipc-03": 0,
    },
    {
      time: getHistoricalTime(10),
      "minipc-01": baseLoad + 3,
      "minipc-02": baseLoad + 2,
      "minipc-03": 0,
    },
    {
      time: getHistoricalTime(8),
      "minipc-01": baseLoad + 5,
      "minipc-02": baseLoad + 4,
      "minipc-03": 0,
    },
    {
      time: getHistoricalTime(6),
      "minipc-01": baseLoad + 4,
      "minipc-02": baseLoad + 3,
      "minipc-03": 0,
    },
    {
      time: getHistoricalTime(4),
      "minipc-01": baseLoad + 2,
      "minipc-02": baseLoad + 1,
      "minipc-03": 0,
    },
    {
      time: getHistoricalTime(2),
      "minipc-01": baseLoad + 1,
      "minipc-02": baseLoad,
      "minipc-03": 0,
    },
    {
      time: "Now",
      "minipc-01": nodes[0].memory,
      "minipc-02": nodes[1].memory,
      "minipc-03": 0,
    },
  ];
};

export const memoryHistory = generateMemoryData(
  HISTORICAL_DATA.MEMORY.BASE_LOAD,
  HISTORICAL_DATA.MEMORY.VARIANCE
);

/**
 * Cluster summary stats (computed from nodes)
 */
export const clusterStats = {
  totalNodes: nodes.length,
  onlineNodes: nodes.filter((n) => n.status === "online").length,
  totalServices: nodes.reduce((acc, n) => acc + n.services, 0),
  runningServices: nodes.reduce((acc, n) => acc + n.services, 0),
  avgCpu: Number(
    (nodes.reduce((acc, n) => acc + n.cpu, 0) / nodes.length).toFixed(1)
  ),
  avgMemory: Number(
    (nodes.reduce((acc, n) => acc + n.memory, 0) / nodes.length).toFixed(1)
  ),
  totalMemory: nodes.reduce((acc, n) => acc + n.memoryTotal, 0),
  usedMemory: Number(
    nodes.reduce((acc, n) => acc + n.memoryUsed, 0).toFixed(1)
  ),
  totalStorage: nodes.reduce((acc, n) => acc + n.storage, 0), // in GB
};

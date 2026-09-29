/**
 * Node mock data generation
 */

import {
  HISTORICAL_DATA,
  NODE_RESOURCE_RANGES,
  TIME_POINTS,
} from "../constants";
import type { ClusterInfo, Node } from "./types";
import { generateUptime, getHistoricalTime, random } from "./utils";

type ResourceRange =
  (typeof NODE_RESOURCE_RANGES)[keyof typeof NODE_RESOURCE_RANGES];

/** Round a random draw from `range` to `decimals` places. */
const ranged = (
  range: { min: number; max: number },
  decimals: number
): number => Number(random(range.min, range.max).toFixed(decimals));

/**
 * Build an online node, drawing cpu/memory/memoryUsed from the device's
 * resource range in `NODE_RESOURCE_RANGES`.
 */
const onlineNode = (
  base: Omit<Node, "cpu" | "memory" | "memoryUsed" | "uptime">,
  ranges: ResourceRange
): Node => ({
  ...base,
  cpu: ranged(ranges.CPU, 1),
  memory: ranged(ranges.MEMORY, 1),
  memoryUsed: ranged(ranges.MEMORY_USED, 2),
  uptime: generateUptime(),
});

/** An offline node reports no load and no uptime. */
const offlineNode = (
  base: Omit<Node, "cpu" | "memory" | "memoryUsed" | "uptime">
): Node => ({
  ...base,
  cpu: 0,
  memory: 0,
  memoryUsed: 0,
  uptime: "0d 0h 0m",
});

/**
 * Cluster nodes with dynamic resource data
 */
export const nodes: Node[] = [
  onlineNode(
    {
      id: "node-1",
      name: "minipc-01",
      ip: "192.168.1.110",
      status: "online",
      type: "minipc",
      memoryTotal: 16,
      storage: 2560,
      services: 6,
    },
    NODE_RESOURCE_RANGES.MINIPC_01
  ),
  onlineNode(
    {
      id: "node-2",
      name: "minipc-02",
      ip: "192.168.1.111",
      status: "online",
      type: "minipc",
      memoryTotal: 16,
      storage: 2560,
      services: 7,
    },
    NODE_RESOURCE_RANGES.MINIPC_02
  ),
  offlineNode({
    id: "node-3",
    name: "minipc-03",
    ip: "192.168.1.112",
    status: "offline",
    type: "minipc",
    memoryTotal: 16,
    storage: 1024,
    services: 0,
  }),
  onlineNode(
    {
      id: "node-4",
      name: "rp-01",
      ip: "192.168.1.120",
      status: "online",
      type: "raspberry-pi",
      memoryTotal: 8,
      storage: 512,
      services: 3,
    },
    NODE_RESOURCE_RANGES.RASPBERRY_PI
  ),
  onlineNode(
    {
      id: "node-5",
      name: "dienquangsmart",
      ip: "192.168.1.130",
      status: "online",
      type: "banana-board",
      memoryTotal: 4,
      storage: 512,
      services: 1,
    },
    NODE_RESOURCE_RANGES.BANANA_BOARD
  ),
  offlineNode({
    id: "node-6",
    name: "openclaw",
    ip: "192.168.1.140",
    status: "offline",
    type: "server",
    memoryTotal: 16,
    storage: 1024,
    services: 0,
  }),
  onlineNode(
    {
      id: "node-7",
      name: "hermes-agent",
      ip: "192.168.1.150",
      status: "online",
      type: "server",
      memoryTotal: 16,
      storage: 1024,
      services: 2,
    },
    NODE_RESOURCE_RANGES.HERMES_AGENT
  ),
];

/**
 * Hours-ago labels for the 24h history series, newest last. Shared with the
 * rest of the mock data so the time axis stays consistent.
 */

/**
 * One historical sample: offsets applied to an anchor to produce each node's
 * value. When `varianced` is true the anchor is `baseLoad - variance`
 * (the low-traffic overnight period) rather than `baseLoad`.
 */
type HistoryOffset = [varianced: boolean, minipc01: number, minipc02: number];

/**
 * Build a 24h history series for the two minipcs. `minipc-03` is always
 * offline, so it is pinned at 0. The final row is the live node reading.
 */
const generateHistory = (
  baseLoad: number,
  variance: number,
  offsets: readonly HistoryOffset[],
  readCurrent: (node: Node) => number
) => [
  ...TIME_POINTS.map((hours, i) => {
    const [varianced, minipc01, minipc02] = offsets[i];
    const anchor = varianced ? baseLoad - variance : baseLoad;
    return {
      time: getHistoricalTime(hours),
      "minipc-01": anchor + minipc01,
      "minipc-02": anchor + minipc02,
      "minipc-03": 0,
    };
  }),
  {
    time: "Now",
    "minipc-01": readCurrent(nodes[0]),
    "minipc-02": readCurrent(nodes[1]),
    "minipc-03": 0,
  },
];

/**
 * Historical CPU data (last 24 hours) with realistic patterns
 */
const CPU_OFFSETS: readonly HistoryOffset[] = [
  [true, 0, -5],
  [true, 2, -3],
  [true, 5, 0],
  [false, 3, 0],
  [false, 8, 5],
  [false, 12, 8],
  [false, 5, 2],
  [false, 8, 5],
  [false, 15, 12],
  [false, 8, 5],
  [false, 2, 0],
  [false, 0, -2],
];

export const cpuHistory = generateHistory(
  HISTORICAL_DATA.CPU.BASE_LOAD,
  HISTORICAL_DATA.CPU.VARIANCE,
  CPU_OFFSETS,
  (node) => node.cpu
);

/**
 * Historical Memory data with realistic patterns
 */
const MEMORY_OFFSETS: readonly HistoryOffset[] = [
  [true, 0, -2],
  [true, 1, -1],
  [true, 2, 0],
  [false, 1, 0],
  [false, 4, 2],
  [false, 6, 4],
  [false, 2, 1],
  [false, 3, 2],
  [false, 5, 4],
  [false, 4, 3],
  [false, 2, 1],
  [false, 1, 0],
];

export const memoryHistory = generateHistory(
  HISTORICAL_DATA.MEMORY.BASE_LOAD,
  HISTORICAL_DATA.MEMORY.VARIANCE,
  MEMORY_OFFSETS,
  (node) => node.memory
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

/**
 * Kubernetes cluster info (k3s)
 */
export const clusterInfo: ClusterInfo = {
  platform: "k3s",
  version: "v1.30.5+k3s1",
  clusterName: "homelab",
  region: "home",
  nodeRoles: {
    "minipc-01": "control-plane",
    "minipc-02": "worker",
    "minipc-03": "worker",
    "rp-01": "worker",
    dienquangsmart: "worker",
    "hermes-agent": "worker",
  },
  cni: "flannel",
  csi: "local-path-provisioner",
  ingress: "traefik",
  lastUpdated: new Date().toISOString(),
};

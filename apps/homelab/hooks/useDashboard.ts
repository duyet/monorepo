/**
 * Custom React Hooks for Dashboard Data
 * Encapsulates data fetching logic and provides a clean API for components
 * Updated to use API routes instead of static imports
 */

import { useState, useEffect, useMemo, useCallback } from "react";

// Types
export interface Node {
  id: string;
  name: string;
  ip: string;
  status: "online" | "offline" | "degraded" | "maintenance";
  type: "minipc" | "raspberry-pi" | "banana-board";
  cpu: number;
  memory: number;
  memoryUsed: number;
  memoryTotal: number;
  storage: number;
  uptime: string;
  services: number;
}

export interface Service {
  name: string;
  namespace: string;
  status: "running" | "stopped" | "error";
  node: string;
  port: number;
  uptime: string;
  cpu: number;
  memory: number;
}

export interface ClusterStats {
  totalNodes: number;
  onlineNodes: number;
  totalServices: number;
  runningServices: number;
  avgCpu: number;
  avgMemory: number;
  totalMemory: number;
  usedMemory: number;
  totalStorage: number;
}

export interface NetworkTrafficPoint {
  time: string;
  in: number;
  out: number;
}

export interface NetworkSpeedTest {
  download: number;
  upload: number;
  ping: number;
  timestamp: string;
}

export interface ServiceDowntime {
  service: string;
  start: string;
  end: string;
  duration: string;
  reason: string;
}

// API response types
interface ApiResponse<T> {
  success: boolean;
  data: T;
  mockMode?: boolean;
  timestamp: string;
  error?: string;
}

/**
 * Generic fetch hook with error handling and loading state
 */
function useApiFetch<T>(url: string, interval: number = 30000, enabled: boolean = true) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mockMode, setMockMode] = useState(false);

  const fetchData = useCallback(async () => {
    if (!enabled) {
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(url);
      const result: ApiResponse<T> = await response.json();

      if (result.success && result.data) {
        setData(result.data);
        setMockMode(result.mockMode || false);
        setError(null);
      } else {
        setError(result.error || "Unknown error");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch data");
    } finally {
      setLoading(false);
    }
  }, [url, enabled]);

  useEffect(() => {
    fetchData();

    if (interval > 0) {
      const intervalId = setInterval(fetchData, interval);
      return () => clearInterval(intervalId);
    }
  }, [fetchData, interval]);

  return { data, loading, error, mockMode, refetch: fetchData };
}

/**
 * Hook for cluster node data
 */
export function useNodes() {
  const { data, loading, error, mockMode, refetch } = useApiFetch<{
    nodes: Node[];
    clusterStats: ClusterStats;
  }>("/api/nodes", 30000);

  const nodes = useMemo(() => data?.nodes || [], [data?.nodes]);
  const clusterStats = useMemo(() => data?.clusterStats, [data?.clusterStats]);

  const onlineNodes = useMemo(() => nodes.filter((n) => n.status === "online"), [nodes]);
  const offlineNodes = useMemo(() => nodes.filter((n) => n.status === "offline"), [nodes]);
  const degradedNodes = useMemo(() => nodes.filter((n) => n.status === "degraded"), [nodes]);

  return {
    nodes,
    onlineNodes,
    offlineNodes,
    degradedNodes,
    clusterStats,
    totalNodes: nodes.length,
    onlineCount: onlineNodes.length,
    loading,
    error,
    mockMode,
    refetch,
  };
}

/**
 * Hook for cluster statistics
 */
export function useClusterStats(): {
  clusterStats: ClusterStats | null;
  loading: boolean;
  error: string | null;
  mockMode: boolean;
  refetch: () => void;
} {
  const { data, loading, error, mockMode, refetch } = useApiFetch<{
    clusterStats: ClusterStats;
  }>("/api/nodes", 30000);

  return {
    clusterStats: data?.clusterStats || null,
    loading,
    error,
    mockMode,
    refetch,
  };
}

/**
 * Hook for resource metrics (CPU & Memory)
 */
export function useResourceMetrics() {
  const { data: cpuData, loading: cpuLoading, error: cpuError, refetch: cpuRefetch } = useApiFetch<{
    history: Array<Record<string, string | number>>;
  }>("/api/history?metric=cpu", 30000);

  const { data: memData, loading: memLoading, error: memError, refetch: memRefetch } = useApiFetch<{
    history: Array<Record<string, string | number>>;
  }>("/api/history?metric=memory", 30000);

  const cpuHistory = useMemo(() => cpuData?.history || [], [cpuData?.history]);
  const memoryHistory = useMemo(() => memData?.history || [], [memData?.history]);

  return {
    cpuHistory,
    memoryHistory,
    loading: cpuLoading || memLoading,
    error: cpuError || memError,
    refetch: () => {
      cpuRefetch();
      memRefetch();
    },
  };
}

/**
 * Hook for services with optional filtering
 */
export function useServices(namespace?: string) {
  const url = namespace ? `/api/services?namespace=${namespace}` : "/api/services";
  const { data, loading, error, refetch } = useApiFetch<{
    services: Service[];
    allServices: Service[];
    namespaces: string[];
    servicesByNamespace: Record<string, Service[]>;
    servicesByNode: Record<string, Service[]>;
    totalServices: number;
    runningServices: number;
  }>(url, 30000);

  const services = useMemo(() => data?.services || [], [data?.services]);
  const allServices = useMemo(() => data?.allServices || [], [data?.allServices]);
  const namespaces = useMemo(() => data?.namespaces || [], [data?.namespaces]);
  const servicesByNamespace = useMemo(() => data?.servicesByNamespace || {}, [data?.servicesByNamespace]);
  const servicesByNode = useMemo(() => data?.servicesByNode || {}, [data?.servicesByNode]);

  return {
    services,
    allServices,
    namespaces,
    servicesByNamespace,
    servicesByNode,
    totalServices: data?.totalServices || 0,
    runningServices: data?.runningServices || 0,
    loading,
    error,
    refetch,
  };
}

/**
 * Hook for network statistics
 */
export function useNetworkStats() {
  const { data, loading, error, refetch } = useApiFetch<{
    networkTraffic: NetworkTrafficPoint[];
    speedTest: NetworkSpeedTest;
  }>("/api/network", 30000);

  return {
    networkTraffic: data?.networkTraffic || [],
    speedTest: data?.speedTest || null,
    loading,
    error,
    refetch,
  };
}

/**
 * Hook for service downtime history
 */
export function useDowntimeHistory() {
  // For now, return static downtime data
  // TODO: Implement API endpoint for downtime history
  const downtimeHistory: ServiceDowntime[] = [
    {
      service: "postgres",
      start: "1/31/2025, 2:23:00 PM",
      end: "1/31/2025, 2:31:00 PM",
      duration: "8m",
      reason: "Planned maintenance",
    },
    {
      service: "clickhouse",
      start: "1/28/2025, 9:15:00 AM",
      end: "1/28/2025, 9:18:00 AM",
      duration: "3m",
      reason: "Configuration update",
    },
    {
      service: "home-assistant",
      start: "1/23/2025, 10:45:00 PM",
      end: "1/23/2025, 11:02:00 PM",
      duration: "17m",
      reason: "Unexpected restart",
    },
  ];

  return {
    downtimeHistory,
    loading: false,
    error: null,
  };
}

/**
 * Hook for searching services by name
 */
export function useServiceSearch(searchQuery: string) {
  const { allServices } = useServices();

  return useMemo(() => {
    if (!searchQuery.trim()) {
      return allServices;
    }

    const query = searchQuery.toLowerCase();
    return allServices.filter(
      (service) =>
        service.name.toLowerCase().includes(query) ||
        service.namespace.toLowerCase().includes(query) ||
        service.node.toLowerCase().includes(query)
    );
  }, [searchQuery, allServices]);
}

/**
 * Hook for getting node by name
 */
export function useNode(nodeName: string) {
  const { nodes } = useNodes();

  return useMemo(() => nodes.find((n) => n.name === nodeName), [nodeName, nodes]);
}

/**
 * Hook for getting all unique namespaces
 */
export function useNamespaces() {
  const { namespaces } = useServices();

  return namespaces;
}

/**
 * Hook for WebSocket connection (for real-time updates)
 */
export function useWebSocket(url: string) {
  const [connected, setConnected] = useState(false);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Only connect on client side
    if (typeof window === "undefined") return;

    let ws: WebSocket | null = null;
    let reconnectTimeout: NodeJS.Timeout;

    const connect = () => {
      try {
        ws = new WebSocket(url);

        ws.onopen = () => {
          setConnected(true);
          setError(null);
        };

        ws.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);
            setData(message);
          } catch (err) {
            console.error("Failed to parse WebSocket message:", err);
          }
        };

        ws.onclose = () => {
          setConnected(false);
          // Attempt to reconnect after 5 seconds
          reconnectTimeout = setTimeout(connect, 5000);
        };

        ws.onerror = (event) => {
          setError("WebSocket connection error");
          console.error("WebSocket error:", event);
        };
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to connect");
        // Retry connection after 5 seconds
        reconnectTimeout = setTimeout(connect, 5000);
      }
    };

    connect();

    return () => {
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
      }
      if (ws) {
        ws.close();
      }
    };
  }, [url]);

  return { connected, data, error };
}

/**
 * Hook for auto-refreshing data with manual control
 */
export function useAutoRefresh<T>(
  fetcher: () => Promise<T>,
  interval: number = 30000,
  enabled: boolean = true
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const refresh = useCallback(async () => {
    if (!enabled) return;

    setLoading(true);
    try {
      const result = await fetcher();
      setData(result);
      setError(null);
      setLastUpdate(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch data");
    } finally {
      setLoading(false);
    }
  }, [fetcher, enabled]);

  useEffect(() => {
    refresh();

    if (interval > 0 && enabled) {
      const intervalId = setInterval(refresh, interval);
      return () => clearInterval(intervalId);
    }
  }, [refresh, interval, enabled]);

  return { data, loading, error, lastUpdate, refresh };
}

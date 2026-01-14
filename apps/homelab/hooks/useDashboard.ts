/**
 * Custom React Hooks for Dashboard Data
 * Encapsulates data fetching logic and provides a clean API for components
 */

import { useMemo } from "react";
import {
  type ClusterStats,
  clusterStats,
  cpuHistory,
  downtimeHistory,
  memoryHistory,
  type Node,
  networkTraffic,
  nodes,
  type Service,
  services,
  speedTest,
} from "@/lib/data";

/**
 * Hook for cluster node data
 */
export function useNodes() {
  return useMemo(() => {
    const onlineNodes = nodes.filter((n) => n.status === "online");
    const offlineNodes = nodes.filter((n) => n.status === "offline");
    const degradedNodes = nodes.filter((n) => n.status === "degraded");

    return {
      nodes,
      onlineNodes,
      offlineNodes,
      degradedNodes,
      totalNodes: nodes.length,
      onlineCount: onlineNodes.length,
    };
  }, []);
}

/**
 * Hook for cluster statistics
 */
export function useClusterStats(): ClusterStats {
  return useMemo(() => clusterStats, []);
}

/**
 * Hook for resource metrics (CPU & Memory)
 */
export function useResourceMetrics() {
  return useMemo(
    () => ({
      cpuHistory,
      memoryHistory,
    }),
    []
  );
}

/**
 * Hook for services with optional filtering
 */
export function useServices(namespace?: string) {
  return useMemo(() => {
    const filteredServices = namespace
      ? services.filter((s) => s.namespace === namespace)
      : services;

    const namespaces = Array.from(
      new Set(services.map((s) => s.namespace))
    ).sort();

    const servicesByNamespace = services.reduce(
      (acc, service) => {
        if (!acc[service.namespace]) {
          acc[service.namespace] = [];
        }
        acc[service.namespace].push(service);
        return acc;
      },
      {} as Record<string, Service[]>
    );

    const servicesByNode = services.reduce(
      (acc, service) => {
        if (!acc[service.node]) {
          acc[service.node] = [];
        }
        acc[service.node].push(service);
        return acc;
      },
      {} as Record<string, Service[]>
    );

    return {
      services: filteredServices,
      allServices: services,
      namespaces,
      servicesByNamespace,
      servicesByNode,
      totalServices: services.length,
      runningServices: services.filter((s) => s.status === "running").length,
    };
  }, [namespace]);
}

/**
 * Hook for network statistics
 */
export function useNetworkStats() {
  return useMemo(
    () => ({
      networkTraffic,
      speedTest,
    }),
    []
  );
}

/**
 * Hook for service downtime history
 */
export function useDowntimeHistory() {
  return useMemo(() => downtimeHistory, []);
}

/**
 * Hook for searching services by name
 */
export function useServiceSearch(searchQuery: string) {
  return useMemo(() => {
    if (!searchQuery.trim()) {
      return services;
    }

    const query = searchQuery.toLowerCase();
    return services.filter(
      (service) =>
        service.name.toLowerCase().includes(query) ||
        service.namespace.toLowerCase().includes(query) ||
        service.node.toLowerCase().includes(query)
    );
  }, [searchQuery]);
}

/**
 * Hook for getting node by name
 */
export function useNode(nodeName: string): Node | undefined {
  return useMemo(() => nodes.find((n) => n.name === nodeName), [nodeName]);
}

/**
 * Hook for getting all unique namespaces
 */
export function useNamespaces() {
  return useMemo(() => {
    const namespaces = Array.from(
      new Set(services.map((s) => s.namespace))
    ).sort();
    return namespaces;
  }, []);
}

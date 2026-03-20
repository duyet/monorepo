import { describe, expect, it } from "bun:test";
import { clusterStats, nodes } from "../lib/data/nodes";

describe("nodes", () => {
  describe("nodes array", () => {
    it("is an array with 6 nodes", () => {
      expect(Array.isArray(nodes)).toBe(true);
      expect(nodes.length).toBe(6);
    });

    it("each node has required fields", () => {
      nodes.forEach((node) => {
        expect(node).toHaveProperty("id");
        expect(node).toHaveProperty("name");
        expect(node).toHaveProperty("ip");
        expect(node).toHaveProperty("status");
        expect(node).toHaveProperty("cpu");
        expect(node).toHaveProperty("memory");
        expect(node).toHaveProperty("memoryTotal");
        expect(node).toHaveProperty("storage");
        expect(node).toHaveProperty("uptime");
        expect(node).toHaveProperty("services");
      });
    });

    it("has unique node IDs", () => {
      const ids = nodes.map((n) => n.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(nodes.length);
    });

    it("online nodes have cpu > 0", () => {
      nodes.forEach((node) => {
        if (node.status === "online") {
          expect(node.cpu).toBeGreaterThan(0);
        }
      });
    });

    it("offline node (minipc-03) has cpu=0, memory=0, services=0", () => {
      const offlineNode = nodes.find((n) => n.name === "minipc-03");
      expect(offlineNode).toBeDefined();
      expect(offlineNode!.status).toBe("offline");
      expect(offlineNode!.cpu).toBe(0);
      expect(offlineNode!.memory).toBe(0);
      expect(offlineNode!.services).toBe(0);
    });
  });

  describe("clusterStats", () => {
    it("totalNodes equals nodes.length", () => {
      expect(clusterStats.totalNodes).toBe(nodes.length);
    });

    it("onlineNodes equals count of online nodes", () => {
      const expectedOnlineCount = nodes.filter(
        (n) => n.status === "online"
      ).length;
      expect(clusterStats.onlineNodes).toBe(expectedOnlineCount);
    });

    it("avgCpu is a valid number >= 0", () => {
      expect(typeof clusterStats.avgCpu).toBe("number");
      expect(clusterStats.avgCpu).toBeGreaterThanOrEqual(0);
    });

    it("totalStorage is sum of all node storage values", () => {
      const expectedTotal = nodes.reduce((acc, n) => acc + n.storage, 0);
      expect(clusterStats.totalStorage).toBe(expectedTotal);
    });

    it("avgMemory is a valid number >= 0", () => {
      expect(typeof clusterStats.avgMemory).toBe("number");
      expect(clusterStats.avgMemory).toBeGreaterThanOrEqual(0);
    });

    it("totalMemory is sum of all node memoryTotal values", () => {
      const expectedTotal = nodes.reduce((acc, n) => acc + n.memoryTotal, 0);
      expect(clusterStats.totalMemory).toBe(expectedTotal);
    });

    it("usedMemory is sum of all node memoryUsed values", () => {
      const expectedTotal = nodes.reduce((acc, n) => acc + n.memoryUsed, 0);
      expect(clusterStats.usedMemory).toBe(Number(expectedTotal.toFixed(1)));
    });

    it("totalServices is sum of all node services", () => {
      const expectedTotal = nodes.reduce((acc, n) => acc + n.services, 0);
      expect(clusterStats.totalServices).toBe(expectedTotal);
    });

    it("runningServices is sum of all node services", () => {
      const expectedTotal = nodes.reduce((acc, n) => acc + n.services, 0);
      expect(clusterStats.runningServices).toBe(expectedTotal);
    });
  });
});

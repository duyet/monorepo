/**
 * Next.js API Route: /api/nodes
 * Returns cluster node information with metrics
 */

import { NextResponse } from "next/server";
import { getApiClient } from "@/lib/api";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: Request) {
  try {
    const api = getApiClient();
    const nodes = await api.fetchNodes();

    // Calculate cluster stats
    const onlineNodes = nodes.filter((n) => n.status === "online").length;
    const totalServices = nodes.reduce((acc, n) => acc + n.services, 0);
    const avgCpu = nodes.reduce((acc, n) => acc + n.cpu, 0) / nodes.length;
    const avgMemory = nodes.reduce((acc, n) => acc + n.memory, 0) / nodes.length;
    const totalMemory = nodes.reduce((acc, n) => acc + n.memoryTotal, 0);
    const usedMemory = nodes.reduce((acc, n) => acc + n.memoryUsed, 0);
    const totalStorage = nodes.reduce((acc, n) => acc + n.storage, 0);

    const clusterStats = {
      totalNodes: nodes.length,
      onlineNodes,
      totalServices,
      runningServices: totalServices,
      avgCpu: Number(avgCpu.toFixed(1)),
      avgMemory: Number(avgMemory.toFixed(1)),
      totalMemory,
      usedMemory: Number(usedMemory.toFixed(1)),
      totalStorage,
    };

    return NextResponse.json({
      success: true,
      data: {
        nodes,
        clusterStats,
      },
      mockMode: api.isMockMode(),
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error fetching nodes:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch node data",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

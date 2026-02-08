/**
 * Next.js API Route: /api/network
 * Returns network traffic data
 */

import { NextResponse } from "next/server";
import { getApiClient } from "@/lib/api";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const hours = parseInt(searchParams.get("hours") || "24", 10);

    const api = getApiClient();
    const networkTraffic = await api.fetchNetworkTraffic(hours);

    // Generate speed test data
    const speedTest = {
      download: Number(Math.random() * (220 - 180) + 180).toFixed(1),
      upload: Number(Math.random() * (100 - 80) + 80).toFixed(1),
      ping: Number(Math.random() * (15 - 8) + 8).toFixed(1),
      timestamp: new Date().toLocaleString(),
    };

    return NextResponse.json({
      success: true,
      data: {
        networkTraffic,
        speedTest,
      },
      mockMode: api.isMockMode(),
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error fetching network data:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch network data",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

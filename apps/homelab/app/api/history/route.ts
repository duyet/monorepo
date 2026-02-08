/**
 * Next.js API Route: /api/history
 * Returns historical metrics data (CPU & Memory)
 */

import { NextResponse } from "next/server";
import { getApiClient } from "@/lib/api";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const metric = (searchParams.get("metric") || "cpu") as "cpu" | "memory";
    const hours = parseInt(searchParams.get("hours") || "24", 10);

    const api = getApiClient();
    const history = await api.fetchHistoricalData(metric, hours);

    return NextResponse.json({
      success: true,
      data: {
        metric,
        history,
      },
      mockMode: api.isMockMode(),
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error fetching historical data:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch historical data",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

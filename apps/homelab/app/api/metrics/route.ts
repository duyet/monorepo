/**
 * Next.js API Route: /api/metrics
 * Returns current cluster metrics (nodes, services, network)
 */

import { NextResponse } from "next/server";
import { getApiClient } from "@/lib/api";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(_request: Request) {
  try {
    const api = getApiClient();
    const data = await api.fetchDashboardData();

    return NextResponse.json({
      success: true,
      data,
      mockMode: api.isMockMode(),
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error fetching metrics:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch metrics",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

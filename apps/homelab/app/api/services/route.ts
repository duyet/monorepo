/**
 * Next.js API Route: /api/services
 * Returns service information with metrics
 */

import { NextResponse } from "next/server";
import { getApiClient } from "@/lib/api";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const namespace = searchParams.get("namespace");

    const api = getApiClient();
    const services = await api.fetchServices();

    let filteredServices = services;
    if (namespace) {
      filteredServices = services.filter((s) => s.namespace === namespace);
    }

    // Calculate stats
    const namespaces = Array.from(new Set(services.map((s) => s.namespace))).sort();
    const servicesByNamespace = services.reduce((acc, service) => {
      if (!acc[service.namespace]) {
        acc[service.namespace] = [];
      }
      acc[service.namespace].push(service);
      return acc;
    }, {} as Record<string, typeof services>);

    const servicesByNode = services.reduce((acc, service) => {
      if (!acc[service.node]) {
        acc[service.node] = [];
      }
      acc[service.node].push(service);
      return acc;
    }, {} as Record<string, typeof services>);

    return NextResponse.json({
      success: true,
      data: {
        services: filteredServices,
        allServices: services,
        namespaces,
        servicesByNamespace,
        servicesByNode,
        totalServices: services.length,
        runningServices: services.filter((s) => s.status === "running").length,
      },
      mockMode: api.isMockMode(),
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error fetching services:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch service data",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

import type { NextRequest } from "next/server";
import { createPingRoute } from "@duyet/libs/next-routes";

const pingRoute = createPingRoute();

export const GET = (_request: NextRequest): Response => pingRoute.GET();
export const dynamic = pingRoute.dynamic;

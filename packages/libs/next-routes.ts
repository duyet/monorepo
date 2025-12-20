/**
 * Shared Next.js route handlers for common endpoints across apps
 */

import { NextResponse } from "next/server";

/**
 * Create a standard ping/health check route handler
 * Returns { status: 'ok' } with 1 hour cache
 *
 * @example
 * ```ts
 * // app/ping/route.ts
 * export const { GET, dynamic } = createPingRoute()
 * ```
 */
export function createPingRoute() {
  const GET = (): NextResponse => {
    return NextResponse.json(
      { status: "ok" },
      {
        headers: {
          "Cache-Control": "public, max-age=3600, s-maxage=3600",
        },
      }
    );
  };

  return {
    GET,
    dynamic: "force-static" as const,
  };
}

/**
 * Create an llms.txt route handler with custom content
 *
 * @param content - The text content to serve at /llms.txt
 * @param options - Optional configuration
 * @param options.cacheMaxAge - Cache duration in seconds (default: 3600)
 *
 * @example
 * ```ts
 * // app/llms.txt/route.ts
 * export const { GET, dynamic } = createLlmsTxtRoute(`
 * # My App
 * Description...
 * `)
 * ```
 */
export function createLlmsTxtRoute(
  content: string,
  options: { cacheMaxAge?: number } = {}
) {
  const { cacheMaxAge = 3600 } = options;

  const GET = (): NextResponse => {
    return new NextResponse(content.trim(), {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": `public, max-age=${cacheMaxAge}, s-maxage=${cacheMaxAge}`,
      },
    });
  };

  return {
    GET,
    dynamic: "force-static" as const,
  };
}

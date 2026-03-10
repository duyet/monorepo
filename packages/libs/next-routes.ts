/**
 * Shared Next.js route handlers for common endpoints across apps
 */

import { NextResponse } from "next/server";

// Cache configuration constants
const DEFAULT_CACHE_MAX_AGE = 3600; // 1 hour in seconds
const FORCE_STATIC = "force-static" as const;
const TEXT_PLAIN_UTF8 = "text/plain; charset=utf-8";

/**
 * Build Cache-Control header value for given max-age
 */
function buildCacheControl(maxAge: number): string {
  return `public, max-age=${maxAge}, s-maxage=${maxAge}`;
}

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
          "Cache-Control": buildCacheControl(DEFAULT_CACHE_MAX_AGE),
        },
      }
    );
  };

  return {
    GET,
    dynamic: FORCE_STATIC,
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
  const { cacheMaxAge = DEFAULT_CACHE_MAX_AGE } = options;

  const GET = (): NextResponse => {
    return new NextResponse(content.trim(), {
      headers: {
        "Content-Type": TEXT_PLAIN_UTF8,
        "Cache-Control": buildCacheControl(cacheMaxAge),
      },
    });
  };

  return {
    GET,
    dynamic: FORCE_STATIC,
  };
}

import { getPublicDigest } from "./public-queries";

export const PUBLIC_CACHE_CONTROL =
  "public, max-age=120, s-maxage=300, stale-while-revalidate=600";

const UNAVAILABLE = { error: "unavailable" } as const;

function unavailable(status: number): Response {
  return Response.json(UNAVAILABLE, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

/**
 * Unauthenticated public digest. Callers must not forward D1/admin error
 * text — only `{ error: "unavailable" }` leaves this function on failure.
 */
export async function servePublicApi(
  db: D1Database | undefined
): Promise<Response> {
  if (!db) return unavailable(503);
  try {
    const body = await getPublicDigest(db);
    return Response.json(body, {
      headers: { "Cache-Control": PUBLIC_CACHE_CONTROL },
    });
  } catch (error) {
    console.error("public api:", error);
    return unavailable(500);
  }
}

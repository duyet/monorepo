import { createServerFn } from "@tanstack/react-start";
import { getFeed } from "./feed-queries";

interface FeedInput {
  category?: string;
  q?: string;
}

export const fetchFeed = createServerFn({ method: "GET" })
  .inputValidator(
    (input: FeedInput): FeedInput => ({
      category:
        typeof input?.category === "string" ? input.category : undefined,
      q: typeof input?.q === "string" ? input.q : undefined,
    })
  )
  .handler(async ({ data }) => {
    const { env } = await import("cloudflare:workers");
    const db = (env as { DB?: D1Database }).DB;
    if (!db) throw new Error("D1 binding DB not configured");
    return getFeed(db, data);
  });

import { createServerFn } from "@tanstack/react-start";
import { getStory } from "./story-queries";
import type { FeedItem } from "./types";

/** Server fn wrapping getStory for the $cat/$slug permalink loader. */
export const fetchStory = createServerFn({ method: "GET" })
  .inputValidator((input: { idPrefix: string }) => input)
  .handler(async ({ data }): Promise<FeedItem | null> => {
    const { env } = await import("cloudflare:workers");
    const db = (env as { DB?: D1Database }).DB;
    if (!db) return null;
    try {
      return await getStory(db, data.idPrefix);
    } catch {
      return null;
    }
  });

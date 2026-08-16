import { createServerFn } from "@tanstack/react-start";

export const fetchSourceNames = createServerFn({ method: "GET" }).handler(
  async (): Promise<string[]> => {
    const { env } = await import("cloudflare:workers");
    const db = (env as { DB?: D1Database }).DB;
    if (!db) return [];
    try {
      const { results } = await db
        .prepare("SELECT name FROM sources WHERE enabled = 1 ORDER BY name")
        .all<{ name: string }>();
      const names = (results ?? []).map((r) => r.name);

      // "User submissions" is a virtual source (accepted /submit stories),
      // not a row in `sources` — surface it only when at least one exists.
      const submitted = await db
        .prepare("SELECT id FROM submissions WHERE status = 'accepted' LIMIT 1")
        .first()
        .catch(() => null);
      if (submitted) names.push("User submissions");

      return names;
    } catch {
      return [];
    }
  }
);

import { tool } from "ai";
import { z } from "zod";

export const baseTools = {
  getTime: tool({
    description: "Get current server time in ISO format.",
    inputSchema: z.object({}),
    execute: async () => ({ now: new Date().toISOString() }),
  }),
  fetchUrlText: tool({
    description: "Fetch a public URL and return plain text excerpt.",
    inputSchema: z.object({ url: z.string().url() }),
    execute: async ({ url }) => {
      const res = await fetch(url, { redirect: "follow" });
      const text = await res.text();
      return {
        status: res.status,
        url,
        excerpt: text.slice(0, 4000),
      };
    },
  }),
  fetchGitHubActivity: tool({
    description: "Fetch latest public GitHub events for an username. Requires approval.",
    inputSchema: z.object({ username: z.string().min(1) }),
    needsApproval: true,
    execute: async ({ username }) => {
      const res = await fetch(`https://api.github.com/users/${username}/events/public`);
      if (!res.ok) {
        return { error: `Failed with status ${res.status}` };
      }
      const events = (await res.json()) as Array<{ type?: string; repo?: { name?: string }; created_at?: string }>;
      return events.slice(0, 10).map((e) => ({
        type: e.type ?? "unknown",
        repo: e.repo?.name ?? "unknown",
        createdAt: e.created_at ?? "",
      }));
    },
  }),
};

import { describe, expect, it } from "vitest";
import { DEFAULT_AUTHORIZED_PARTIES } from "../../../apps/agent-api/src/auth.ts";
import {
  APP_REGISTRY,
  getClerkAuthorizedOrigins,
  getRegistryOrigins,
} from "./app-registry";

describe("app registry", () => {
  it("lists all 19 nav apps", () => {
    expect(APP_REGISTRY).toHaveLength(19);
  });

  it("resolves https origins for every registry entry", () => {
    for (const entry of APP_REGISTRY) {
      const origin = new URL(entry.href).origin;
      expect(origin.startsWith("https://")).toBe(true);
    }
  });

  it("keeps Clerk authorized parties aligned with registry origins", () => {
    const registryOrigins = new Set(getRegistryOrigins());
    for (const origin of registryOrigins) {
      expect(DEFAULT_AUTHORIZED_PARTIES).toContain(origin);
    }
    expect(DEFAULT_AUTHORIZED_PARTIES).toEqual(getClerkAuthorizedOrigins());
  });

  it("matches the derived registry snapshot", () => {
    expect(getRegistryOrigins()).toMatchInlineSnapshot(`
      [
        "https://agents.duyet.net",
        "https://ai-percentage.duyet.net",
        "https://blog.duyet.net",
        "https://burn.duyet.net",
        "https://cv.duyet.net",
        "https://duyet.net",
        "https://homelab.duyet.net",
        "https://html.duyet.net",
        "https://insights.duyet.net",
        "https://kb.duyet.net",
        "https://llm-timeline.duyet.net",
        "https://mcp.duyet.net",
        "https://news.duyet.net",
        "https://photos.duyet.net",
        "https://tip.duyet.net",
        "https://x-algo.duyet.net",
      ]
    `);
  });
});

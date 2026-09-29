import { describe, expect, it } from "vitest";
import {
  APP_REGISTRY,
  getClerkAuthorizedOrigins,
  getRegistryOrigins,
} from "./app-registry";

// Hosts that are authorized but are not derivable from the registry: the
// agents API backend, and the legacy news host the redirect Worker still serves.
const EXTRA_AUTHORIZED_ORIGINS = [
  "https://agents-api.duyet.net",
  "https://news.duyet.net",
];

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

  it("authorizes every registry origin plus the extra hosts", () => {
    const authorized = getClerkAuthorizedOrigins();
    for (const origin of getRegistryOrigins()) {
      expect(authorized).toContain(origin);
    }
    expect(authorized).toContain("https://news.duyet.net");
    expect(authorized).toContain("https://aidr.today");
    expect(authorized).toContain("https://agents-api.duyet.net");
  });

  it("adds nothing beyond the registry origins and the extra hosts", () => {
    // Guards the list against silent growth: every authorized origin must be a
    // registry origin or one of the explicitly-declared extras.
    const known = new Set([
      ...getRegistryOrigins(),
      ...EXTRA_AUTHORIZED_ORIGINS,
    ]);
    for (const origin of getClerkAuthorizedOrigins()) {
      expect(known.has(origin)).toBe(true);
    }
  });

  it("returns origins deduped and sorted", () => {
    const origins = getClerkAuthorizedOrigins();
    expect(origins).toEqual([...new Set(origins)].sort());
  });

  it("matches the derived registry snapshot", () => {
    expect(getRegistryOrigins()).toMatchInlineSnapshot(`
      [
        "https://agents.duyet.net",
        "https://ai-percentage.duyet.net",
        "https://aidr.today",
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
        "https://photos.duyet.net",
        "https://tip.duyet.net",
        "https://x-algo.duyet.net",
      ]
    `);
  });
});

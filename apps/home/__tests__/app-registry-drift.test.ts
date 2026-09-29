import { describe, expect, test } from "vitest";
import { APP_REGISTRY, getRegistryOrigins } from "@duyet/urls";
import { apps } from "../src/data/projects";

/**
 * `apps/home/src/data/projects.ts` and `packages/urls/src/app-registry.ts` both
 * list production origins, and the registry calls itself the "single source of
 * truth for production origins and deploy aliases". They had drifted: the
 * homepage's Agents card pointed at `https://agents.duyet.net/agents` while the
 * registry said `https://agents.duyet.net`.
 *
 * The drift was invisible three ways over. Both URLs return 200, because
 * `agent-ui` has **no router at all** — a single `App.tsx` served for any path —
 * so a link check cannot see it. The card's visible text comes from `domain`,
 * which was already right, so the page *looked* correct. And nothing compared
 * the two lists.
 *
 * This compares them: for every project whose host appears in the registry, the
 * full URL must match the registry's. A project on a host the registry does not
 * know about is a legitimate new app and passes through.
 */

// Built from the registry entries' own `href` — the full URL including path,
// which is exactly the field being compared. `appOrigin` is host-only and would
// throw the path away.
const registryByHost = new Map<string, string>(
  APP_REGISTRY.map((entry: { host: string; href: string }) => [
    entry.host,
    entry.href,
  ]),
);

describe("home project URLs vs the canonical app registry", () => {
  const projectUrls = apps.map((a) => ({ name: a.name, href: a.href }));

  test("both lists are non-empty, or the rest of this file proves nothing", () => {
    expect(APP_REGISTRY.length).toBeGreaterThan(0);
    expect(getRegistryOrigins().length).toBeGreaterThan(0);
    expect(projectUrls.length).toBeGreaterThan(0);
  });

  test("a project on a registered host uses the registry's exact URL", () => {
    const drifted = projectUrls
      .map((p) => ({ ...p, expected: registryByHost.get(new URL(p.href).host) }))
      .filter((p) => p.expected !== undefined && p.expected !== p.href)
      .map((p) => `${p.name}: ${p.href} vs registry ${p.expected}`);

    // This is what caught the Agents card carrying a `/agents` suffix the app
    // does not route.
    expect(drifted).toEqual([]);
  });

  test("every project URL is absolute https and parseable", () => {
    for (const p of projectUrls) {
      expect(() => new URL(p.href), p.name).not.toThrow();
      expect(new URL(p.href).protocol, p.name).toBe("https:");
    }
  });

  test("`domain` is a prefix of `href`, so the card shows where it links", () => {
    // The card renders `domain` as its visible text and `href` as the link, so
    // they must agree. The check is a prefix rather than an equality because
    // `domain` is a *display* string and legitimately carries a path for
    // GitHub-hosted projects ("github.com/duyet/ccr"), which is not a host.
    const mismatched = apps
      .filter((a) => a.domain && !a.href.startsWith(`https://${a.domain}`))
      .map((a) => `${a.name}: domain=${a.domain} href=${a.href}`);

    expect(mismatched).toEqual([]);
  });
});

/**
 * Render-equivalence guard for the overview route.
 *
 * The route used to be one ~485-line `IndexPage` function; it is now a short
 * list of sections composed from `components/overview/`. That is exactly the
 * kind of change that silently changes a rendered number — a dropped
 * `formatCompact`, a share list sliced twice, a `?` moved — and a test count
 * will not notice, because the arithmetic is still "correct" in isolation.
 *
 * So this compares the *rendered HTML* against a golden file captured from the
 * pre-split implementation. Any change to a rendered value, a class name, an
 * `aria-label`, or the order of the cards fails here.
 *
 *   pnpm -C apps/insights run test            # compare
 *   UPDATE_OVERVIEW_SNAPSHOT=1 pnpm -C apps/insights run test   # re-record
 *
 * The route module is imported for real, with only `@tanstack/react-router`
 * mocked so `Route.useLoaderData()` returns the fixture. That means this test
 * keeps working no matter how the page is internally decomposed — it exercises
 * the same entry point the router does.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { fixture } from "@/components/overview/fixture";
import type { LoaderData } from "@/components/overview/types";

/** Written before `vi.mock` hoisting, so the factory below can read it. */
const loader = vi.hoisted(() => ({ data: null as LoaderData | null }));

vi.mock("@tanstack/react-router", () => ({
  createFileRoute:
    () =>
    (options: { component: unknown }) => ({
      options,
      useLoaderData: () => loader.data,
    }),
}));

const GOLDEN = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "__snapshots__",
  "overview.html"
);

/** One tag per line so a golden diff points at the element that moved. */
function pretty(html: string): string {
  return html
    .replace(/<!--[^>]*-->/g, "")
    .replace(/></g, ">\n<")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .join("\n");
}

async function renderPage(data: LoaderData): Promise<string> {
  loader.data = data;
  const { Route } = await import("./index");
  const Page = (Route as unknown as { options: { component: () => unknown } })
    .options.component;
  return pretty(renderToStaticMarkup(<Page /> as never));
}

describe("overview route render equivalence", () => {
  it("renders the full dashboard byte-for-byte as the pre-split golden", async () => {
    const html = await renderPage(fixture);

    if (process.env.UPDATE_OVERVIEW_SNAPSHOT === "1") {
      writeFileSync(GOLDEN, `${html}\n`);
      return;
    }

    const golden = readFileSync(GOLDEN, "utf8").trimEnd();
    expect(html).toBe(golden);
  });

  it("is deterministic across renders", async () => {
    // Guards the golden file itself: a non-deterministic render (Date.now, a
    // random id, an unordered map) would make every run of this test flaky and
    // would quietly destroy the value of the diff.
    const [a, b] = await Promise.all([renderPage(fixture), renderPage(fixture)]);
    expect(a).toBe(b);
  });

  it("drops the optional sections, and only those, for an empty window", async () => {
    // Every card family in the route is conditional. This pins the *set* of
    // sections that survive when there is no data at all, so a refactor that
    // inverts one guard shows up as a section appearing rather than a number
    // changing.
    const empty = {
      ...fixture,
      aiActivity: [],
      aiModels: [],
      projectLeaderboard: [],
      cacheRatio: [],
      activityByWeekday: [],
      activityByHour: [],
      wakaLanguages: [],
      wakaTrend: [],
      ccByModel: [],
      ccEfficiency: [],
      ccProjects: [],
      githubRepos: [],
      posthog: { ...fixture.posthog, paths: [] },
    } satisfies LoaderData;

    const html = await renderPage(empty);

    // The language card is *not* guarded — an empty list still renders the
    // card shell, which is why it is the one useful canary that the unguarded
    // chrome survived.
    expect(html).toContain("Coding · WakaTime");
    // These five are guarded on data length; none may survive an empty window.
    expect(html).not.toContain("How tokens are spent");
    expect(html).not.toContain("Most-read pages");
    expect(html).not.toContain("Public repositories");
    expect(html).not.toContain("Where the work happened");
    expect(html).not.toContain("Top sessions by tokens");
    // Unguarded chrome stays.
    expect(html).toContain("A quiet view of what shipped");
  });
});

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

// Pinned before anything renders. `formatGeneratedAt` calls `toLocaleDateString`
// without a `timeZone` — the page's existing behaviour — so a golden recorded
// on a machine in one zone would fail on a machine in another. Fixing the
// zone here makes the snapshot reproducible without changing the page.
process.env.TZ = "UTC";

import type { ComponentType } from "react";
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

/**
 * One tag per line so a golden diff points at the element that moved, and
 * normalise the one thing that cannot survive a refactor.
 *
 * Two things on this page build their SVG `<defs>` ids from React's `useId()`
 * — `@thesvg/react` (`tsvg…`) and `Sparkline` (`sg_…_`) — and React derives
 * `useId` from a component's *position in the tree*. Splitting one component
 * into several therefore renumbers those ids. That is a property of the tree
 * shape, not of the data, and it is invisible to a reader: the id's only job is
 * to be unique within the document.
 *
 * They are renumbered to `1, 2, 3…` in order of first appearance rather than
 * collapsed to one constant, so a change in how *many* distinct ids are
 * emitted (a missing sparkline, a dropped logo) still shows up as a diff. The
 * page's own anchor ids (`ins-coding`, `ins-projects`, …) are never touched.
 * Everything else is compared byte-for-byte.
 */
function pretty(html: string): string {
  const seen = new Map<string, string>();
  const nextId = (raw: string) => {
    let alias = seen.get(raw);
    if (!alias) {
      alias = String(seen.size + 1);
      seen.set(raw, alias);
    }
    return alias;
  };

  return html
    .replace(/<!--[^>]*-->/g, "")
    .replace(/tsvg[A-Za-z0-9]+-/g, (id) => nextId(id))
    .replace(/sg_[A-Za-z0-9_]+/g, (id) => nextId(id))
    .replace(/></g, ">\n<")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .join("\n");
}

async function renderPage(data: LoaderData): Promise<string> {
  loader.data = data;
  const { Route } = await import("./index");
  const Page = (Route as unknown as { options: { component: ComponentType } })
    .options.component;
  return pretty(renderToStaticMarkup(<Page />));
}

describe("overview route render equivalence", () => {
  // Rendering the whole dashboard runs every d3 layout and every dither-kit
  // canvas computation, and takes 4–5s. The 5s Vitest default therefore sits
  // *on* the measurement, which makes this test fail intermittently under load
  // with a timeout rather than an assertion — the most misleading possible
  // failure, because it looks like the golden diverged when nothing did.
  //
  // It was observed doing exactly that while three other worktrees were
  // building concurrently. The budget is explicit for that reason: this test
  // does real work, and the time is part of its cost.
  const RENDER_TIMEOUT_MS = 60_000;

  it(
    "renders the full dashboard byte-for-byte as the pre-split golden",
    async () => {
      const html = await renderPage(fixture);

      if (process.env.UPDATE_OVERVIEW_SNAPSHOT === "1") {
        writeFileSync(GOLDEN, `${html}\n`);
        return;
      }

      const golden = pretty(readFileSync(GOLDEN, "utf8")).trimEnd();
      expect(html).toBe(golden);
    },
    RENDER_TIMEOUT_MS
  );

  it(
    "is deterministic across renders",
    async () => {
      // Guards the golden file itself: a non-deterministic render (Date.now, a
      // random id, an unordered map) would make every run of this test flaky and
      // would quietly destroy the value of the diff.
      const [a, b] = await Promise.all([
        renderPage(fixture),
        renderPage(fixture),
      ]);
      expect(a).toBe(b);
    },
    RENDER_TIMEOUT_MS
  );

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

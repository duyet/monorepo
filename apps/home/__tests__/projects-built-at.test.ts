import { readFileSync } from "node:fs";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import { ProjectsPageHeader } from "../src/components.projects/ProjectsPageHeader";
import { Route } from "../src/routes/projects";
import { formatBuiltTime } from "../src/lib/utils";

/**
 * The projects page must name when it was built — with the honest "Built"
 * label, never "Snapshot" (issue #1542, option 2). The catalogue is a
 * hand-committed static list, so "Snapshot" would claim a data refresh that
 * does not happen; there is nothing generated on this page to snapshot.
 *
 * The route module is imported for real, with `@tanstack/react-router`
 * mocked so `createFileRoute` works outside a router — the same approach
 * insights uses in `src/routes/index.render.test.tsx`. That keeps the test
 * on the same entry point the prerender uses, so a refactored route cannot
 * silently drop the built-at line.
 */

const FORMATTED_FIXTURE = "Oct 25, 2026, 08:30 UTC";

// Written before the imports below initialize: BUILT_AT is read once when
// src/lib/utils is first imported, so the env stub must already be in place.
vi.hoisted(() => {
  vi.stubEnv("VITE_BUILT_AT", "2026-10-25T08:30:00.000Z");
});

vi.mock("@tanstack/react-router", () => ({
  createFileRoute:
    () =>
    (options: { component: unknown }) => ({ options }),
}));

const Page = (
  Route as unknown as { options: { component: React.ComponentType } }
).options.component;

describe("formatBuiltTime", () => {
  it("formats a valid build time as UTC", () => {
    expect(formatBuiltTime("2026-10-05T01:18:00.000Z")).toBe(
      "Oct 5, 2026, 01:18 UTC"
    );
  });

  it("labels a missing build time as unknown", () => {
    expect(formatBuiltTime("")).toBe("unknown");
  });

  it("labels an invalid build time as unknown", () => {
    expect(formatBuiltTime("not-a-date")).toBe("unknown");
  });
});

describe("projects page built-at line", () => {
  it("renders the built time on the page header", () => {
    // One text node — `Built <formatted> UTC` — so a dropped line cannot pass
    // on the strength of otherwise-present copy ("Built for Human and AI
    // Agent" appears in a project description).
    const html = renderToStaticMarkup(
      createElement(ProjectsPageHeader, { count: 3 })
    );

    expect(html).toContain(`Built ${FORMATTED_FIXTURE}`);
  });

  it("renders the built time in the route's own output", () => {
    const html = renderToStaticMarkup(createElement(Page));

    expect(html).toContain(`Built ${FORMATTED_FIXTURE}`);
    // The missing-data fallback means VITE_BUILT_AT failed to inject —
    // "Built unknown" would be exactly the misleading page the issue is about.
    expect(html).not.toContain("unknown");
    // The honesty rule: this route never claims a data snapshot.
    expect(html).not.toContain("Snapshot");
  });
});

describe("built-at is injected at build time", () => {
  it("vite.config.ts defines VITE_BUILT_AT", () => {
    const config = readFileSync(
      new URL("../vite.config.ts", import.meta.url),
      "utf8"
    );
    expect(config).toContain("import.meta.env.VITE_BUILT_AT");
  });
});

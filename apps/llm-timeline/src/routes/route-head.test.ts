/**
 * `head()` for the static routes, asserted on the object the route actually
 * builds.
 *
 * `__root.tsx` emits a full `ogMeta` set for the homepage, and a route that
 * declares none silently inherits every tag from it: `/lite`, `/org` and
 * `/compare` all unfurled as `https://llm-timeline.duyet.net/` with the
 * homepage's title, description and card. Nothing failed — the pages rendered
 * and the HTML was valid, the only symptom was a card pointing at the wrong
 * page. So this asserts the tag values, not that a call happened.
 *
 * The shared `test-setup.ts` mocks `createFileRoute` to identity, which is
 * exactly what these assertions need: `Route` *is* the options object.
 */
import { describe, expect, it } from "vitest";
// Relative, not `@/lib/og`: tsconfig excludes `**/*.test.ts`, and
// vite-tsconfig-paths only maps paths for files the tsconfig includes.
import { SITE_DESCRIPTION, SITE_URL } from "../../lib/og";
import { Route as CompareRoute } from "./compare";
import { Route as LiteRoute } from "./lite";
import { Route as OrgRoute } from "./org";

type MetaTag = {
  title?: string;
  name?: string;
  property?: string;
  content?: string;
};

type HeadResult = { meta: MetaTag[]; links?: Array<Record<string, unknown>> };

function headOf(route: unknown): HeadResult {
  const headFn = (route as { head?: () => HeadResult }).head;
  if (!headFn) {
    throw new Error("route has no head() — it inherits every tag from __root");
  }
  return headFn();
}

function contentOf(
  result: HeadResult,
  key: { name?: string; property?: string },
): string | undefined {
  return result.meta.find((m) =>
    key.name ? m.name === key.name : m.property === key.property,
  )?.content;
}

const STATIC = [
  { path: "/lite", url: `${SITE_URL}/lite`, route: LiteRoute },
  { path: "/org", url: `${SITE_URL}/org`, route: OrgRoute },
  { path: "/compare", url: `${SITE_URL}/compare`, route: CompareRoute },
];

describe("static route head()", () => {
  it.each(STATIC)("$path unfurls as itself, not the homepage", ({ url, route }) => {
    expect(contentOf(headOf(route), { property: "og:url" })).toBe(url);
  });

  it.each(STATIC)("$path declares its own description", ({ route }) => {
    const description = contentOf(headOf(route), { name: "description" });
    expect(description).toBeTruthy();
    // Not the inherited `__root` one — that is the tell-tale of a missing head.
    expect(description).not.toBe(SITE_DESCRIPTION);
  });

  // `ogMeta` without an image emits `twitter:card: "summary"`, which *overrides*
  // `__root`'s `"summary_large_image"` while the 1200×630 `og:image` inherited
  // from `__root` stays put. No card is generated for these three routes, so
  // they point at the site card rather than let the pairing break.
  it.each(STATIC)("$path keeps the site card and a large twitter:card", ({ route }) => {
    const result = headOf(route);
    expect(contentOf(result, { property: "og:image" })).toBe(
      `${SITE_URL}/og/index.png`,
    );
    expect(contentOf(result, { name: "twitter:card" })).toBe(
      "summary_large_image",
    );
  });

  // `__root` already emits a `rel=canonical` for the homepage and `links` are
  // appended rather than overridden, so declaring one here would ship two
  // conflicting canonicals — which is what `/open` and `/org/$slug` do today.
  it.each(STATIC)("$path adds no canonical of its own", ({ route }) => {
    const { links } = headOf(route);
    expect(links ?? []).toHaveLength(0);
  });
});
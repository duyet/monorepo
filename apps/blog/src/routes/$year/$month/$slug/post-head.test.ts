/**
 * `head()` for the post route, asserted on the object the route actually
 * builds.
 *
 * This used to be a `readFileSync` + `toContain("TWITTER_WIDGETS_SRC")` match
 * against the route source, which passed or failed on spelling rather than on
 * behaviour — renaming the import, or inlining the URL, broke it without the
 * page changing. Here the route's own `head` is called and the emitted
 * `scripts` are inspected.
 */
import { beforeEach, describe, expect, it, vi } from "vitest";

// The shared setup stubs `createFileRoute` to `() => () => null`, which would
// leave nothing to assert against. Keep every other export real so the route
// module and its transitive imports behave normally.
vi.mock("@tanstack/react-router", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@tanstack/react-router")>()),
  createFileRoute:
    () =>
    (options: unknown): { options: unknown } => ({ options }),
}));

const { Route } = await import("./index");
const { TWITTER_WIDGETS_SRC } = await import("@/lib/x-embed");

type HeadFn = (args: {
  params: Record<string, string>;
  loaderData: Record<string, unknown> | undefined;
}) => {
  meta: Array<Record<string, unknown>>;
  links: Array<{ rel: string; href: string }>;
  scripts: Array<Record<string, unknown>>;
};

const head = (Route as unknown as { options: { head: HeadFn } }).options
  .head;

const post = {
  slug: "/2026/09/grok-bot",
  title: "Grok Bot",
  excerpt: "I am impressed.",
  date: new Date("2026-09-26T00:00:00.000Z"),
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("post route head", () => {
  it("loads widgets.js on the page so X embeds in the body become live", () => {
    const result = head({
      params: { year: "2026", month: "09", slug: "grok-bot" },
      loaderData: { post },
    });
    // Only post pages embed X; the child-chapter and note routes omit it.
    expect(result.scripts).toContainEqual({
      src: TWITTER_WIDGETS_SRC,
      async: true,
    });
  });

  it("emits the JSON-LD blob first, then the widgets.js tag", () => {
    const { scripts } = head({
      params: { year: "2026", month: "09", slug: "grok-bot" },
      loaderData: { post },
    });
    expect(scripts[0]?.type).toBe("application/ld+json");
    expect(scripts[1]?.src).toBe(TWITTER_WIDGETS_SRC);
  });
});

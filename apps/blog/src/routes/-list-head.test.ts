/**
 * `head()` for the list routes, asserted on the objects the routes actually
 * build — same approach as `post-head.test.ts`.
 *
 * The bug this guards: those routes used to set only `{title}` +
 * `{name: "description"}`, so `meta` merged left them with the root's card
 * verbatim and `/tags` shipped `og:url = https://blog.duyet.net`. Asserting the
 * emitted object catches a route that quietly drops back to inheriting, which a
 * string match against the route source never would.
 */
import { describe, expect, it, vi } from "vitest";

// The shared setup stubs `createFileRoute` to `() => () => null`, which would
// leave nothing to assert against. Keep every other export real so the route
// modules and their transitive imports behave normally.
vi.mock("@tanstack/react-router", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@tanstack/react-router")>()),
  createFileRoute:
    () =>
    (options: unknown): { options: unknown } => ({ options }),
}));

const { Route: tagsRoute } = await import("./tags");
const { Route: seriesRoute } = await import("./series");

type Head = {
  meta?: Array<Record<string, unknown>>;
  links?: Array<{ rel: string; href: string }>;
};

const optionsOf = (route: unknown) =>
  (route as { options: { head: unknown } }).options;

const property = (head: Head, p: string) =>
  head.meta?.find((m) => m.property === p)?.content as string;
const content = (head: Head, key: string) =>
  head.meta?.find((m) => m[key] !== undefined)?.[key] as string;
const canonical = (head: Head) => head.links?.find((l) => l.rel === "canonical");

const tagsHead = optionsOf(tagsRoute).head as () => Head;
const seriesHead = optionsOf(seriesRoute).head as (ctx: {
  matches: Array<{ routeId: string }>;
}) => Head;

describe("list route head", () => {
  it("gives /tags its own og:url instead of inheriting the root's", () => {
    const head = tagsHead();
    expect(property(head, "og:url")).toBe("https://blog.duyet.net/tags");
    expect(property(head, "og:title")).toBe("Topics");
    expect(content(head, "title")).toBe("Topics | Tôi là Duyệt");
  });

  it("gives /tags a canonical, which it used to have none of", () => {
    expect(canonical(tagsHead())?.href).toBe("https://blog.duyet.net/tags");
  });

  it("points /tags at the site-wide card", () => {
    expect(property(tagsHead(), "og:image")).toBe(
      "https://blog.duyet.net/og/index.png",
    );
  });

  it("stands /series down when /series/$slug is matched underneath it", () => {
    // `/series/$slug` renders through `/series`'s <Outlet/>, so both heads
    // apply to one document and `links` do not dedup — the parent must emit
    // nothing at all, or the child page gets two canonicals.
    const head = seriesHead({ matches: [{ routeId: "/series/$slug" }] });
    expect(head.links).toBeUndefined();
    expect(head.meta).toBeUndefined();
  });

  it("still owns the card for /series itself", () => {
    const head = seriesHead({ matches: [{ routeId: "/series" }] });
    expect(property(head, "og:url")).toBe("https://blog.duyet.net/series");
    expect(canonical(head)?.href).toBe("https://blog.duyet.net/series");
  });
});
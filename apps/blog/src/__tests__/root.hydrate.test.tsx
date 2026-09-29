/**
 * The root document must not warn on hydrate.
 *
 * This used to assert `<html lang="en" suppressHydrationWarning>` by reading
 * `__root.tsx` as text, so it broke on a reformat and proved nothing about what
 * the component actually returns. `suppressHydrationWarning` is consumed by
 * React and never reaches the DOM, so the assertion has to be made on the
 * element tree the component returns rather than on a rendered document.
 */
import { describe, expect, it, vi } from "vitest";
import type { ReactElement } from "react";

// The shared setup stubs the router module, but not with everything the root
// document renders. `createRootRoute` is needed to get the options at all, and
// the three router-owned slots are inert here — the subject of this test is the
// `<html>`/`<body>` attributes, not what goes inside them.
vi.mock("@tanstack/react-router", () => ({
  createRootRoute:
    (options: unknown): { options: unknown } => ({ options }),
  Outlet: () => null,
  HeadContent: () => null,
  Scripts: () => null,
}));

const { Route } = await import("../routes/__root");

const Root = (
  Route as unknown as { options: { component: () => ReactElement } }
).options.component;

const root = () => Root().props as Record<string, unknown>;
const child = (parent: Record<string, unknown>, type: string) =>
  (parent.children as ReactElement[]).find(
    (el) => typeof el.type === "string" && el.type === type,
  )?.props as Record<string, unknown>;

describe("blog root hydrate", () => {
  it("suppresses theme class mismatches on html and body", () => {
    // The theme boot script writes `dark`/`light` onto both elements before
    // React hydrates, so the class React sees on the client will not match the
    // one it rendered. Without these flags every page load logged a hydration
    // mismatch on every page.
    expect(root().suppressHydrationWarning).toBe(true);
    expect(child(root(), "body").suppressHydrationWarning).toBe(true);
  });

  it("still declares the document language", () => {
    expect(root().lang).toBe("en");
  });

  it("keeps a head element so the theme boot script runs before paint", () => {
    // A missing <head> would move the boot script into <body> and let the
    // first paint flash the wrong theme.
    expect(child(root(), "head")).toBeDefined();
  });
});

import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { filterGlobalNav, GLOBAL_NAV, isNavActive } from "../site-header/apps";
import { LocalNav } from "../site-header/LocalNav";
import type { GlobalNavItem } from "../site-header/types";

describe("site header units", () => {
  it("filters blog-only nav off non-blog apps", () => {
    const items: GlobalNavItem[] = [
      { label: "Home", href: "/", match: { app: "home", path: "/" } },
      {
        label: "Series",
        href: "/series",
        match: { app: "blog", path: "/series" },
        blogOnly: true,
      },
    ];
    expect(filterGlobalNav(items, "home").map((i) => i.label)).toEqual([
      "Home",
    ]);
    expect(filterGlobalNav(items, "blog").map((i) => i.label)).toEqual([
      "Series",
    ]);
  });

  it("hides items listed in hideOnApps", () => {
    const items: GlobalNavItem[] = [
      {
        label: "About",
        href: "/about",
        match: { path: "/about" },
        hideOnApps: ["blog"],
      },
    ];
    expect(filterGlobalNav(items, "blog")).toEqual([]);
    expect(filterGlobalNav(items, "cv").map((i) => i.label)).toEqual(["About"]);
  });

  it("keeps GLOBAL_NAV entries unique per app", () => {
    for (const app of ["home", "blog", "cv"] as const) {
      const items = filterGlobalNav(GLOBAL_NAV, app);
      const hrefs = items.map((i) => i.href);
      const labels = items.map((i) => i.label);
      expect(new Set(hrefs).size).toBe(hrefs.length);
      expect(new Set(labels).size).toBe(labels.length);
    }
  });

  it("matches blog child paths against the current pathname", () => {
    expect(
      isNavActive({ app: "blog", path: "/series" }, "blog", "/series/ai"),
    ).toBe(true);
    expect(isNavActive({ app: "blog", path: "/series" }, "blog", "/notes")).toBe(
      false,
    );
  });

  it("matches home nested paths the same way as blog", () => {
    expect(
      isNavActive({ app: "home", path: "/projects" }, "home", "/projects/detail"),
    ).toBe(true);
    expect(isNavActive({ app: "home", path: "/" }, "home", "/projects")).toBe(
      false,
    );
  });

  it("renders LocalNav with the active tab highlighted", () => {
    const { getByText } = render(
      <LocalNav
        activeHref="/chat"
        items={[
          { label: "Chat", href: "/chat" },
          { label: "API", href: "https://api.duyet.net", external: true },
        ]}
      />,
    );
    expect(getByText("Chat").className).toContain("font-medium");
    expect(getByText("API")).toBeDefined();
  });
});

import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { filterGlobalNav, isNavActive } from "../site-header/apps";
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

  it("matches blog child paths against the current pathname", () => {
    expect(
      isNavActive({ app: "blog", path: "/series" }, "blog", "/series/ai"),
    ).toBe(true);
    expect(isNavActive({ app: "blog", path: "/series" }, "blog", "/notes")).toBe(
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

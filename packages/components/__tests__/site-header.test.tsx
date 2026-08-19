import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  excludeLocalNavItems,
  filterGlobalNav,
  GLOBAL_NAV,
  isNavActive,
  navHrefKey,
} from "../site-header/apps";
import { LocalNav } from "../site-header/LocalNav";
import { SiteHeader } from "../site-header/SiteHeader";
import type { GlobalNavItem } from "../site-header/types";

describe("site header units", () => {
  it("filters blog-only nav off non-blog apps", () => {
    const items: GlobalNavItem[] = [
      { label: "Home", href: "/", match: { app: "home", path: "/" } },
      {
        label: "Series",
        href: "/series",
        match: { app: "blog", path: "/series" },
        onlyApp: "blog",
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

  it("shows a kb-only KB submenu with Home", () => {
    expect(filterGlobalNav(GLOBAL_NAV, "blog").some((i) => i.label === "KB")).toBe(
      false
    );
    const kb = filterGlobalNav(GLOBAL_NAV, "kb");
    expect(kb.map((i) => i.label)).toEqual(["KB"]);
    expect(kb[0].children?.map((c) => c.label)).toContain("Home");
    expect(kb[0].children?.find((c) => c.label === "Home")?.href).toBe("/");
  });

  it("matches blog child paths against the current pathname", () => {
    expect(
      isNavActive({ app: "blog", path: "/series" }, "blog", "/series/ai")
    ).toBe(true);
    expect(
      isNavActive({ app: "blog", path: "/series" }, "blog", "/notes")
    ).toBe(false);
  });

  it("matches home nested paths the same way as blog", () => {
    expect(
      isNavActive(
        { app: "home", path: "/projects" },
        "home",
        "/projects/detail"
      )
    ).toBe(true);
    expect(isNavActive({ app: "home", path: "/" }, "home", "/projects")).toBe(
      false
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
      />
    );
    expect(getByText("Chat").className).toContain("font-medium");
    expect(getByText("API")).toBeDefined();
  });

  it("treats in-app home paths as the same nav key as absolute duyet.net hrefs", () => {
    expect(navHrefKey("/")).toBe(navHrefKey("https://duyet.net"));
    expect(navHrefKey("/projects")).toBe(
      navHrefKey("https://duyet.net/projects")
    );
  });

  it("drops global items that duplicate the home local nav", () => {
    const homeLocalNav = [
      { label: "Home", href: "/" },
      { label: "Projects", href: "/projects" },
      { label: "About", href: "/about" },
    ];
    const labels = excludeLocalNavItems(
      filterGlobalNav(GLOBAL_NAV, "home"),
      homeLocalNav
    ).map((item) => item.label);
    expect(labels).toContain("Blog");
    expect(labels).toContain("CV");
    expect(labels).not.toContain("Home");
    expect(labels).not.toContain("Projects");
    expect(labels).not.toContain("About");
  });

  it("renders the home top-right cluster with theme, mobile menu, and global links", () => {
    const { getByLabelText, getByRole, getAllByRole, container } = render(
      <SiteHeader
        currentApp="home"
        localNav={[
          { label: "Home", href: "/" },
          { label: "Projects", href: "/projects" },
          { label: "About", href: "/about" },
        ]}
        activeHref="/"
      />
    );

    expect(getByLabelText("Toggle theme")).toBeTruthy();
    expect(getByLabelText("Open menu")).toBeTruthy();
    expect(getByRole("link", { name: "Blog" })).toBeTruthy();
    expect(getByRole("link", { name: "CV" })).toBeTruthy();
    expect(container.querySelector(".ml-auto.flex.shrink-0")).not.toBeNull();
    expect(getAllByRole("link", { name: "Home" })).toHaveLength(1);
  });
});

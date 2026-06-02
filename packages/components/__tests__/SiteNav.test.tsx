import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { SiteNav, SiteNavLink, siteNavLinkClassName } from "../site-nav";


describe("SiteNav", () => {
  it("renders brand and links slots", () => {
    const { getByText } = render(
      <SiteNav
        brand={<span>brand-marker</span>}
        links={<a href="/about">link-marker</a>}
      />
    );
    expect(getByText("brand-marker")).toBeDefined();
    expect(getByText("link-marker")).toBeDefined();
  });

  it("renders a mobile menu trigger with accessible label", () => {
    const { container } = render(<SiteNav />);
    const trigger = container.querySelector(
      'button[aria-label="Open menu"]'
    );
    expect(trigger).not.toBeNull();
  });

  it("uses scrolled visual state when alwaysScrolled is true", () => {
    const { container } = render(<SiteNav alwaysScrolled />);
    const header = container.querySelector("header");
    expect(header?.className).toContain("backdrop-blur-sm");
  });
});

describe("SiteNavLink", () => {
  it("marks the active link with aria-current=page", () => {
    const { container } = render(
      <SiteNavLink href="/blog" active>
        Blog
      </SiteNavLink>
    );
    const link = container.querySelector("a");
    expect(link?.getAttribute("aria-current")).toBe("page");
  });

  it("does not mark inactive links with aria-current", () => {
    const { container } = render(
      <SiteNavLink href="/blog">Blog</SiteNavLink>
    );
    const link = container.querySelector("a");
    expect(link?.getAttribute("aria-current")).toBeNull();
  });
});

describe("siteNavLinkClassName", () => {
  it("exposes the active underline opacity utility", () => {
    expect(siteNavLinkClassName(true)).toContain("after:opacity-100");
  });

  it("hides the underline when inactive", () => {
    expect(siteNavLinkClassName(false)).toContain("after:opacity-0");
  });
});

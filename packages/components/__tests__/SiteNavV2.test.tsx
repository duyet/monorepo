import * as React from "react";
import { SiteNavV2 } from "../site-nav/SiteNavV2";
import { AppsDrawer } from "../site-nav/AppsDrawer";
import { BreadcrumbBar } from "../site-nav/BreadcrumbBar";
import {
  afterEach,
  cleanup,
  describe,
  expect,
  it,
  render,
} from "../test-setup";

afterEach(cleanup);

describe("SiteNavV2", () => {
  it("renders brand text and links", () => {
    const links = [
      { name: "Home", href: "/", active: true },
      { name: "Blog", href: "/blog" },
    ];
    const { getByText, getAllByText } = render(
      <SiteNavV2 brandText="duyet.net test" links={links} />
    );

    expect(getByText("duyet.net test")).toBeDefined();
    expect(getAllByText("Home").length).toBeGreaterThan(0);
    expect(getAllByText("Blog").length).toBeGreaterThan(0);
  });

  it("renders search, apps, and theme control buttons", () => {
    const { getByLabelText } = render(<SiteNavV2 />);

    const searchButton = getByLabelText("Open command palette");
    expect(searchButton).toBeDefined();

    const appsButton = getByLabelText("Open applications drawer");
    expect(appsButton).toBeDefined();

    const mobileMenuButton = getByLabelText("Open navigation menu");
    expect(mobileMenuButton).toBeDefined();
  });

  it("uses scrolled styles when alwaysScrolled is true", () => {
    const { container } = render(<SiteNavV2 alwaysScrolled />);
    const header = container.querySelector("header");
    expect(header?.className).toContain("backdrop-blur-md");
  });
});

describe("AppsDrawer", () => {
  it("renders sibling apps list when open", () => {
    const { getByText } = render(
      <AppsDrawer isOpen={true} onClose={() => {}} activeApp="home" />
    );

    expect(getByText("Navigation")).toBeDefined();
    expect(getByText("Jump to sibling applications")).toBeDefined();
    expect(getByText("Home")).toBeDefined();
    expect(getByText("Blog")).toBeDefined();
    expect(getByText("Insights")).toBeDefined();
    expect(getByText("CV")).toBeDefined();
    expect(getByText("Photos")).toBeDefined();
    expect(getByText("Homelab")).toBeDefined();

    // Verify current app indicator is rendered
    expect(getByText("current")).toBeDefined();
  });

  it("does not render when closed (is translate-x-full)", () => {
    const { container } = render(
      <AppsDrawer isOpen={false} onClose={() => {}} />
    );
    const drawer = container.querySelector(".translate-x-full");
    expect(drawer).not.toBeNull();
  });
});

describe("BreadcrumbBar", () => {
  it("renders breadcrumb bar items and separators", () => {
    const items = [
      { name: "Home", href: "/" },
      { name: "Blog", href: "/blog" },
      { name: "Post Title" },
    ];
    const { getByText, getAllByText } = render(<BreadcrumbBar items={items} />);

    expect(getByText("Home")).toBeDefined();
    expect(getByText("Blog")).toBeDefined();
    expect(getByText("Post Title")).toBeDefined();

    // Verify separator is present multiple times
    const separators = getAllByText("·");
    expect(separators.length).toBe(2);
  });

  it("returns null when items is empty", () => {
    const { container } = render(<BreadcrumbBar items={[]} />);
    expect(container.firstChild).toBeNull();
  });
});

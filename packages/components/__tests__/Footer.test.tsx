import { afterEach, cleanup, describe, expect, it, render } from "../test-setup";
import Footer, { FooterContent } from "../Footer";

afterEach(cleanup);

describe("Footer", () => {
  it("renders as a footer element", () => {
    const { container } = render(<Footer />);
    const footer = container.querySelector("footer");
    expect(footer).toBeDefined();
  });

  it("applies custom className", () => {
    const { container } = render(<Footer className="custom-footer" />);
    const footer = container.querySelector("footer");
    expect(footer?.className).toContain("custom-footer");
  });

  it("has an accessible footer heading", () => {
    const { getByText } = render(<Footer />);
    const heading = getByText("Footer");
    expect(heading).toBeDefined();
    expect(heading.className).toContain("sr-only");
  });
});

describe("FooterContent", () => {
  it("renders Resources section", () => {
    const { getByText } = render(<FooterContent />);
    expect(getByText("Resources")).toBeDefined();
  });

  it("renders navigation links", () => {
    const { getByText } = render(<FooterContent />);
    expect(getByText("/archives")).toBeDefined();
    expect(getByText("/series")).toBeDefined();
    expect(getByText("/tags")).toBeDefined();
  });

  it("renders profile links", () => {
    const { getByText } = render(<FooterContent />);
    expect(getByText("About")).toBeDefined();
    expect(getByText("Resume")).toBeDefined();
  });

  it("renders copyright with current year", () => {
    const year = new Date().getFullYear().toString();
    const { container } = render(<FooterContent />);
    expect(container.innerHTML).toContain(year);
  });

  it("renders Social component", () => {
    const { container } = render(<FooterContent />);
    // Social renders links with aria-label
    const githubLink = container.querySelector('[aria-label="GitHub"]');
    expect(githubLink).toBeDefined();
  });

  it("renders external links with target=_blank", () => {
    const { container } = render(<FooterContent />);
    const externalLinks = container.querySelectorAll('a[target="_blank"]');
    expect(externalLinks.length).toBeGreaterThan(0);
    // All external links should have noopener noreferrer
    for (const link of externalLinks) {
      expect(link.getAttribute("rel")).toContain("noopener");
    }
  });
});

import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SiteFooter } from "../SiteFooter";

describe("SiteFooter", () => {
  it("renders social handles and no copyright year", () => {
    const { container } = render(<SiteFooter />);
    expect(container.textContent).not.toContain("©");
    expect(container.querySelector('[aria-label="GitHub"]')?.getAttribute("href")).toBe(
      "https://github.com/duyet"
    );
    expect(container.querySelector('[aria-label="X"]')?.getAttribute("href")).toBe(
      "https://x.com/_duyet"
    );
    expect(
      container.querySelector('[aria-label="LinkedIn"]')?.getAttribute("href")
    ).toBe("https://linkedin.com/in/duyet");
  });

  it("does not render the duyetbot maintenance line", () => {
    const { container } = render(<SiteFooter />);
    expect(container.textContent).not.toContain("Continuously maintained");
    expect(container.textContent).toContain("duyetbot");
  });
});

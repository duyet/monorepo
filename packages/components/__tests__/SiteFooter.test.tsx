import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SiteFooter } from "../SiteFooter";

describe("SiteFooter", () => {
  it("renders copyright and social handles", () => {
    const { container, getByText } = render(<SiteFooter />);
    const year = new Date().getFullYear().toString();
    expect(container.textContent).toContain(year);
    expect(getByText("github").getAttribute("href")).toBe(
      "https://github.com/duyet"
    );
    expect(getByText("x.com/_duyet").getAttribute("href")).toBe(
      "https://x.com/_duyet"
    );
  });

  it("does not render the duyetbot maintenance line", () => {
    const { container } = render(<SiteFooter />);
    expect(container.textContent).not.toContain("Continuously maintained");
    expect(container.textContent).not.toContain("duyetbot");
  });
});

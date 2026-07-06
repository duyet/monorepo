import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AutoDesignedBadge } from "../auto-designed-badge";

describe("AutoDesignedBadge", () => {
  it("renders the credit text", () => {
    const { container } = render(<AutoDesignedBadge />);
    expect(container.textContent).toContain(
      "This site is auto-driven and auto-designed by"
    );
    expect(container.textContent).toContain("duyetbot");
  });

  it("links to the duyetbot github profile with safe external attributes", () => {
    const { container } = render(<AutoDesignedBadge />);
    const link = container.querySelector("a");
    expect(link).not.toBeNull();
    expect(link?.getAttribute("href")).toBe("https://github.com/duyetbot");
    expect(link?.getAttribute("target")).toBe("_blank");
    expect(link?.getAttribute("rel")).toContain("noopener");
  });

  it("appends an optional className", () => {
    const { container } = render(
      <AutoDesignedBadge className="custom-credit" />
    );
    const node = container.querySelector("p");
    expect(node?.className).toContain("custom-credit");
  });
});

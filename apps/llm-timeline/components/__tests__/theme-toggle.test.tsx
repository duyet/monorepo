import { afterEach, cleanup, describe, expect, it, render } from "../../test-setup";
import { ThemeToggle } from "../theme-toggle";

afterEach(cleanup);

describe("ThemeToggle", () => {
  it("renders without crashing", () => {
    const { container } = render(<ThemeToggle />);
    expect(container).toBeDefined();
  });

  it("has correct aria-label", () => {
    const { getByRole } = render(<ThemeToggle />);
    const btn = getByRole("button", { name: "Toggle theme" });
    expect(btn).toBeDefined();
  });

  it("renders a button element", () => {
    const { getByRole } = render(<ThemeToggle />);
    const btn = getByRole("button");
    expect(btn.tagName.toLowerCase()).toBe("button");
  });

  it("has rounded-lg border class on the button", () => {
    const { getByRole } = render(<ThemeToggle />);
    const btn = getByRole("button");
    expect(btn.className).toContain("rounded-lg");
    expect(btn.className).toContain("border");
  });

  it("has padding class p-2.5 on the button", () => {
    const { getByRole } = render(<ThemeToggle />);
    const btn = getByRole("button");
    expect(btn.className).toContain("p-2.5");
  });

  it("has focus-visible ring classes for accessibility", () => {
    const { getByRole } = render(<ThemeToggle />);
    const btn = getByRole("button");
    expect(btn.className).toContain("focus-visible:ring-2");
  });
});

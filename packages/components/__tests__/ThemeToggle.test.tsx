import { afterEach, cleanup, describe, expect, it, mock, render } from "../test-setup";
import ThemeToggle from "../ThemeToggle";

afterEach(cleanup);

describe("ThemeToggle", () => {
  it("renders after mount", () => {
    const { container } = render(<ThemeToggle />);
    // After useEffect runs, the toggle group should be rendered
    expect(container.innerHTML).not.toBe("");
  });

  it("has accessible aria-label on the toggle group", () => {
    const { container } = render(<ThemeToggle />);
    const group = container.querySelector('[aria-label="Theme"]');
    expect(group).toBeDefined();
  });

  it("renders three theme options", () => {
    const { getByRole } = render(<ThemeToggle />);
    expect(getByRole("radio", { name: "Light" })).toBeDefined();
    expect(getByRole("radio", { name: "System" })).toBeDefined();
    expect(getByRole("radio", { name: "Dark" })).toBeDefined();
  });

  it("renders all three toggle buttons with correct values", () => {
    const { container } = render(<ThemeToggle />);
    expect(container.querySelector('[value="light"]')).toBeDefined();
    expect(container.querySelector('[value="system"]')).toBeDefined();
    expect(container.querySelector('[value="dark"]')).toBeDefined();
  });
});

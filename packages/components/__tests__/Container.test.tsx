import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Container from "../Container";

describe("Container", () => {
  it("renders children", () => {
    const { getByText } = render(<Container>Hello World</Container>);
    expect(getByText("Hello World")).toBeDefined();
  });

  it("applies default container classes", () => {
    const { container } = render(<Container>content</Container>);
    const div = container.firstElementChild;
    expect(div?.className).toContain("container");
    expect(div?.className).toContain("max-w-4xl");
    expect(div?.className).toContain("mx-auto");
  });

  it("merges custom className", () => {
    const { container } = render(
      <Container className="my-custom-class">content</Container>
    );
    const div = container.firstElementChild;
    expect(div?.className).toContain("my-custom-class");
    expect(div?.className).toContain("container");
  });

  it("renders multiple children", () => {
    const { getByText } = render(
      <Container>
        <span>First</span>
        <span>Second</span>
      </Container>
    );
    expect(getByText("First")).toBeDefined();
    expect(getByText("Second")).toBeDefined();
  });
});

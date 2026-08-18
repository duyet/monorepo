import { render } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Reveal } from "../redesign";

describe("Reveal", () => {
  it("server-renders visible without opacity:0", () => {
    const html = renderToStaticMarkup(
      <Reveal>
        <h1>Building agent workflows</h1>
      </Reveal>
    );
    expect(html).toContain("Building agent workflows");
    expect(html).not.toMatch(/opacity\s*:\s*0/);
    expect(html).not.toContain("translateY(14px)");
    expect(html).toMatch(/opacity\s*:\s*1/);
  });

  it("first client render matches SSR (visible, no opacity:0)", () => {
    const { container, getByText } = render(
      <Reveal>
        <h1>Building agent workflows</h1>
      </Reveal>
    );
    expect(getByText("Building agent workflows")).toBeDefined();
    const el = container.firstElementChild as HTMLElement;
    expect(el.style.opacity).not.toBe("0");
    expect(el.style.transform).not.toBe("translateY(14px)");
  });
});

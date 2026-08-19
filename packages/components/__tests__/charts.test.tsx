import { render } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { BarList, Donut, Heatmap, Sparkline } from "../charts";

describe("Sparkline", () => {
  it("renders an accessible svg with role=img when labelled", () => {
    const html = renderToStaticMarkup(
      <Sparkline data={[1, 3, 2, 5]} label="Coding hours trend" />
    );
    expect(html).toContain('role="img"');
    expect(html).toContain("Coding hours trend");
    expect(html).toContain("<path");
  });

  it("renders an empty placeholder for fewer than two points", () => {
    const html = renderToStaticMarkup(<Sparkline data={[1]} label="empty" />);
    expect(html).not.toContain("<svg");
  });
});

describe("Heatmap", () => {
  it("renders a labelled grid of cells", () => {
    const { getByRole } = render(
      <Heatmap
        ariaLabel="Contributions"
        data={[
          [{ value: 0, title: "none" }, { value: 4, title: "busy" }],
          [{ value: 1 }, { value: 2 }],
        ]}
      />
    );
    expect(getByRole("img", { name: "Contributions" })).toBeDefined();
    expect(getByRole("img").querySelectorAll("rect")).toHaveLength(4);
  });
});

describe("Donut", () => {
  it("renders an accessible svg for positive slices", () => {
    const html = renderToStaticMarkup(
      <Donut
        ariaLabel="Cost share"
        data={[
          { name: "Claude", value: 60 },
          { name: "GPT", value: 40 },
        ]}
      />
    );
    expect(html).toContain('role="img"');
    expect(html).toContain("Cost share");
    expect(html).toContain("<path");
  });
});

describe("BarList", () => {
  it("renders labelled bars scaled to the max value", () => {
    const { getByRole, getByText } = render(
      <BarList
        ariaLabel="Top cost drivers"
        data={[
          { name: "claude-opus", value: 80 },
          { name: "gpt-4o", value: 20 },
        ]}
      />
    );
    expect(getByRole("img", { name: "Top cost drivers" })).toBeDefined();
    expect(getByText("claude-opus")).toBeDefined();
    expect(getByText("80")).toBeDefined();
  });
});

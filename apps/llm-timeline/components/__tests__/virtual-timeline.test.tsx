import { GlobalRegistrator } from "@happy-dom/global-registrator";
GlobalRegistrator.register();

import { render } from "@testing-library/react";
import { describe, it, expect } from "bun:test";
import { VirtualTimeline } from "../virtual-timeline";

describe("VirtualTimeline", () => {
  it("renders without crashing", () => {
    const modelsByYear = new Map();
    modelsByYear.set(2023, [
      { name: "GPT-4", date: "2023-03-14", org: "OpenAI" },
    ]);

    const { container } = render(
      <VirtualTimeline modelsByYear={modelsByYear} />
    );
    expect(container).toBeDefined();
  });

  it("renders empty state when no models match", () => {
    const modelsByYear = new Map();
    const { getByText } = render(
      <VirtualTimeline modelsByYear={modelsByYear} />
    );
    expect(getByText("No models found matching your filters.")).toBeDefined();
  });
});

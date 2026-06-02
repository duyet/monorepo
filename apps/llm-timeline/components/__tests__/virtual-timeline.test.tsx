import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { VirtualTimeline } from "../virtual-timeline";

describe("VirtualTimeline", () => {
  it("renders without crashing", () => {
    const modelsByYear = new Map();
    modelsByYear.set(2023, [
      {
        name: "GPT-4",
        date: "2023-03-14",
        org: "OpenAI",
        params: null,
        type: "model",
        license: "closed",
        desc: "A large multimodal model",
      },
    ]);

    const { container } = render(
      <VirtualTimeline modelsByYear={modelsByYear} />
    );
    expect(container).toBeDefined();
  });

  it("renders empty state when no models match", () => {
    const modelsByYear = new Map();
    const { getAllByText } = render(
      <VirtualTimeline modelsByYear={modelsByYear} />
    );
    const elements = getAllByText("No models found matching your filters.");
    expect(elements.length).toBeGreaterThan(0);
  });
});

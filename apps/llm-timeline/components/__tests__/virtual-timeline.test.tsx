import { GlobalRegistrator } from "@happy-dom/global-registrator";

try {
  GlobalRegistrator.register();
} catch {
  // Already registered by another test file in the same process
}

import { afterEach, describe, expect, it, mock } from "bun:test";
import { cleanup, render } from "@testing-library/react";
import { VirtualTimeline } from "../virtual-timeline";

// Mock Next.js router
mock.module("next/navigation", () => ({
  useRouter: () => ({
    push: () => {},
    replace: () => {},
    prefetch: () => {},
    back: () => {},
    pathname: "/",
    query: {},
    asPath: "/",
  }),
  useSearchParams: () => ({
    get: () => null,
    getAll: () => ({}),
    has: () => false,
  }),
}));

afterEach(cleanup);

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

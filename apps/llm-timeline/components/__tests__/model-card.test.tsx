import { GlobalRegistrator } from "@happy-dom/global-registrator";

try {
  GlobalRegistrator.register();
} catch {
  // Already registered by another test file in the same process
}

import { afterEach, describe, expect, it, mock } from "bun:test";
import { cleanup, render } from "@testing-library/react";

// Mock Next.js router — must come before component imports
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

// Mock next-themes
mock.module("next-themes", () => ({
  useTheme: () => ({ resolvedTheme: "light", setTheme: () => {} }),
}));

import { ModelCard } from "../model-card";

const testModel = {
  name: "GPT-4",
  date: "2023-03-14",
  org: "OpenAI",
  params: "1.8T",
  type: "model" as const,
  license: "closed" as const,
  desc: "A large multimodal model",
  source: "curated" as const,
};

afterEach(cleanup);

describe("ModelCard", () => {
  it("renders full mode without crashing", () => {
    const { container } = render(<ModelCard model={testModel} />);
    expect(container).toBeDefined();
  });

  it("renders model name and org in full mode", () => {
    const { getByText } = render(<ModelCard model={testModel} />);
    expect(getByText("GPT-4")).toBeDefined();
    expect(getByText("OpenAI")).toBeDefined();
  });

  it("renders description in full mode", () => {
    const { getByText } = render(<ModelCard model={testModel} />);
    expect(getByText("A large multimodal model")).toBeDefined();
  });

  it("renders type and license badges in full mode", () => {
    const { getAllByText } = render(<ModelCard model={testModel} />);
    // type badge appears in full card badges section
    expect(getAllByText("model").length).toBeGreaterThan(0);
    expect(getAllByText("closed").length).toBeGreaterThan(0);
  });

  it("renders lite mode without crashing", () => {
    const { container } = render(<ModelCard model={testModel} lite />);
    expect(container).toBeDefined();
  });

  it("renders model name in lite mode", () => {
    const { getByText } = render(<ModelCard model={testModel} lite />);
    expect(getByText("GPT-4")).toBeDefined();
  });

  it("renders selection button with correct aria-label when isSelectable=true", () => {
    const { getByRole } = render(
      <ModelCard model={testModel} isSelectable isSelected={false} />
    );
    const btn = getByRole("button", {
      name: "Select GPT-4 for comparison",
    });
    expect(btn).toBeDefined();
  });

  it("renders deselect aria-label when isSelected=true", () => {
    const { getByRole } = render(
      <ModelCard model={testModel} isSelectable isSelected />
    );
    const btn = getByRole("button", { name: "Deselect GPT-4" });
    expect(btn).toBeDefined();
  });
});

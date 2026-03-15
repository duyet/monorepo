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

import { OrgTimeline } from "../org-timeline";

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

const testModel2 = {
  name: "Claude 2",
  date: "2023-07-11",
  org: "Anthropic",
  params: null,
  type: "model" as const,
  license: "closed" as const,
  desc: "A helpful assistant model",
  source: "curated" as const,
};

afterEach(cleanup);

describe("OrgTimeline", () => {
  it("renders empty state when no orgs provided", () => {
    const { getByText } = render(
      <OrgTimeline modelsByOrg={new Map()} />
    );
    expect(
      getByText("No models found matching your filters.")
    ).toBeDefined();
  });

  it("renders without crashing with data", () => {
    const modelsByOrg = new Map<string, typeof testModel[]>();
    modelsByOrg.set("OpenAI", [testModel]);
    const { container } = render(<OrgTimeline modelsByOrg={modelsByOrg} />);
    expect(container).toBeDefined();
  });

  it("renders org name in header", () => {
    const modelsByOrg = new Map<string, typeof testModel[]>();
    modelsByOrg.set("OpenAI", [testModel]);
    const { getAllByText } = render(<OrgTimeline modelsByOrg={modelsByOrg} />);
    // Org name appears in both the aria-hidden large heading and the visible header
    expect(getAllByText("OpenAI").length).toBeGreaterThan(0);
  });

  it("renders model count label for org", () => {
    const modelsByOrg = new Map<string, typeof testModel[]>();
    modelsByOrg.set("OpenAI", [testModel]);
    const { getByText } = render(<OrgTimeline modelsByOrg={modelsByOrg} />);
    expect(getByText("1 model")).toBeDefined();
  });

  it("renders plural model count for org with multiple models", () => {
    const anotherModel = { ...testModel, name: "GPT-3.5" };
    const modelsByOrg = new Map<string, typeof testModel[]>();
    modelsByOrg.set("OpenAI", [testModel, anotherModel]);
    const { getByText } = render(<OrgTimeline modelsByOrg={modelsByOrg} />);
    expect(getByText("2 models")).toBeDefined();
  });

  it("renders model cards for each org", () => {
    const modelsByOrg = new Map<string, (typeof testModel | typeof testModel2)[]>();
    modelsByOrg.set("OpenAI", [testModel]);
    modelsByOrg.set("Anthropic", [testModel2]);
    const { getByText } = render(<OrgTimeline modelsByOrg={modelsByOrg} />);
    expect(getByText("GPT-4")).toBeDefined();
    expect(getByText("Claude 2")).toBeDefined();
  });

  it("renders multiple orgs in order", () => {
    const modelsByOrg = new Map<string, (typeof testModel | typeof testModel2)[]>();
    modelsByOrg.set("OpenAI", [testModel]);
    modelsByOrg.set("Anthropic", [testModel2]);
    const { getAllByText } = render(<OrgTimeline modelsByOrg={modelsByOrg} />);
    expect(getAllByText("OpenAI").length).toBeGreaterThan(0);
    expect(getAllByText("Anthropic").length).toBeGreaterThan(0);
  });
});

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

import { FilterInfo } from "../filter-info";

const baseProps = {
  resultCount: 42,
  view: "models" as const,
  models: [],
};

afterEach(cleanup);

describe("FilterInfo", () => {
  it("renders without crashing", () => {
    const { container } = render(<FilterInfo {...baseProps} />);
    expect(container).toBeDefined();
  });

  it("renders search input with placeholder", () => {
    const { getAllByPlaceholderText } = render(<FilterInfo {...baseProps} />);
    const elements = getAllByPlaceholderText("Search models...");
    expect(elements.length).toBeGreaterThan(0);
  });

  it("renders result count", () => {
    const { getAllByText } = render(<FilterInfo {...baseProps} />);
    const elements = getAllByText("42");
    expect(elements.length).toBeGreaterThan(0);
  });

  it("renders 'models' label for models view", () => {
    const { getAllByText } = render(<FilterInfo {...baseProps} />);
    const elements = getAllByText("models");
    expect(elements.length).toBeGreaterThan(0);
  });

  it("renders 'organizations' label for organizations view", () => {
    const { getAllByText } = render(
      <FilterInfo {...baseProps} view="organizations" resultCount={10} />
    );
    const elements = getAllByText("organizations");
    expect(elements.length).toBeGreaterThan(0);
  });

  it("renders license select when onLicenseChange is provided", () => {
    const { getByRole } = render(
      <FilterInfo {...baseProps} onLicenseChange={() => {}} />
    );
    expect(getByRole("combobox")).toBeDefined();
  });

  it("does not render license select when onLicenseChange is absent", () => {
    const { queryByRole } = render(<FilterInfo {...baseProps} />);
    expect(queryByRole("combobox")).toBeNull();
  });

  it("shows comparison mode hint when comparisonMode=true", () => {
    const { getByText } = render(
      <FilterInfo
        {...baseProps}
        comparisonMode
        onToggleComparisonMode={() => {}}
      />
    );
    expect(getByText(/Comparison mode/)).toBeDefined();
  });

  it("does not show comparison mode hint when comparisonMode=false", () => {
    const { queryByText } = render(<FilterInfo {...baseProps} />);
    expect(queryByText(/Comparison mode/)).toBeNull();
  });

  it("renders lite mode toggle button", () => {
    const { getByRole } = render(<FilterInfo {...baseProps} />);
    const btn = getByRole("button", { name: "Toggle lite mode" });
    expect(btn).toBeDefined();
  });
});

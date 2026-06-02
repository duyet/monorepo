import "@testing-library/jest-dom/vitest";
import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render } from "@testing-library/react";

// Auto-cleanup after each test
afterEach(() => cleanup());

// Mock @tanstack/react-router — must be before component imports
vi.mock("@tanstack/react-router", () => ({
  useNavigate: () => () => {},
  useSearch: () => ({}),
  useParams: () => ({}),
  useRouter: () => ({
    navigate: () => {},
    history: { push: () => {}, replace: () => {} },
  }),
  Link: ({
    children,
    to,
    ...props
  }: {
    children: React.ReactNode;
    to: string;
    [key: string]: unknown;
  }) => {
    return React.createElement("a", { href: to, ...props }, children);
  },
  createRootRoute: (opts: unknown) => opts,
  createFileRoute: () => (opts: unknown) => opts,
  Outlet: () => null,
  ScrollRestoration: () => null,
  redirect: (opts: unknown) => opts,
  notFound: () => new Error("not found"),
}));

// Mock next-themes
vi.mock("next-themes", () => ({
  useTheme: () => ({ resolvedTheme: "light", setTheme: () => {} }),
}));

// Custom matcher for common "at least one element found" assertion
expect.extend({
  toHaveElements(received: Array<unknown>) {
    const pass = received.length > 0;
    return {
      pass,
      message: () =>
        pass
          ? `Expected elements not to be empty, but found ${received.length} elements`
          : `Expected elements to be greater than 0, but got ${received.length}`,
    };
  },
});

// Export for test files
export { afterEach, cleanup, describe, expect, it, vi as mock, render };

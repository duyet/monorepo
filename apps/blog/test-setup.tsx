import "@testing-library/jest-dom/vitest";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render } from "@testing-library/react";

// Auto-cleanup after each test
afterEach(() => cleanup());

// Mock @tanstack/react-router Link component
vi.mock("@tanstack/react-router", () => ({
  Link: ({
    children,
    to,
    params,
    ...props
  }: {
    children: React.ReactNode;
    to: string;
    params?: Record<string, string>;
    [key: string]: unknown;
  }) => {
    // Build a simple href from the to pattern and params
    let href = to;
    if (params) {
      for (const [key, value] of Object.entries(params)) {
        href = href.replace(`$${key}`, value);
      }
    }
    return (
      <a href={href} {...props}>
        {children}
      </a>
    );
  },
  useMatches: () => [],
  useRouterState: () => ({ location: { pathname: "/" } }),
  createFileRoute: () => () => null,
  Outlet: () => null,
}));

// Mock next-themes if used
vi.mock("next-themes", () => ({
  useTheme: () => ({
    theme: "light",
    resolvedTheme: "light",
    setTheme: () => {},
  }),
  ThemeProvider: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}));

export { afterEach, cleanup, describe, expect, it, vi as mock, render };

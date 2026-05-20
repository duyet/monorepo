import { afterEach, describe, expect, it, mock } from "bun:test";
import { GlobalRegistrator } from "@happy-dom/global-registrator";
import { cleanup, render } from "@testing-library/react";

try {
  GlobalRegistrator.register();
} catch {
  // Already registered by another test file in the same process
}

// Mock @tanstack/react-router Link component
mock.module("@tanstack/react-router", () => ({
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
mock.module("next-themes", () => ({
  useTheme: () => ({
    theme: "light",
    resolvedTheme: "light",
    setTheme: () => {},
  }),
  ThemeProvider: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}));

export { afterEach, cleanup, describe, expect, it, mock, render };
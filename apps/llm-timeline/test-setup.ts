import { GlobalRegistrator } from "@happy-dom/global-registrator";
import { afterEach, mock, expect, describe, it } from "bun:test";
import { cleanup, render } from "@testing-library/react";

// Register GlobalRegistrator once for all test files
try {
  GlobalRegistrator.register();
} catch {
  // Already registered by another test file in the same process
}

// Mock @tanstack/react-router — must be before component imports
mock.module("@tanstack/react-router", () => ({
  useNavigate: () => () => {},
  useSearch: () => ({}),
  useParams: () => ({}),
  useRouter: () => ({
    navigate: () => {},
    history: { push: () => {}, replace: () => {} },
  }),
  Link: ({ children, to, ...props }: { children: React.ReactNode; to: string; [key: string]: unknown }) => {
    const React = require("react");
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
mock.module("next-themes", () => ({
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
export { afterEach, describe, expect, it, mock, cleanup, render };

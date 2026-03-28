import { afterEach, describe, expect, it, mock } from "bun:test";
import { GlobalRegistrator } from "@happy-dom/global-registrator";
import { cleanup, render } from "@testing-library/react";

// Register GlobalRegistrator once for all test files
try {
  GlobalRegistrator.register();
} catch {
  // Already registered by another test file in the same process
}

// Mock @tanstack/react-router — must be before component imports
const mockLocation = {
  href: "/",
  pathname: "/",
  search: {},
  searchStr: "",
  hash: "",
  state: {},
  maskedLocation: undefined,
};
const createMockAtom = (value: unknown) => ({
  get: () => value,
  set: () => {},
  subscribe: () => () => {},
  state: value,
});
const mockRouterStore = createMockAtom({
  location: mockLocation,
  resolvedLocation: mockLocation,
  status: "idle",
  isLoading: false,
  matches: [],
  pendingMatches: [],
});
mock.module("@tanstack/react-router", () => ({
  useNavigate: () => () => {},
  useSearch: () => ({}),
  useParams: () => ({}),
  useMatch: () => ({ id: "root" }),
  useMatches: () => [],
  useRouter: () => ({
    navigate: () => {},
    history: {
      push: () => {},
      replace: () => {},
      createHref: (href: unknown) => {
        if (typeof href === "string") return href;
        if (typeof href === "object" && href !== null && "pathname" in href)
          return (href as { pathname: string }).pathname;
        return "/";
      },
    },
    stores: { location: createMockAtom(mockLocation) },
    store: mockRouterStore,
    options: {},
    buildLocation: (...args: unknown[]) => {
      const opts = args[0] as Record<string, unknown> | undefined;
      const to = (opts?.to as string) ?? (opts?.dest as string) ?? "/";
      return {
        ...mockLocation,
        href: to,
        pathname: to,
        search: opts?.search ?? {},
        searchStr: "",
        hash: (opts?.hash as string) ?? "",
      };
    },
    matchRoute: () => false,
    isActive: () => false,
  }),
  useRouterState: (opts?: { select?: (s: unknown) => unknown }) => {
    const state = {
      location: mockLocation,
      resolvedLocation: mockLocation,
      status: "idle",
      isLoading: false,
      matches: [],
    };
    return opts?.select ? opts.select(state) : state;
  },
  Link: ({
    children,
    to,
    ...props
  }: {
    children: React.ReactNode;
    to: string;
    [key: string]: unknown;
  }) => {
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
export { afterEach, cleanup, describe, expect, it, mock, render };

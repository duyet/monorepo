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
    ...props
  }: {
    children: React.ReactNode;
    to: string;
    [key: string]: unknown;
  }) => {
    return (
      <a href={to} {...props}>
        {children}
      </a>
    );
  },
}));

// Mock next-themes
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

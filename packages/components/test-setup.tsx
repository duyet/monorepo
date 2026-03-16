import { GlobalRegistrator } from "@happy-dom/global-registrator";
import { afterEach, expect, describe, it, mock } from "bun:test";
import { cleanup, render } from "@testing-library/react";

try {
  GlobalRegistrator.register();
} catch {
  // Already registered by another test file in the same process
}

// Mock Next.js Link component
mock.module("next/link", () => ({
  __esModule: true,
  default: ({
    children,
    href,
    ...props
  }: { children: React.ReactNode; href: string }) => {
    return <a href={href} {...props}>{children}</a>;
  },
}));

// Mock Next.js Image
mock.module("next/image", () => ({
  __esModule: true,
  default: (props: Record<string, unknown>) => <img {...props} />,
}));

// Mock next-themes
mock.module("next-themes", () => ({
  useTheme: () => ({ theme: "light", resolvedTheme: "light", setTheme: () => {} }),
  ThemeProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

export { afterEach, describe, expect, it, mock, cleanup, render };

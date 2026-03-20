import "@duyet/components/styles.css";
import "../globals.css";
import "../animations.css";

import ThemeProvider from "@duyet/components/ThemeProvider";
import { cn } from "@duyet/libs/utils";
import { createRootRoute, Outlet } from "@tanstack/react-router";
import { NotFound } from "../components/NotFound";

export const Route = createRootRoute({
  component: RootLayout,
  notFoundComponent: NotFound,
});

function RootLayout() {
  return (
    <ThemeProvider>
      <div
        className={cn(
          "text-claude-black subpixel-antialiased",
          "dark:bg-claude-gray-900 dark:text-claude-gray-50 transition-colors duration-300"
        )}
      >
        <Outlet />
      </div>
    </ThemeProvider>
  );
}

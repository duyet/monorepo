import "@duyet/components/styles.css";
import "../globals.css";
import "../animations.css";
import { NotFound } from "../components/NotFound";

import ThemeProvider from "@duyet/components/ThemeProvider";
import { cn } from "@duyet/libs/utils";
import { Outlet, createRootRoute } from "@tanstack/react-router";

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

import "@duyet/components/styles.css";
import "../../app/globals.css";

import Analytics from "@duyet/components/Analytics";
import ThemeProvider from "@duyet/components/ThemeProvider";
import { cn } from "@duyet/libs/utils";
import { createRootRoute, Link, Outlet } from "@tanstack/react-router";
import PhotoNav from "@/components/PhotoNav";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="max-w-md text-center">
        <h1 className="mb-4 text-6xl font-bold text-neutral-900 dark:text-neutral-100">
          404
        </h1>
        <h2 className="mb-4 text-xl font-semibold text-neutral-500 dark:text-neutral-400">
          Page not found
        </h2>
        <p className="mb-8 text-sm text-neutral-500 dark:text-neutral-400">
          The page you are looking for does not exist or has been moved.
        </p>
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
          <Link
            to="/"
            className="rounded-xl bg-neutral-800 px-6 py-2 font-medium text-white transition-all hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 focus-visible:ring-offset-2 dark:bg-neutral-200 dark:text-neutral-900 dark:focus-visible:ring-neutral-500"
          >
            Back to gallery
          </Link>
          <a
            href="https://duyet.net"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-xl border border-neutral-200 px-6 py-2 font-medium text-neutral-900 transition-all hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 focus-visible:ring-offset-2 dark:border-white/10 dark:text-neutral-100 dark:focus-visible:ring-neutral-500"
          >
            duyet.net
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  notFoundComponent: NotFoundComponent,
  component: RootComponent,
});

function RootComponent() {
  return (
    <ThemeProvider>
      <div
        className={cn(
          "bg-[var(--background)] text-[var(--foreground)] subpixel-antialiased",
          "transition-colors duration-1000"
        )}
      >
        <div className="flex min-h-screen flex-col">
          <PhotoNav />
          <main className="mt-16 flex-1">
            <Outlet />
          </main>
        </div>
        <Analytics />
      </div>
    </ThemeProvider>
  );
}

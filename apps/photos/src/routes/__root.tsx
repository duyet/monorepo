import "@duyet/components/styles.css";
import "../../app/globals.css";

import Analytics from "@duyet/components/Analytics";
import ThemeProvider from "@duyet/components/ThemeProvider";
import { cn } from "@duyet/libs/utils";
import {
  createRootRoute,
  HeadContent,
  Link,
  Outlet,
  Scripts,
} from "@tanstack/react-router";
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
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1.0" },
      { title: "Photos | Duyệt" },
      {
        name: "description",
        content:
          "A curated collection of photography by Duyệt - Data Engineer and photographer. Explore stunning landscapes, portraits, and street photography.",
      },
      {
        name: "theme-color",
        content: "#fbf7f0",
        media: "(prefers-color-scheme: light)",
      },
      {
        name: "theme-color",
        content: "#1f1f1f",
        media: "(prefers-color-scheme: dark)",
      },
    ],
    links: [
      { rel: "icon", type: "image/svg+xml", href: "/app/icon.svg" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous",
      },
      {
        rel: "preload",
        as: "style",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;700&family=Libre+Baskerville:wght@400;700&display=swap",
      },
    ],
  }),
  notFoundComponent: NotFoundComponent,
  component: RootComponent,
});

function RootComponent() {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
        {/* Non-blocking Google Fonts: preloaded above, applied here */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700&family=Libre+Baskerville:wght@400;700&display=swap"
          media="print"
          // @ts-expect-error onLoad is valid on link elements
          onLoad="this.media='all'"
        />
      </head>
      <body>
        <ThemeProvider>
          <div
            className={cn(
              "bg-white text-[var(--foreground)] subpixel-antialiased",
              "transition-colors duration-300"
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
        <Scripts />
      </body>
    </html>
  );
}

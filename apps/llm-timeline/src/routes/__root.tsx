import "@duyet/components/styles.css";
import "../globals.css";
import "../animations.css";

import Analytics from "@duyet/components/Analytics";
import ThemeProvider from "@duyet/components/ThemeProvider";
import { cn } from "@duyet/libs/utils";
import {
  createRootRoute,
  HeadContent,
  Outlet,
  Scripts,
} from "@tanstack/react-router";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 bg-[#fbf7f0] dark:bg-[#1f1f1f]">
      <div className="max-w-md text-center">
        <h1 className="mb-4 text-6xl font-bold font-[family-name:var(--font-display)] text-neutral-900 dark:text-neutral-100">
          404
        </h1>
        <h2 className="mb-4 text-xl font-semibold text-neutral-500 dark:text-neutral-400">
          Page not found
        </h2>
        <p className="mb-8 text-sm text-neutral-500 dark:text-neutral-400">
          The page you are looking for does not exist or has been moved.
        </p>
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
          <a
            href="/"
            className="rounded-xl px-6 py-2 font-medium transition-all hover:opacity-90 bg-neutral-800 dark:bg-neutral-200 text-white dark:text-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 dark:focus-visible:ring-neutral-500 focus-visible:ring-offset-2"
          >
            Go to timeline
          </a>
          <a
            href="https://duyet.net"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-xl border border-neutral-200 dark:border-white/10 px-6 py-2 font-medium transition-all hover:opacity-80 text-neutral-900 dark:text-neutral-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 dark:focus-visible:ring-neutral-500 focus-visible:ring-offset-2"
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
      { name: "robots", content: "follow, index" },
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
      { title: "LLM Timeline | llm-timeline.duyet.net" },
      {
        name: "description",
        content:
          "Interactive timeline of Large Language Model releases from 2017 to present.",
      },
    ],
    links: [
      { rel: "icon", href: "/favicon.svg", sizes: "any" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous",
      },
      {
        rel: "preload",
        as: "style",
        href: "https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Serif+Display:wght@400&family=IBM+Plex+Mono:wght@400;500;600&display=swap",
      },
      {
        rel: "alternate",
        type: "application/rss+xml",
        href: "/rss.xml",
        title: "LLM Timeline - RSS Feed",
      },
    ],
  }),
  notFoundComponent: NotFoundComponent,
  component: RootComponent,
});

function RootComponent() {
  return (
    <html lang="en">
      <head>
        <HeadContent />
        {/* Non-blocking Google Fonts: preloaded above, applied here */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Serif+Display:wght@400&family=IBM+Plex+Mono:wght@400;500;600&display=swap"
          media="print"
          // @ts-expect-error onLoad is valid on link elements
          onLoad="this.media='all'"
        />
      </head>
      <body>
        <ThemeProvider>
          <div
            className={cn(
              "text-neutral-900 dark:text-neutral-100",
              "subpixel-antialiased",
              "transition-colors duration-300"
            )}
          >
            <Outlet />
          </div>
        </ThemeProvider>
        <Analytics />
        <Scripts />
      </body>
    </html>
  );
}

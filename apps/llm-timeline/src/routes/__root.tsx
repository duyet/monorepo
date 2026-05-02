import "@duyet/components/styles.css";
import "../globals.css";
import "../animations.css";

import Analytics from "@duyet/components/Analytics";
import Footer from "@duyet/components/Footer";
import Header from "@duyet/components/Header";
import ThemeProvider from "@duyet/components/ThemeProvider";
import { llmTimelineConfig } from "@duyet/config";
import { cn } from "@duyet/libs/utils";
import {
  createRootRoute,
  HeadContent,
  Outlet,
  Scripts,
} from "@tanstack/react-router";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 bg-background">
      <div className="max-w-md text-center">
        <h1 className="mb-4 text-6xl font-bold font-[family-name:var(--font-display)] text-foreground">
          404
        </h1>
        <h2 className="mb-4 text-xl font-semibold text-muted-foreground">
          Page not found
        </h2>
        <p className="mb-8 text-sm text-muted-foreground">
          The page you are looking for does not exist or has been moved.
        </p>
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
          <a
            href="/"
            className="rounded-xl px-6 py-2 font-medium transition-all hover:opacity-90 bg-primary text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            Go to timeline
          </a>
          <a
            href="https://duyet.net"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-xl border border-border px-6 py-2 font-medium transition-all hover:opacity-80 text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
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
          "Interactive timeline of 3,923+ Large Language Model releases from 1950–2026 across 1,378+ organizations.",
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
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
        {/* Non-blocking Google Fonts: preloaded above, applied here */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Serif+Display:wght@400&family=IBM+Plex+Mono:wght@400;500;600&display=swap"
          media="all"
        />
      </head>
      <body>
        <ThemeProvider>
          <Header
            longText="LLM Timeline"
            shortText={llmTimelineConfig.metadata.title.replace(
              " | duyet.net",
              ""
            )}
          />
          <div
            className={cn(
              "text-foreground",
              "subpixel-antialiased",
              "transition-colors duration-300"
            )}
          >
            <Outlet />
          </div>
          <Footer />
        </ThemeProvider>
        <Analytics />
        <Scripts />
      </body>
    </html>
  );
}

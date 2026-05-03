import "@duyet/components/styles.css";
import "../globals.css";
import "../animations.css";

import Analytics from "@duyet/components/Analytics";
import Footer from "@duyet/components/Footer";
import Header from "@duyet/components/Header";
import ThemeProvider from "@duyet/components/ThemeProvider";
import { llmTimelineConfig } from "@duyet/config";
import {
  createRootRoute,
  HeadContent,
  Outlet,
  Scripts,
} from "@tanstack/react-router";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 bg-[#f8f8f2] dark:bg-[#0d0e0c]">
      <div className="max-w-md text-center">
        <h1 className="mb-4 text-6xl font-bold font-[family-name:var(--font-display)] text-[#1a1a1a] dark:text-[#f8f8f2]">
          404
        </h1>
        <h2 className="mb-4 text-xl font-semibold text-[#4d4d4d] dark:text-[#cfcfc8]">
          Page not found
        </h2>
        <p className="mb-8 text-sm text-[#4d4d4d] dark:text-[#cfcfc8]">
          The page you are looking for does not exist or has been moved.
        </p>
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
          <a
            href="/"
            className="rounded-xl px-6 py-2 font-medium transition-all hover:opacity-90 bg-[#1a1a1a] text-[#f8f8f2] dark:bg-[#f8f8f2] dark:text-[#1a1a1a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            Go to timeline
          </a>
          <a
            href="https://duyet.net"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-xl border border-[#e5e5e5] dark:border-white/10 px-6 py-2 font-medium transition-all hover:opacity-80 text-[#1a1a1a] dark:text-[#f8f8f2] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
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
        content: "#f8f8f2",
        media: "(prefers-color-scheme: light)",
      },
      {
        name: "theme-color",
        content: "#0d0e0c",
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
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Libre+Baskerville:wght@400;700&display=swap",
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
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Libre+Baskerville:wght@400;700&display=swap"
          media="all"
        />
      </head>
      <body>
        <ThemeProvider>
          <div className="min-h-screen bg-[#f8f8f2] text-[#1a1a1a] dark:bg-[#0d0e0c] dark:text-[#f8f8f2]">
            <Header
              longText="LLM Timeline"
              shortText={llmTimelineConfig.metadata.title.replace(
                " | duyet.net",
                ""
              )}
            />
            <main className="relative z-10 rounded-b-3xl bg-[#f8f8f2] pb-16 dark:bg-[#0d0e0c] 2xl:rounded-b-[4rem]">
              <div className="mx-auto max-w-[1280px] px-5 pb-16 pt-6 sm:px-8 lg:px-10">
                <Outlet />
              </div>
            </main>
            <Footer className="bg-[#f2f2eb] dark:bg-[#1a1a1a]" />
          </div>
        </ThemeProvider>
        <Analytics />
        <Scripts />
      </body>
    </html>
  );
}

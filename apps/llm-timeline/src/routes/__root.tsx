import "@duyet/components/styles.css";
import "../globals.css";
import "../animations.css";

import Analytics from "@duyet/components/Analytics";
import { SiteFooter, SiteHeader } from "@duyet/components";
import ThemeProvider from "@duyet/components/ThemeProvider";
import {
  createRootRoute,
  HeadContent,
  Outlet,
  Scripts,
  useRouterState,
} from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 bg-background">
      <div className="max-w-md text-center">
        <h1 className="mb-4 text-6xl font-bold text-foreground">
          404
        </h1>
        <h2 className="mb-4 text-xl font-semibold text-foreground">
          Page not found
        </h2>
        <p className="mb-8 text-sm text-muted-foreground">
          The page you are looking for does not exist or has been moved.
        </p>
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
          <Button asChild size="lg">
            <a href="/">Go to timeline</a>
          </Button>
          <Button asChild variant="outline" size="lg">
            <a href="https://duyet.net" target="_blank" rel="noopener noreferrer">
              duyet.net
            </a>
          </Button>
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
        content: "#ffffff",
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

const llmLocalNav = [
  { label: "Timeline", href: "/" },
  { label: "Companies", href: "/org" },
  { label: "Compare", href: "/compare" },
];

function RootComponent() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        <ThemeProvider>
          <div className="min-h-screen bg-background text-foreground">
            <SiteHeader
              currentApp="llm-timeline"
              localNav={llmLocalNav}
              activeHref={pathname}
            />
            <main className="relative z-10">
              <div className="mx-auto max-w-[1280px] px-5 pb-16 pt-6 sm:px-8 lg:px-10">
                <Outlet />
              </div>
            </main>
            <SiteFooter />
          </div>
        </ThemeProvider>
        <Analytics />
        <Scripts />
      </body>
    </html>
  );
}

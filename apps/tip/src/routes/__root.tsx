import "@duyet/components/styles.css";
import "../styles.css";

import Analytics from "@duyet/components/Analytics";
import { SiteFooter, SiteHeader } from "@duyet/components";
import ThemeProvider from "@duyet/components/ThemeProvider";
import {
  createRootRoute,
  HeadContent,
  Outlet,
  Scripts,
} from "@tanstack/react-router";
import { SITE_DESCRIPTION, SITE_TITLE, SITE_URL } from "../lib/site";

function NotFoundComponent() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold">404</h1>
        <p className="mt-2 text-muted-foreground">Page not found</p>
        <a href="/" className="mt-4 inline-block text-sm underline">
          Go home
        </a>
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
      { title: `${SITE_TITLE} | duyet.net` },
      { name: "description", content: SITE_DESCRIPTION },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "duyet.net" },
      { property: "og:title", content: SITE_TITLE },
      { property: "og:description", content: SITE_DESCRIPTION },
      { property: "og:url", content: SITE_URL },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:title", content: SITE_TITLE },
      { name: "twitter:description", content: SITE_DESCRIPTION },
      { name: "twitter:creator", content: "@_duyet" },
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
    ],
    links: [
      { rel: "canonical", href: SITE_URL },
      { rel: "icon", href: "/favicon.svg", type: "image/svg+xml" },
      { rel: "sitemap", type: "application/xml", href: "/sitemap.xml" },
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
      </head>
      <body>
        <ThemeProvider>
          <div className="flex min-h-dvh flex-col bg-background text-foreground">
            <SiteHeader currentApp="tip" />
            <main className="relative z-10 flex flex-1 flex-col">
              <Outlet />
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

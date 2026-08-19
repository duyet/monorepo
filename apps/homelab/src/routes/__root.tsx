import "@duyet/components/styles.css";
import "@/app/globals.css";

import { SiteHeader } from "@duyet/components/SiteHeader";
import { SiteFooter } from "@duyet/components/SiteFooter";
import { ExploreApps } from "@duyet/components";
import { homelabConfig } from "@duyet/config";
import {
  createRootRoute,
  HeadContent,
  Outlet,
  Scripts,
} from "@tanstack/react-router";
import ErrorPage from "@/app/error";
import NotFoundPage from "@/app/not-found";
import ThemeProvider from "@duyet/components/ThemeProvider";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1.0" },
      { name: "robots", content: "follow, index" },
      { title: homelabConfig.metadata.title },
      { name: "description", content: homelabConfig.metadata.description },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous",
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap",
      },
      { rel: "icon", href: "/favicon.svg", sizes: "any" },
    ],
  }),
  errorComponent: ({ error, reset }) => (
    <ErrorPage error={error} reset={reset} />
  ),
  notFoundComponent: () => <NotFoundPage />,
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
          <div className="relative flex min-h-screen flex-col justify-between overflow-x-hidden bg-background text-foreground subpixel-antialiased">
            <SiteHeader currentApp="homelab" />
            <main className="relative z-10 flex-grow">
              <Outlet />
            </main>
            <ExploreApps currentApp="homelab" />
            <SiteFooter />
          </div>
        </ThemeProvider>
        <Scripts />
      </body>
    </html>
  );
}
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
  useRouterState,
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
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        <ThemeProvider>
          <SiteHeader currentApp="homelab" />
          <Outlet />
          <ExploreApps currentApp="homelab" />
          <SiteFooter />
        </ThemeProvider>
        <Scripts />
      </body>
    </html>
  );
}
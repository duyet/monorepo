import "@duyet/components/styles.css";
import "../styles/globals.css";

import Analytics from "@duyet/components/Analytics";
import ThemeProvider from "@duyet/components/ThemeProvider";
import { SiteHeader, SiteFooter, SiteSubnav } from "@duyet/components";
import {
  createRootRoute,
  HeadContent,
  Outlet,
  Scripts,
  useRouterState,
} from "@tanstack/react-router";

function NotFoundComponent() {
  return (
    <main className="mx-auto flex min-h-[60vh] w-full max-w-[1040px] flex-col items-start justify-center px-6 md:px-8">
      <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
        404
      </p>
      <h1 className="mt-4 text-5xl font-semibold tracking-tight">Page not found.</h1>
      <a
        href="/"
        className="mt-6 text-sm underline underline-offset-4 hover:text-foreground"
      >
        Return home
      </a>
    </main>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1.0" },
      { name: "robots", content: "follow, index" },
      { title: "Insights | duyet.net" },
      { name: "description", content: "Insights for duyet.net" },
    ],
    links: [
      { rel: "icon", href: "/favicon.ico" },
    ],
  }),
  notFoundComponent: NotFoundComponent,
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
          <div className="min-h-screen bg-background text-foreground overflow-x-hidden flex flex-col">
            <SiteHeader
              brand="insights"
              brandHref="https://duyet.net"
              activeHref="https://insights.duyet.net"
            />
            <SiteSubnav
              links={[
                { label: "Overview", href: "/" },
                { label: "Blog", href: "/blog" },
                { label: "GitHub", href: "/github" },
                { label: "WakaTime", href: "/wakatime" },
                { label: "AI", href: "/ai" },
              ]}
              activeHref={pathname}
            />

            <main className="mx-auto w-full max-w-[1040px] px-6 py-12 md:py-16 md:px-8 flex-grow">
              <Outlet />
            </main>

            <SiteFooter owner="Duyet Le" />
          </div>

          <Analytics />
        </ThemeProvider>
        <Scripts />
      </body>
    </html>
  );
}

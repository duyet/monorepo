import "@duyet/components/styles.css";
import "../styles/globals.css";

import Analytics from "@duyet/components/Analytics";
import ThemeProvider from "@duyet/components/ThemeProvider";
import { SiteHeader, SiteFooter } from "@duyet/components";
import {
  createRootRoute,
  HeadContent,
  Link,
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

            <main className="mx-auto w-full max-w-[1040px] px-6 py-12 md:py-16 md:px-8 flex-grow">
              {/* Insights Sub-Navigation */}
              <div className="flex items-center gap-2 border-b pb-4 mb-8 overflow-x-auto scrollbar-none font-mono text-[10px] uppercase tracking-wider select-none">
                {[
                  { name: "Overview", href: "/" },
                  { name: "Blog", href: "/blog" },
                  { name: "GitHub", href: "/github" },
                  { name: "WakaTime", href: "/wakatime" },
                  { name: "AI", href: "/ai" },
                ].map((subLink) => {
                  const active = subLink.href === "/" ? pathname === "/" : pathname.startsWith(subLink.href);
                  return (
                    <Link
                      key={subLink.href}
                      to={subLink.href}
                      className={`px-3 py-1 rounded-full transition-all duration-200 border cursor-pointer ${
                        active
                          ? "bg-foreground text-background border-transparent font-medium"
                          : "text-muted-foreground border-border hover:border-foreground hover:text-foreground"
                      }`}
                    >
                      {subLink.name}
                    </Link>
                  );
                })}
              </div>

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

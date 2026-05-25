import "@duyet/components/styles.css";
import "../styles/globals.css";

import Analytics from "@duyet/components/Analytics";
import ThemeProvider from "@duyet/components/ThemeProvider";
import {
  createRootRoute,
  HeadContent,
  Link,
  Outlet,
  Scripts,
  useRouterState,
} from "@tanstack/react-router";
import { SiteNavV2 } from "@duyet/components";

function NotFoundComponent() {
  return (
    <main className="mx-auto flex min-h-[60vh] w-full max-w-[1040px] flex-col items-start justify-center px-6 md:px-8">
      <p className="text-xs uppercase tracking-[0.18em] text-[color:var(--muted)]">
        404
      </p>
      <h1 className="mt-4 font-serif text-5xl tracking-tight">Page not found.</h1>
      <a
        href="/"
        className="mt-6 text-sm underline decoration-[color:var(--accent)] underline-offset-4 hover:text-[color:var(--accent)]"
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
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous",
      },
      {
        rel: "preload",
        as: "style",
        href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&family=JetBrains+Mono:ital,wght@0,100..800;1,100..800&display=swap",
      },
    ],
  }),
  notFoundComponent: NotFoundComponent,
  component: RootComponent,
});

function RootComponent() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const globalNavLinks = [
    { name: "Home", href: "https://duyet.net" },
    { name: "Projects", href: "https://duyet.net/projects" },
    { name: "About", href: "https://duyet.net/about" },
    { name: "Blog", href: "https://blog.duyet.net" },
    { name: "CV", href: "https://cv.duyet.net" },
    { name: "Insights", href: "/", active: true },
    { name: "Agent", href: "https://agents.duyet.net" },
  ];

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
        <link
          rel="stylesheet"
          media="print"
          onLoad={(event) => {
            event.currentTarget.media = "all";
          }}
          href="https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&family=JetBrains+Mono:ital,wght@0,100..800;1,100..800&display=swap"
        />
      </head>
      <body>
        <ThemeProvider>
          <div className="min-h-screen relative bg-[color:var(--background)] text-[color:var(--foreground)] selection:bg-[color:var(--foreground)] selection:text-[color:var(--background)] overflow-x-hidden flex flex-col justify-between">
            {/* Clean full grid background overlay */}
            <div className="absolute inset-0 bg-grid-pattern pointer-events-none z-0 opacity-[0.8] dark:opacity-[0.4]" />

            <div className="w-full flex flex-col relative z-20">
              <SiteNavV2
                brandText="Duyet Le"
                brandHref="https://duyet.net"
                activeApp="insights"
                links={globalNavLinks}
              />
            </div>

            <main className="mx-auto w-full max-w-[1040px] px-6 py-12 md:py-16 md:px-8 relative z-10 flex-grow">
              {/* Local Insights Sub-Navigation Pill Bar */}
              <div className="flex items-center gap-2 border-b border-[color:var(--hairline)] pb-4 mb-8 overflow-x-auto scrollbar-none font-mono text-[10px] uppercase tracking-wider select-none">
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
                          ? "bg-[color:var(--foreground)] text-[color:var(--background)] border-transparent font-medium"
                          : "text-[color:var(--muted)] border-[color:var(--hairline)] hover:border-[color:var(--foreground)] hover:text-[color:var(--foreground)]"
                      }`}
                    >
                      {subLink.name}
                    </Link>
                  );
                })}
              </div>

              <Outlet />
            </main>

            <EditorialFooter />
          </div>

          <Analytics />
        </ThemeProvider>
        <Scripts />
      </body>
    </html>
  );
}

function EditorialFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-20 border-t border-[color:var(--hairline)] py-10 relative z-10">
      <div className="mx-auto max-w-[1040px] px-6 md:px-8 flex flex-col md:flex-row md:items-center justify-between gap-6 text-xs sm:text-[13px] text-[color:var(--muted)]">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <span>&copy; {year} Duyet Le.</span>
          <span className="text-[color:var(--hairline)]">|</span>
          <span>insights.duyet.net</span>
        </div>
        <div className="flex items-center gap-4">
          <a href="https://github.com/duyet" target="_blank" rel="noopener noreferrer" className="hover:text-[color:var(--foreground)] transition-colors">GitHub</a>
          <a href="https://linkedin.com/in/duyet" target="_blank" rel="noopener noreferrer" className="hover:text-[color:var(--foreground)] transition-colors">LinkedIn</a>
          <a href="https://x.com/_duyet" target="_blank" rel="noopener noreferrer" className="hover:text-[color:var(--foreground)] transition-colors">Twitter</a>
        </div>
      </div>
    </footer>
  );
}

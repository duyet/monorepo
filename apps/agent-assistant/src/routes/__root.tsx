import "@duyet/components/styles.css";
import "../styles.css";

import { SiteNavV2 } from "@duyet/components";
import Analytics from "@duyet/components/Analytics";
import ThemeProvider from "@duyet/components/ThemeProvider";
import {
  createRootRoute,
  HeadContent,
  Outlet,
  Scripts,
  useRouterState,
} from "@tanstack/react-router";

function NotFoundComponent() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-6">
      <div className="text-center">
        <h1 className="font-serif text-6xl tracking-tight">404</h1>
        <p className="mt-3 text-sm text-[color:var(--muted-foreground)]">
          Page not found
        </p>
        <a
          href="/"
          className="mt-6 inline-block text-sm text-[color:var(--foreground)] underline underline-offset-4 decoration-[color:var(--accent)] hover:decoration-2"
        >
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
      { title: "duyetbot | duyet.net" },
      {
        name: "description",
        content:
          "Personal AI assistant for Duyet. Auto-driven and auto-designed by the duyetbot agent.",
      },
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
  const _pathname = useRouterState({ select: (s) => s.location.pathname });

  const globalNavLinks = [
    { name: "Home", href: "https://duyet.net" },
    { name: "Projects", href: "https://duyet.net/projects" },
    { name: "About", href: "https://duyet.net/about" },
    { name: "Blog", href: "https://blog.duyet.net" },
    { name: "CV", href: "https://cv.duyet.net" },
    { name: "Insights", href: "https://insights.duyet.net" },
    { name: "Agent", href: "/", active: true },
  ];

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&family=JetBrains+Mono:ital,wght@0,100..800;1,100..800&display=swap"
          media="print"
          // @ts-expect-error onLoad is valid on link elements
          onLoad="this.media='all'"
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
                activeApp="agent"
                links={globalNavLinks}
              />
            </div>

            <main className="mx-auto w-full max-w-[1040px] px-6 py-12 md:py-16 md:px-8 relative z-10 flex-grow">
              <Outlet />
            </main>

            <EditorialFooter />
          </div>
        </ThemeProvider>
        <Analytics />
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
          <span>agent-assistant.duyet.net</span>
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

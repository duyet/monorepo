import "@duyet/components/styles.css";
import "../styles/globals.css";

import Analytics from "@duyet/components/Analytics";
import ThemeProvider from "@duyet/components/ThemeProvider";
import {
  createRootRoute,
  HeadContent,
  Outlet,
  Scripts,
} from "@tanstack/react-router";
import { EditorialNavigation } from "@/components/navigation/EditorialNavigation";

function NotFoundComponent() {
  return (
    <main className="mx-auto flex min-h-[60vh] w-full max-w-6xl flex-col items-start justify-center px-6 md:px-8">
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
        href: "https://fonts.googleapis.com/css2?family=EB+Garamond:wght@400;500&family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap",
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
        <link
          rel="stylesheet"
          media="print"
          onLoad={(event) => {
            event.currentTarget.media = "all";
          }}
          href="https://fonts.googleapis.com/css2?family=EB+Garamond:wght@400;500&family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap"
        />
      </head>
      <body>
        <ThemeProvider>
          <div className="flex min-h-screen flex-col bg-[var(--background)] text-[var(--foreground)]">
            <EditorialNavigation />

            <main className="flex-1 pt-24 pb-20">
              <div className="mx-auto w-full max-w-6xl px-6 md:px-8">
                <Outlet />
              </div>
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
    <footer className="border-t border-[color:var(--hairline)]">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-6 py-10 text-xs text-[color:var(--muted)] md:flex-row md:items-center md:justify-between md:px-8">
        <p className="font-serif italic">
          &copy; {year} Duyet Le &middot; insights.duyet.net
        </p>
        <p className="font-serif italic">
          This site is auto-driven and auto-designed by the{" "}
          <a
            href="https://github.com/duyetbot"
            target="_blank"
            rel="noreferrer noopener"
            className="underline decoration-[color:var(--accent)] decoration-1 underline-offset-4 transition-colors hover:text-[color:var(--accent)]"
          >
            duyetbot
          </a>{" "}
          agent.
        </p>
      </div>
    </footer>
  );
}

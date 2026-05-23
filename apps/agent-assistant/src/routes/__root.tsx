import "@duyet/components/styles.css";
import "../styles.css";

import Analytics from "@duyet/components/Analytics";
import ThemeProvider from "@duyet/components/ThemeProvider";
import {
  createRootRoute,
  HeadContent,
  Outlet,
  Scripts,
} from "@tanstack/react-router";

function NotFoundComponent() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-6">
      <div className="text-center">
        <h1
          className="font-serif text-6xl tracking-tight"
          style={{ fontFamily: "var(--font-serif)" }}
        >
          404
        </h1>
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
        href: "https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,500;0,600;1,400&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap",
      },
    ],
  }),
  notFoundComponent: NotFoundComponent,
  component: RootComponent,
});

function TopBar() {
  return (
    <header className="sticky top-0 z-30 h-14 w-full backdrop-blur-sm bg-[color:var(--background)]/80 border-b border-transparent transition-colors duration-150">
      <div className="mx-auto flex h-full max-w-6xl items-center justify-between px-4 md:px-6">
        <a
          href="/"
          className="group inline-flex items-baseline gap-2 text-[color:var(--foreground)]"
        >
          <span
            className="font-serif text-xl tracking-tight"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            duyetbot
          </span>
          <span className="text-xs text-[color:var(--muted-foreground)]">
            assistant
          </span>
        </a>
        <nav className="flex items-center gap-5 text-sm">
          <a
            href="/"
            className="relative text-[color:var(--foreground)] transition-colors hover:text-[color:var(--foreground)] after:absolute after:left-0 after:-bottom-1 after:h-px after:w-full after:scale-x-100 after:bg-[color:var(--accent)]"
          >
            Chat
          </a>
          <a
            href="https://duyet.net"
            className="text-[color:var(--muted-foreground)] transition-colors hover:text-[color:var(--foreground)]"
          >
            duyet.net
          </a>
        </nav>
      </div>
    </header>
  );
}

function CreditFooter() {
  return (
    <footer className="mx-auto w-full max-w-6xl px-4 md:px-6 py-6 text-center">
      <p className="text-xs italic text-[color:var(--muted-foreground)]">
        This site is auto-driven and auto-designed by the{" "}
        <a
          href="https://github.com/duyetbot"
          target="_blank"
          rel="noreferrer noopener"
          className="underline underline-offset-4 decoration-[color:var(--hairline)] transition-colors hover:text-[color:var(--foreground)] hover:decoration-[color:var(--accent)]"
        >
          duyetbot
        </a>{" "}
        agent.
      </p>
    </footer>
  );
}

function RootComponent() {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,500;0,600;1,400&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap"
          media="print"
          // @ts-expect-error onLoad is valid on link elements
          onLoad="this.media='all'"
        />
      </head>
      <body className="bg-[color:var(--background)] text-[color:var(--foreground)]">
        <ThemeProvider>
          <div className="flex min-h-screen flex-col">
            <TopBar />
            <main className="flex-1 flex flex-col relative">
              <Outlet />
            </main>
            <CreditFooter />
          </div>
        </ThemeProvider>
        <Analytics />
        <Scripts />
      </body>
    </html>
  );
}

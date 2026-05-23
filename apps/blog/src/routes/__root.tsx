import "@duyet/components/styles.css";
import "../../app/globals.css";
import "../../styles/blog-design.css";

import Analytics from "@duyet/components/Analytics";
import Footer from "@duyet/components/Footer";
import ThemeProvider from "@duyet/components/ThemeProvider";
import { cn } from "@duyet/libs/utils";
import { duyetUrls } from "@duyet/urls";
import {
  createRootRoute,
  HeadContent,
  Link,
  Outlet,
  Scripts,
  useRouterState,
} from "@tanstack/react-router";
import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center px-6 bg-[var(--em-background)]">
      <div className="max-w-md text-center">
        <p className="mb-4 text-xs uppercase tracking-[0.16em] text-[color:var(--em-muted)]">
          404
        </p>
        <h1 className="font-editorial-serif mb-3 text-4xl font-medium tracking-tight text-[color:var(--em-foreground)] sm:text-5xl">
          Page not found
        </h1>
        <p className="mb-8 text-sm text-[color:var(--em-muted)]">
          The page you're looking for has moved or never existed.
        </p>
        <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <a
            href="/"
            className="text-sm font-medium text-[color:var(--em-foreground)] underline decoration-[color:var(--em-accent)] decoration-1 underline-offset-4 transition-colors hover:text-[color:var(--em-accent)]"
          >
            Back to blog
          </a>
          <span aria-hidden className="text-[color:var(--em-subtle)]">
            ·
          </span>
          <a
            href="https://duyet.net"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-[color:var(--em-muted)] transition-colors hover:text-[color:var(--em-foreground)]"
          >
            duyet.net
          </a>
        </div>
      </div>
    </div>
  );
}

interface BlogNavItem {
  name: string;
  href: string;
  external?: boolean;
  matchPrefix?: string;
}

const blogNavItems: BlogNavItem[] = [
  { name: "Latest", href: "/", matchPrefix: "/" },
  { name: "Archives", href: "/archives/", matchPrefix: "/archives" },
  { name: "Featured", href: "/featured/", matchPrefix: "/featured" },
  { name: "Series", href: "/series/", matchPrefix: "/series" },
  { name: "Tags", href: "/tags/", matchPrefix: "/tags" },
  { name: "Search", href: "/search/", matchPrefix: "/search" },
  { name: "About", href: "/about/", matchPrefix: "/about" },
  { name: "Duyet.net", href: duyetUrls.apps.home, external: true },
];

function EditorialNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const isActive = (item: BlogNavItem) => {
    if (item.external) return false;
    if (item.matchPrefix === "/") {
      return pathname === "/" || pathname === "";
    }
    if (!item.matchPrefix) return false;
    return pathname === item.matchPrefix ||
      pathname.startsWith(`${item.matchPrefix}/`);
  };

  return (
    <header className="editorial-nav">
      <div className="editorial-nav__inner">
        <Link to="/" className="editorial-nav__brand" aria-label="Duyet Le, home">
          Duyet Le
        </Link>
        <nav className="editorial-nav__links" aria-label="Primary">
          {blogNavItems.map((item) =>
            item.external ? (
              <a
                key={item.name}
                href={item.href}
                className="editorial-nav__link"
                target="_blank"
                rel="noopener noreferrer"
              >
                {item.name}
              </a>
            ) : (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "editorial-nav__link",
                  isActive(item) && "is-active"
                )}
              >
                {item.name}
              </Link>
            )
          )}
        </nav>
      </div>
    </header>
  );
}

function BotCredit() {
  return (
    <div className="em-bot-credit" role="contentinfo">
      <em>
        This site is auto-driven and auto-designed by the{" "}
        <a
          href="https://github.com/duyetbot"
          target="_blank"
          rel="noopener noreferrer"
        >
          duyetbot
        </a>{" "}
        agent.
      </em>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1.0" },
      { name: "robots", content: "follow, index" },
      { title: "Tôi là Duyệt | blog.duyet.net" },
      {
        name: "description",
        content:
          "Sr. Data Engineer. Rustacean at night. Technical blog on data engineering, distributed systems, and open source.",
      },
    ],
    links: [
      { rel: "icon", href: "/favicon.ico" },
      { rel: "dns-prefetch", href: "https://fonts.googleapis.com" },
      { rel: "dns-prefetch", href: "https://fonts.gstatic.com" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous",
      },
      {
        rel: "preload",
        as: "style",
        href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
      },
      {
        rel: "alternate",
        type: "application/rss+xml",
        href: "/rss.xml",
        title: "Tôi là Duyệt - RSS Feed",
      },
    ],
  }),
  notFoundComponent: NotFoundComponent,
  component: RootComponent,
});

function RootComponent() {
  return (
    <html lang="en">
      <head>
        <HeadContent />
        {/* Non-blocking Google Fonts: preloaded above, applied here */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap"
          media="print"
          // @ts-expect-error onLoad is valid on link elements
          onLoad="this.media='all'"
        />
      </head>
      <body>
        <ThemeProvider>
          <div className="blog-editorial-shell min-h-screen subpixel-antialiased">
            <EditorialNav />
            <main className="relative z-10 pb-12">
              <Outlet />
            </main>
            <BotCredit />
            <Footer />
            <Analytics />
            <ServiceWorkerRegister />
          </div>
        </ThemeProvider>
        <Scripts />
      </body>
    </html>
  );
}

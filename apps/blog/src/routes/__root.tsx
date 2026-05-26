import "@duyet/components/styles.css";
import "../../app/globals.css";
import "../../styles/blog-design.css";

import { SiteHeader, SiteFooter } from "@duyet/components";
import Analytics from "@duyet/components/Analytics";
import ThemeProvider from "@duyet/components/ThemeProvider";
import {
  createRootRoute,
  HeadContent,
  Outlet,
  Scripts,
  useRouterState,
} from "@tanstack/react-router";
import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center px-6 bg-background">
      <div className="max-w-md text-center">
        <p className="mb-4 text-xs uppercase tracking-[0.16em] text-muted-foreground">
          404
        </p>
        <h1 className="mb-3 text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
          Page not found
        </h1>
        <p className="mb-8 text-sm text-muted-foreground">
          The page you're looking for has moved or never existed.
        </p>
        <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <a
            href="/"
            className="text-sm font-medium text-foreground underline decoration-border decoration-1 underline-offset-4 transition-colors hover:text-muted-foreground"
          >
            Back to blog
          </a>
          <span aria-hidden className="text-muted-foreground">
            ·
          </span>
          <a
            href="https://duyet.net"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            duyet.net
          </a>
        </div>
      </div>
    </div>
  );
}

const siteFooterLinks = [
  { label: "Home", href: "https://duyet.net" },
  { label: "Blog", href: "https://blog.duyet.net" },
  { label: "CV", href: "https://cv.duyet.net" },
  { label: "Insights", href: "https://insights.duyet.net" },
];

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

const blogLocalNav = [
  { label: "Latest", href: "/" },
  { label: "Archives", href: "/archives" },
  { label: "Categories", href: "/category" },
  { label: "Tags", href: "/tags" },
  { label: "Series", href: "/series" },
  { label: "AI", href: "/ai" },
  { label: "RSS", href: "/rss.xml", external: true },
];

function RootComponent() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        <ThemeProvider>
          <div className="blog-editorial-shell min-h-screen relative bg-background text-foreground overflow-x-hidden flex flex-col justify-between subpixel-antialiased">

            <SiteHeader
              currentApp="blog"
              localNav={blogLocalNav}
              activeHref={pathname}
            />

            <main className="relative z-10 pb-12 flex-grow">
              <Outlet />
            </main>
            <BotCredit />
            <SiteFooter links={siteFooterLinks} />
            <Analytics />
            <ServiceWorkerRegister />
          </div>
        </ThemeProvider>
        <Scripts />
      </body>
    </html>
  );
}

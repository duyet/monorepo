import "../../app/globals.css";

import Analytics from "@duyet/components/Analytics";
import { SiteFooter } from "@duyet/components/SiteFooter";
import ThemeProvider, {
  THEME_BOOT_SCRIPT,
} from "@duyet/components/ThemeProvider";
import { duyetFaviconHeadLinks } from "@duyet/components/brand/duyet-logo";
import { duyetFontHeadLinks } from "@duyet/components/brand/fonts";
import { SiteHeader } from "@duyet/components/site-header/SiteHeader";
import {
  createRootRoute,
  HeadContent,
  Outlet,
  Scripts,
} from "@tanstack/react-router";
import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center px-6 bg-background">
      <div className="max-w-md text-center">
        <p className="mb-4 text-xs uppercase tracking-[0.16em] text-muted-foreground">
          404
        </p>
        <h1 className="mb-3 font-[family-name:var(--font-display)] text-4xl font-normal tracking-[-0.03em] text-foreground sm:text-5xl">
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
      ...duyetFontHeadLinks({ display: true }),
      ...duyetFaviconHeadLinks(),
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
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOT_SCRIPT }} />
        <HeadContent />
      </head>
      <body suppressHydrationWarning>
        <ThemeProvider>
          <SiteHeader
            currentApp="blog"
            variant="slashy"
            cta={{ label: "Archives", href: "/archives/" }}
          />
          <main className="min-h-[70vh]">
            <Outlet />
          </main>
          <SiteFooter referralSource="blog.duyet.net" />
          <Analytics />
          <ServiceWorkerRegister />
        </ThemeProvider>
        <Scripts />
      </body>
    </html>
  );
}

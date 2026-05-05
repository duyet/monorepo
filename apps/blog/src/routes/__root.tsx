import "@duyet/components/styles.css";
import "../../app/globals.css";

import Analytics from "@duyet/components/Analytics";
import Footer from "@duyet/components/Footer";
import { AppCommandPalette } from "@duyet/components";
import Header from "@duyet/components/Header";
import type { NavigationItem } from "@duyet/components/Menu";
import { duyetUrls } from "@duyet/urls";
import ThemeProvider from "@duyet/components/ThemeProvider";
import {
  createRootRoute,
  HeadContent,
  Outlet,
  Scripts,
} from "@tanstack/react-router";
import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 bg-white dark:bg-[#0d0e0c]">
      <div className="max-w-md text-center">
        <h1 className="mb-4 text-6xl font-bold font-serif text-neutral-900 dark:text-neutral-100">
          404
        </h1>
        <h2 className="mb-4 text-xl font-semibold text-neutral-500 dark:text-neutral-400">
          Page not found
        </h2>
        <p className="mb-8 text-sm text-neutral-500 dark:text-neutral-400">
          The page you are looking for does not exist or has been moved.
        </p>
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
          <a
            href="/"
            className="rounded-xl px-6 py-2 font-medium transition-all hover:opacity-90 bg-neutral-800 dark:bg-neutral-200 text-white dark:text-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 dark:focus-visible:ring-neutral-500 focus-visible:ring-offset-2"
          >
            Go to blog
          </a>
          <a
            href="https://duyet.net"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-xl border border-neutral-200 dark:border-white/10 px-6 py-2 font-medium transition-all hover:opacity-80 text-neutral-900 dark:text-neutral-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 dark:focus-visible:ring-neutral-500 focus-visible:ring-offset-2"
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
        href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&display=swap",
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
          href="https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&display=swap"
          media="print"
          // @ts-expect-error onLoad is valid on link elements
          onLoad="this.media='all'"
        />
      </head>
      <body>
        <ThemeProvider>
          <div className="min-h-screen bg-white font-sans text-[var(--foreground)] subpixel-antialiased [--font-inter:Inter,system-ui,sans-serif] [--font-serif:'Libre_Baskerville',Georgia,serif] dark:bg-[#0d0e0c]">
            <Header
              shortText="Duyet Le"
              longText="Duyet Le"
              navigationItems={blogNavigation}
              showAuthButtons={false}
              actions={<AppCommandPalette />}
            />
            <main className="relative z-10 rounded-b-3xl bg-white pb-16 dark:bg-[#0d0e0c] 2xl:rounded-b-[4rem]">
              <Outlet />
            </main>
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

const blogNavigation: NavigationItem[] = [
  { name: "Blog", href: duyetUrls.apps.blog },
  { name: "Archives", href: `${duyetUrls.apps.blog}/archives/` },
  { name: "Featured", href: `${duyetUrls.apps.blog}/featured/` },
  { name: "Series", href: `${duyetUrls.apps.blog}/series/` },
  { name: "Tags", href: `${duyetUrls.apps.blog}/tags/` },
  { name: "Home", href: duyetUrls.apps.home },
];

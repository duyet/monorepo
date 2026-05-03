import "@duyet/components/styles.css";
import "../../app/globals.css";

import Analytics from "@duyet/components/Analytics";
import { AppCommandPalette } from "@duyet/components";
import ThemeProvider from "@duyet/components/ThemeProvider";
import { cn } from "@duyet/libs/utils";
import { duyetUrls } from "@duyet/urls";
import {
  createRootRoute,
  HeadContent,
  Link,
  Outlet,
  Scripts,
} from "@tanstack/react-router";
import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 bg-[#f8f8f2] dark:bg-[#0d0e0c]">
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
          <div
            className={cn(
              "min-h-screen bg-[var(--background)] font-sans text-[var(--foreground)]",
              "subpixel-antialiased",
              "[--font-inter:Inter,system-ui,sans-serif]",
              "[--font-serif:'Libre_Baskerville',Georgia,serif]"
            )}
          >
            <BlogHeader />
            <main className="relative z-10 rounded-b-3xl bg-[#f8f8f2] pb-16 dark:bg-[#0d0e0c] 2xl:rounded-b-[4rem]">
              <Outlet />
            </main>
            <BlogFooter />
            <Analytics />
            <ServiceWorkerRegister />
          </div>
        </ThemeProvider>
        <Scripts />
      </body>
    </html>
  );
}

function BlogHeader() {
  return (
    <header className="sticky top-0 z-50 bg-[#f8f8f2]/95 backdrop-blur dark:bg-[#0d0e0c]/95">
      <div className="mx-auto flex max-w-[1280px] items-center justify-between px-5 py-4 sm:px-8 lg:px-10 lg:py-5">
        <Link to="/" className="flex items-center gap-3">
          <DuyetMark />
          <span className="text-xl font-semibold tracking-tight">Duyet Le</span>
        </Link>

        <nav className="hidden items-center gap-7 text-sm font-medium md:flex">
          <Link to="/">Blog</Link>
          <Link to="/archives/">Archives</Link>
          <Link to="/featured/">Featured</Link>
          <Link to="/series/">Series</Link>
          <Link to="/tags/">Tags</Link>
          <a href={addUtmParams(duyetUrls.apps.home, "blog", "header_home")}>
            Home
          </a>
        </nav>

        <AppCommandPalette />
      </div>
    </header>
  );
}

function BlogFooter() {
  return (
    <footer className="sticky bottom-0 bg-[#f2f2eb] px-5 pb-12 pt-24 dark:bg-[#1a1a1a] sm:px-8 lg:px-10 lg:pb-16 lg:pt-28 xl:pb-20">
      <div className="mx-auto max-w-[1280px]">
        <h2 className="max-w-[820px] text-balance text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
          Notes on useful systems, written clearly.
        </h2>
        <div className="my-12 flex flex-wrap items-center gap-4 md:my-16">
          <a
            href={addUtmParams(
              "https://github.com/duyet",
              "blog",
              "footer_github"
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg bg-[#1a1a1a] px-6 py-4 text-base font-medium text-white transition-colors hover:bg-[#444] dark:bg-[#f8f8f2] dark:text-[#0d0e0c] dark:hover:bg-white lg:px-8 lg:text-lg"
          >
            GitHub
          </a>
          <a
            href={addUtmParams(
              "https://linkedin.com/in/duyet",
              "blog",
              "footer_linkedin"
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg border border-[#1a1a1a]/15 px-6 py-4 text-base font-medium transition-colors hover:border-[#1a1a1a] dark:border-white/15 dark:hover:border-white lg:px-8 lg:text-lg"
          >
            LinkedIn
          </a>
        </div>

        <hr className="border-[#1a1a1a]/15 dark:border-white/15" />

        <div className="grid gap-6 pt-10 text-base font-medium md:grid-cols-2 md:pt-16">
          <div className="flex flex-wrap items-center gap-6">
            <span>© Duyet Le</span>
            <a href="/llms.txt" className="underline underline-offset-2">
              llms.txt
            </a>
            <Link to="/archives/" className="underline underline-offset-2">
              Archives
            </Link>
          </div>
          <div className="flex flex-wrap items-center gap-6 md:justify-end">
            <a
              href={addUtmParams(
                "https://status.duyet.net",
                "blog",
                "footer_status"
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2"
            >
              <span className="h-3 w-3 rounded-full bg-orange-500" />
              <span>All Systems Operational</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

function DuyetMark() {
  return (
    <span className="grid h-5 w-5 grid-cols-2 gap-0.5" aria-hidden="true">
      <span className="bg-[#1a1a1a] dark:bg-[#f8f8f2]" />
      <span className="translate-y-1 bg-[#1a1a1a] dark:bg-[#f8f8f2]" />
      <span className="-translate-y-1 bg-[#1a1a1a] dark:bg-[#f8f8f2]" />
      <span className="bg-[#1a1a1a] dark:bg-[#f8f8f2]" />
    </span>
  );
}

function addUtmParams(url: string, campaign: string, content: string): string {
  const urlObj = new URL(url);
  urlObj.searchParams.set("utm_source", "blog");
  urlObj.searchParams.set("utm_medium", "website");
  urlObj.searchParams.set("utm_campaign", campaign);
  urlObj.searchParams.set("utm_content", content);
  return urlObj.toString();
}

import "@duyet/components/styles.css";
import "../../app/globals.css";

import Analytics from "@duyet/components/Analytics";
import Footer from "@duyet/components/Footer";
import Header from "@duyet/components/Header";
import ThemeProvider from "@duyet/components/ThemeProvider";
import {
  createRootRoute,
  HeadContent,
  Link,
  Outlet,
  Scripts,
} from "@tanstack/react-router";

function NotFoundComponent() {
  return (
    <div className="flex min-h-[400px] items-center justify-center px-4">
      <div className="max-w-md text-center">
        <h1 className="mb-4 text-6xl font-bold text-[#1a1a1a] dark:text-[#f8f8f2]">
          404
        </h1>
        <h2 className="mb-4 text-xl font-semibold text-[#1a1a1a]/60 dark:text-[#f8f8f2]/60">
          Page not found
        </h2>
        <p className="mb-8 text-sm text-[#1a1a1a]/60 dark:text-[#f8f8f2]/60">
          The page you are looking for does not exist or has been moved.
        </p>
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
          <Link
            to="/"
            className="rounded-xl bg-[#1a1a1a] px-6 py-2 font-medium text-white transition-all hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 focus-visible:ring-offset-2 dark:bg-white dark:text-[#0d0e0c] dark:focus-visible:ring-neutral-500"
          >
            Back to gallery
          </Link>
          <a
            href="https://duyet.net"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-xl border border-[#1a1a1a]/15 px-6 py-2 font-medium text-[#1a1a1a] transition-all hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 focus-visible:ring-offset-2 dark:border-white/15 dark:text-[#f8f8f2] dark:focus-visible:ring-neutral-500"
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
      { title: "Photos | Duyet" },
      {
        name: "description",
        content:
          "A curated collection of photography by Duyet - Data Engineer and photographer. Explore stunning landscapes, portraits, and street photography.",
      },
      {
        name: "theme-color",
        content: "#ffffff",
        media: "(prefers-color-scheme: light)",
      },
      {
        name: "theme-color",
        content: "#0d0e0c",
        media: "(prefers-color-scheme: dark)",
      },
    ],
    links: [
      { rel: "icon", type: "image/svg+xml", href: "/app/icon.svg" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous",
      },
      {
        rel: "preload",
        as: "style",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;700&family=Libre+Baskerville:wght@400;700&display=swap",
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
        {/* Non-blocking Google Fonts: preloaded above, applied here */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700&family=Libre+Baskerville:wght@400;700&display=swap"
          media="print"
          // @ts-expect-error onLoad is valid on link elements
          onLoad="this.media='all'"
        />
      </head>
      <body>
        <ThemeProvider>
          <div className="min-h-screen bg-white text-[#1a1a1a] dark:bg-[#0d0e0c] dark:text-[#f8f8f2]">
            <Header longText="Photos" shortText="Photos" />
            <main className="relative z-10 rounded-b-3xl bg-white pb-16 dark:bg-[#0d0e0c] 2xl:rounded-b-[4rem]">
              <div className="mx-auto px-5 pb-16 pt-6 sm:px-8 lg:px-4 xl:px-6 2xl:px-8">
                <Outlet />
              </div>
            </main>
            <Footer className="bg-white dark:bg-[#1a1a1a]" />
          </div>
          <Analytics />
        </ThemeProvider>
        <Scripts />
      </body>
    </html>
  );
}

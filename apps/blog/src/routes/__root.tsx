import "@duyet/components/styles.css";
import "../../app/globals.css";

import Analytics from "@duyet/components/Analytics";
import Footer from "@duyet/components/Footer";
import ThemeProvider from "@duyet/components/ThemeProvider";
import { cn } from "@duyet/libs/utils";
import {
  createRootRoute,
  HeadContent,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@tanstack/react-router";
import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 bg-[#fbf7f0] dark:bg-[#1f1f1f]">
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
  notFoundComponent: NotFoundComponent,
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      {
        name: "description",
        content:
          "Sr. Data Engineer. Rustacean at night. Technical blog on data engineering, distributed systems, and open source.",
      },
      { title: "Tôi là Duyệt | blog.duyet.net" },
      {
        name: "theme-color",
        content: "#fbf7f0",
        media: "(prefers-color-scheme: light)",
      },
      {
        name: "theme-color",
        content: "#1f1f1f",
        media: "(prefers-color-scheme: dark)",
      },
    ],
    links: [
      {
        rel: "alternate",
        type: "application/rss+xml",
        href: "/rss.xml",
        title: "Tôi là Duyệt — RSS Feed",
      },
    ],
  }),
  component: RootComponent,
});

function RootComponent() {
  return (
    <html
      className={cn(
        "font-sans",
        "[--font-inter:Inter,system-ui,sans-serif]",
        "[--font-serif:'Libre_Baskerville',Georgia,serif]"
      )}
      lang="en"
      suppressHydrationWarning
    >
      <head>
        <HeadContent />
      </head>
      <body
        className={cn(
          "bg-[var(--background)] text-[var(--foreground)]",
          "subpixel-antialiased"
        )}
      >
        <ThemeProvider>
          <Outlet />
          <Footer />
          <Analytics />
          <ServiceWorkerRegister />
        </ThemeProvider>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

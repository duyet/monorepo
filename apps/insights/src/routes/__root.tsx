import "@duyet/components/styles.css";
import "../styles/globals.css";

import Analytics from "@duyet/components/Analytics";
import ThemeProvider from "@duyet/components/ThemeProvider";
import ThemeToggle from "@duyet/components/ThemeToggle";
import {
  createRootRoute,
  HeadContent,
  Outlet,
  Scripts,
} from "@tanstack/react-router";
import type { ReactNode } from "react";
import { Suspense } from "react";
import { Menu as MenuIcon, X } from "lucide-react";
import { GlobalPeriodSelector } from "@/components/GlobalPeriodSelector";
import { CompactNavigation } from "@/components/navigation/CompactNavigation";

const headerNavItems = [
  { label: "Insights", href: "/" },
  { label: "Blog", href: "https://blog.duyet.net" },
  { label: "Resume", href: "https://cv.duyet.net" },
  { label: "About", href: "https://duyet.net/about" },
];

const statusHref = "https://status.duyet.net";

function NotFoundComponent() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold">404</h1>
        <p className="mt-2 text-muted-foreground">Page not found</p>
        <a href="/" className="mt-4 inline-block text-sm underline">
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
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Libre+Baskerville:wght@400;700&display=swap",
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
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Libre+Baskerville:wght@400;700&display=swap"
        />
      </head>
      <body>
        <ThemeProvider>
          <div className="min-h-screen bg-white text-[#1a1a1a] dark:bg-[#0d0e0c] dark:text-[#f8f8f2]">
            <header className="sticky top-0 z-50 border-b border-[#1a1a1a]/10 bg-white/95 backdrop-blur dark:border-white/10 dark:bg-[#0d0e0c]/95">
              <div className="mx-auto flex max-w-[1280px] items-center justify-between px-5 py-4 sm:px-8 lg:px-10 lg:py-5">
                <a href="/" className="flex items-center gap-3">
                  <DuyetMark />
                  <span className="text-xl font-semibold tracking-tight">
                    Duyet Le
                  </span>
                </a>

                <nav className="hidden items-center gap-7 text-sm font-medium md:flex">
                  {headerNavItems.map((item) => (
                    <HeaderLink key={item.label} href={item.href}>
                      {item.label}
                    </HeaderLink>
                  ))}
                </nav>

                <div className="md:hidden">
                  <details className="group relative">
                    <summary className="flex cursor-pointer list-none rounded-lg p-1.5 text-neutral-700 hover:bg-[#1a1a1a]/5 hover:text-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 dark:text-neutral-300 dark:hover:bg-white/5 dark:hover:text-neutral-100 dark:focus-visible:ring-neutral-500 [&::-webkit-details-marker]:hidden">
                      <span className="sr-only">Toggle menu</span>
                      <MenuIcon className="size-5 group-open:hidden" />
                      <X className="hidden size-5 group-open:block" />
                    </summary>
                    <div className="absolute right-0 top-full z-50 mt-3 w-[min(280px,calc(100vw-2rem))] rounded-xl border border-[#1a1a1a]/10 bg-white p-4 shadow-lg dark:border-white/10 dark:bg-[#1a1a1a]">
                      <nav className="flex flex-col items-start gap-3 text-sm font-medium">
                        {headerNavItems.map((item) => (
                          <HeaderLink key={item.label} href={item.href}>
                            {item.label}
                          </HeaderLink>
                        ))}
                      </nav>
                    </div>
                  </details>
                </div>
              </div>
            </header>

            <main className="relative z-10 rounded-b-3xl bg-white pb-16 dark:bg-[#0d0e0c] 2xl:rounded-b-[4rem]">
              <div className="mx-auto max-w-[1280px] px-5 pb-16 pt-6 sm:px-8 lg:px-10">
                <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
                  <CompactNavigation />
                  <GlobalPeriodSelector />
                </div>
                <Outlet />
              </div>
            </main>

            <footer className="sticky bottom-0 bg-white px-5 pb-12 pt-24 dark:bg-[#1a1a1a] sm:px-8 lg:px-10 lg:pb-16 lg:pt-28 xl:pb-20">
              <div className="mx-auto max-w-[1280px]">
                <h2 className="max-w-[820px] text-balance text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
                  Build useful systems, then explain them clearly.
                </h2>
                <div className="my-12 flex flex-wrap items-center gap-4 md:my-16">
                  <a
                    href="https://github.com/duyet"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-lg bg-[#1a1a1a] px-6 py-4 text-base font-medium text-white transition-colors hover:bg-[#444] dark:bg-[#f8f8f2] dark:text-[#0d0e0c] dark:hover:bg-white lg:px-8 lg:text-lg"
                  >
                    GitHub
                  </a>
                  <a
                    href="https://linkedin.com/in/duyet"
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
                    <span>&copy; Duyet Le</span>
                    <Suspense fallback={null}>
                      <ThemeToggle />
                    </Suspense>
                  </div>
                  <div className="flex flex-wrap items-center gap-6 md:justify-end">
                    <a
                      href={statusHref}
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
          </div>

          <Analytics />
        </ThemeProvider>
        <Scripts />
      </body>
    </html>
  );
}

function HeaderLink({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  if (href.startsWith("http")) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    );
  }

  return <a href={href}>{children}</a>;
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

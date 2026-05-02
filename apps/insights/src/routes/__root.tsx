import "@duyet/components/styles.css";
import "../styles/globals.css";

import Analytics from "@duyet/components/Analytics";
import Container from "@duyet/components/Container";
import Footer from "@duyet/components/Footer";
import Header from "@duyet/components/Header";
import ThemeProvider from "@duyet/components/ThemeProvider";
import { insightsConfig } from "@duyet/config";
import {
  createRootRoute,
  HeadContent,
  Outlet,
  Scripts,
} from "@tanstack/react-router";
import { GlobalPeriodSelector } from "@/components/GlobalPeriodSelector";
import { CompactNavigation } from "@/components/navigation/CompactNavigation";

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
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap",
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
          href="https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap"
        />
      </head>
      <body>
        <ThemeProvider>
          <Header
            longText={insightsConfig.header.longText}
            shortText={insightsConfig.header.shortText}
          />

          <main className="relative z-10 rounded-b-3xl bg-[#f8f8f2] text-[#1a1a1a] dark:bg-[#0d0e0c] dark:text-[#f8f8f2] 2xl:rounded-b-[4rem]">
            <Container className="mb-20 max-w-[1360px] px-5 pb-16 pt-6 sm:px-8 lg:px-10">
              <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
                <CompactNavigation />
                <GlobalPeriodSelector />
              </div>
              <div>
                <Outlet />
              </div>
            </Container>
          </main>

          <Footer />
          <Analytics />
        </ThemeProvider>
        <Scripts />
      </body>
    </html>
  );
}

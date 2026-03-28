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
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@100;200;300;400;700&display=swap",
      },
    ],
  }),
  notFoundComponent: NotFoundComponent,
  errorComponent: ({ error }) => (
    <div className="flex min-h-[50vh] items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold">Error</h1>
        <p className="mt-2 text-muted-foreground">{error.message}</p>
        <a href="/" className="mt-4 inline-block text-sm underline">
          Go home
        </a>
      </div>
    </div>
  ),
  component: RootComponent,
});

function RootComponent() {
  return (
    <html lang="en">
      <head>
        <HeadContent />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@100;200;300;400;700&display=swap"
          media="print"
          // @ts-expect-error onLoad is valid on link elements
          onLoad="this.media='all'"
        />
      </head>
      <body>
        <ThemeProvider>
          <Header
            longText={insightsConfig.header.longText}
            shortText={insightsConfig.header.shortText}
          />

          <main>
            <Container className="mb-20">
              <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
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

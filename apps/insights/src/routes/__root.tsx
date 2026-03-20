import "@duyet/components/styles.css";
import "../styles/globals.css";

import Analytics from "@duyet/components/Analytics";
import Container from "@duyet/components/Container";
import Footer from "@duyet/components/Footer";
import Head from "@duyet/components/Head";
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
import { ServiceWorkerProvider } from "@/components/sw/ServiceWorkerProvider";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      {
        title: insightsConfig.metadata.title as string,
      },
      {
        name: "description",
        content: insightsConfig.metadata.description as string,
      },
    ],
    links: [
      {
        rel: "preconnect",
        href: "https://fonts.googleapis.com",
      },
      {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous",
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@100;200;300;400;700&display=swap",
      },
    ],
  }),
  component: RootComponent,
});

function RootComponent() {
  return (
    <html
      className="font-sans"
      lang={insightsConfig.metadata.lang as string}
      suppressHydrationWarning
    >
      <head>
        <HeadContent />
      </head>
      <Head />
      <body
        className="bg-[var(--background)] text-[var(--foreground)] antialiased"
        suppressHydrationWarning
      >
        <ThemeProvider>
          <ServiceWorkerProvider />
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

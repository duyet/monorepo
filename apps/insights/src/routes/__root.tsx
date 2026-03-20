import "@duyet/components/styles.css";
import "../styles/globals.css";

import Analytics from "@duyet/components/Analytics";
import Container from "@duyet/components/Container";
import Footer from "@duyet/components/Footer";
import Head from "@duyet/components/Head";
import Header from "@duyet/components/Header";
import ThemeProvider from "@duyet/components/ThemeProvider";
import { insightsConfig } from "@duyet/config";
import { createRootRoute, Outlet } from "@tanstack/react-router";
import { GlobalPeriodSelector } from "@/components/GlobalPeriodSelector";
import { CompactNavigation } from "@/components/navigation/CompactNavigation";
import { ServiceWorkerProvider } from "@/components/sw/ServiceWorkerProvider";

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  return (
    <ThemeProvider>
      <ServiceWorkerProvider />
      <Head />
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
  );
}

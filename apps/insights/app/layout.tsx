import "@duyet/components/styles.css";
import "./globals.css";

import Analytics from "@duyet/components/Analytics";
import Container from "@duyet/components/Container";
import Footer from "@duyet/components/Footer";
import Head from "@duyet/components/Head";
import Header from "@duyet/components/Header";
import ThemeProvider from "@duyet/components/ThemeProvider";
import { insightsConfig } from "@duyet/config";
import { GlobalPeriodSelector } from "../components/GlobalPeriodSelector";
import { CompactNavigation } from "../components/navigation/CompactNavigation";
import { ServiceWorkerProvider } from "../components/sw/ServiceWorkerProvider";

export const metadata = insightsConfig.metadata;

interface LayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: LayoutProps) {
  return (
    <html
      lang={insightsConfig.metadata.lang}
      suppressHydrationWarning
    >
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
              <div>{children}</div>
            </Container>
          </main>

          <Footer />
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  );
}

import "@duyet/components/styles.css";
import "./globals.css";

import Analytics from "@duyet/components/Analytics";
import Container from "@duyet/components/Container";
import Footer from "@duyet/components/Footer";
import Head from "@duyet/components/Head";
import Header from "@duyet/components/Header";
import ThemeProvider from "@duyet/components/ThemeProvider";
import { insightsConfig } from "@duyet/config";
import { Inter } from "next/font/google";
import { GlobalPeriodSelector } from "../components/GlobalPeriodSelector";
import { CompactNavigation } from "../components/navigation/CompactNavigation";
import { ServiceWorkerProvider } from "../components/sw/ServiceWorkerProvider";

// Note: Next.js font loaders require literal values, so we use the config as reference
// but must provide literals here. Config values are defined in @duyet/config for documentation.
const inter = Inter({
  weight: ["100", "200", "300", "400", "700"],
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata = insightsConfig.metadata;

interface LayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: LayoutProps) {
  return (
    <html
      className={inter.className}
      lang={insightsConfig.metadata.lang}
      suppressHydrationWarning
    >
      <Head />
      <body className="bg-[var(--background)] text-[var(--foreground)] antialiased">
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

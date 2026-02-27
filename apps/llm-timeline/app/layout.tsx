import "@duyet/components/styles.css";
import "./globals.css";

import Analytics from "@duyet/components/Analytics";
import Head from "@duyet/components/Head";
import Header from "@duyet/components/Header";
import ThemeProvider from "@duyet/components/ThemeProvider";
import { cn } from "@duyet/libs/utils";
import { DM_Serif_Display, IBM_Plex_Mono, DM_Sans } from "next/font/google";

const dmSerifDisplay = DM_Serif_Display({
  weight: ["400"],
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const ibmPlexMono = IBM_Plex_Mono({
  weight: ["400", "500", "600"],
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

const dmSans = DM_Sans({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata = {
  title: "LLM Timeline | duyet.net",
  description: "Interactive timeline of Large Language Model releases from 2017 to present.",
  alternates: {
    types: {
      'application/rss+xml': [
        { url: 'https://llm-timeline.duyet.net/rss.xml', title: 'LLM Timeline — Model Releases' }
      ]
    }
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      className={cn(dmSans.variable, dmSerifDisplay.variable, ibmPlexMono.variable)}
      lang="en"
      suppressHydrationWarning
    >
      <Head />
      <body
        className={cn(
          "subpixel-antialiased",
          "transition-colors duration-300"
        )}
      >
        <ThemeProvider>
          {children}
          <div className="border-t border-neutral-200 dark:border-neutral-700">
            <Header logo={false} longText="LLM Timeline" shortText="LLM Timeline" />
            <div className="mx-auto max-w-7xl px-4 py-3 text-center text-xs text-neutral-500 dark:text-neutral-400">
              Data sources: Curated +{' '}
              <a
                href="https://epoch.ai/data"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-neutral-700 dark:hover:text-neutral-300"
              >
                Epoch AI
              </a>{' '}
              (CC BY 4.0)
            </div>
          </div>
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  );
}

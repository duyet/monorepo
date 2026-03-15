import "@duyet/components/styles.css";
import "./globals.css";
import "./animations.css";

import Analytics from "@duyet/components/Analytics";
import Head from "@duyet/components/Head";
import ThemeProvider from "@duyet/components/ThemeProvider";
import { cn } from "@duyet/libs/utils";
import type { Metadata, Viewport } from "next";
import { DM_Sans, DM_Serif_Display, IBM_Plex_Mono } from "next/font/google";

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

export const metadata: Metadata = {
  title: "LLM Timeline | duyet.net",
  description:
    "Interactive timeline of Large Language Model releases from 2017 to present.",
  alternates: {
    types: {
      "application/rss+xml": [
        {
          url: "https://llm-timeline.duyet.net/rss.xml",
          title: "LLM Timeline — Model Releases",
        },
      ],
    },
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fbf7f0" },
    { media: "(prefers-color-scheme: dark)", color: "#1f1f1f" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      className={cn(
        dmSans.variable,
        dmSerifDisplay.variable,
        ibmPlexMono.variable
      )}
      lang="en"
      suppressHydrationWarning
    >
      <Head />
      <body
        className={cn(
          "text-neutral-900 dark:text-neutral-100",
          "subpixel-antialiased",
          "transition-colors duration-300"
        )}
      >
        <ThemeProvider>
          {children}
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  );
}

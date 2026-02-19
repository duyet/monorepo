import "@duyet/components/styles.css";
import "./globals.css";

import Analytics from "@duyet/components/Analytics";
import Footer from "@duyet/components/Footer";
import Head from "@duyet/components/Head";
import ThemeProvider from "@duyet/components/ThemeProvider";
import { agentsConfig } from "@duyet/config";
import { cn } from "@duyet/libs/utils";
import { Geist, Geist_Mono } from "next/font/google";

const geist = Geist({
  variable: "--font-geist",
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  display: "swap",
});

export const metadata = agentsConfig.metadata;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      className={cn(geist.variable, geistMono.variable)}
      lang={agentsConfig.metadata.lang}
      suppressHydrationWarning
    >
      <Head />
      <body
        className={cn(
          "bg-[var(--background)] text-[var(--foreground)] subpixel-antialiased",
          "transition-colors duration-1000"
        )}
      >
        <ThemeProvider>
          {children}
          <Footer />
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  );
}

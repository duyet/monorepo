import "@duyet/components/styles.css";
import "./globals.css";

import Analytics from "@duyet/components/Analytics";
import Head from "@duyet/components/Head";
import { agentsConfig } from "@duyet/config";
import { cn } from "@duyet/libs/utils";
import { Geist_Mono, Inter, Libre_Baskerville } from "next/font/google";
import { Providers } from "@/components/providers";

const inter = Inter({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const libreBaskerville = Libre_Baskerville({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-serif",
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
      className={cn(
        inter.variable,
        libreBaskerville.variable,
        geistMono.variable
      )}
      lang={agentsConfig.metadata.lang}
      suppressHydrationWarning
    >
      <Head />
      <body
        className={cn(
          "text-claude-black subpixel-antialiased",
          "dark:bg-claude-gray-900 dark:text-claude-gray-50 transition-colors duration-300",
          "font-sans"
        )}
      >
        <Providers>
          {children}
          <Analytics />
        </Providers>
      </body>
    </html>
  );
}

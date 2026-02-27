import "@duyet/components/styles.css";
import "./globals.css";

import Analytics from "@duyet/components/Analytics";
import Footer from "@duyet/components/Footer";
import Head from "@duyet/components/Head";
import { Providers } from "@/components/providers";
import { agentsConfig } from "@duyet/config";
import { cn } from "@duyet/libs/utils";
import { Inter, Libre_Baskerville, Geist_Mono } from "next/font/google";

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
      className={cn(inter.variable, libreBaskerville.variable, geistMono.variable)}
      lang={agentsConfig.metadata.lang}
      suppressHydrationWarning
    >
      <Head />
      <body
        className={cn(
          "bg-[var(--background)] text-[var(--foreground)] subpixel-antialiased",
          "font-[family-name:var(--font-inter)]",
          "transition-colors duration-300"
        )}
      >
        <Providers>
          <div className="flex h-screen flex-col overflow-hidden">
            <main className="flex-1 overflow-hidden">{children}</main>
          </div>
          <Footer className="shrink-0" />
          <Analytics />
        </Providers>
      </body>
    </html>
  );
}

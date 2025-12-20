import "@duyet/components/styles.css";
import "./globals.css";

import Analytics from "@duyet/components/Analytics";
import Footer from "@duyet/components/Footer";
import Head from "@duyet/components/Head";
import ThemeProvider from "@duyet/components/ThemeProvider";
import { blogConfig } from "@duyet/config";
import { cn } from "@duyet/libs/utils";
// import { AxiomWebVitals } from 'next-axiom'
import { Inter, Libre_Baskerville } from "next/font/google";

// Note: Next.js font loaders require literal values, so we use the config as reference
// but must provide literals here. Config values are defined in @duyet/config for documentation.
const inter = Inter({
  weight: ["400", "700"],
  subsets: ["latin", "vietnamese"],
  variable: "--font-inter",
  display: "swap",
});

const libreBaskerville = Libre_Baskerville({
  weight: ["400", "700"],
  subsets: ["latin", "latin-ext"],
  variable: "--font-serif",
  display: "swap",
});

export const metadata = blogConfig.metadata;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      className={cn(inter.variable, libreBaskerville.variable)}
      lang={blogConfig.metadata.lang}
      style={{
        fontFamily: blogConfig.fontFamily,
      }}
      suppressHydrationWarning
    >
      <Head />
      {/* <AxiomWebVitals /> */}
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

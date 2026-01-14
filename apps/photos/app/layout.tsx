import "./globals.css";

import Analytics from "@duyet/components/Analytics";
import Head from "@duyet/components/Head";
import ThemeProvider from "@duyet/components/ThemeProvider";
import { cn } from "@duyet/libs/utils";
import { Inter, Libre_Baskerville } from "next/font/google";
import PhotoNav from "@/components/PhotoNav";

const inter = Inter({
  weight: ["400", "700"],
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

export const metadata = {
  title: "Photos | Duyệt",
  description:
    "A curated collection of photography by Duyệt - Data Engineer and photographer. Explore stunning landscapes, portraits, and street photography.",
  keywords:
    "photography, portfolio, Duyet, landscape, portrait, street photography, art",
  authors: [{ name: "Duyệt", url: "https://duyet.net" }],
  creator: "Duyệt",
  openGraph: {
    title: "Photos | Duyệt",
    description: "A curated collection of photography by Duyệt",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Photos | Duyệt",
    description: "A curated collection of photography by Duyệt",
    creator: "@_duyet",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      className={cn(inter.variable, libreBaskerville.variable)}
      lang="en"
      style={{
        fontFamily:
          "var(--font-inter), -apple-system, BlinkMacSystemFont, ui-sans-serif, system-ui, sans-serif",
      }}
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
          <div className="flex min-h-screen flex-col">
            <PhotoNav />
            <main className="mt-16 flex-1">{children}</main>
          </div>
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  );
}

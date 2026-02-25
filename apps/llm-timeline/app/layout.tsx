import "@duyet/components/styles.css";
import "./globals.css";

import Analytics from "@duyet/components/Analytics";
import Head from "@duyet/components/Head";
import ThemeProvider from "@duyet/components/ThemeProvider";
import { cn } from "@duyet/libs/utils";
import { Inter } from "next/font/google";

const inter = Inter({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata = {
  title: "LLM Timeline | duyet.net",
  description: "Interactive timeline of Large Language Model releases from 2017 to present.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html className={cn(inter.variable)} lang="en" suppressHydrationWarning>
      <Head />
      <body
        className={cn(
          "text-claude-black subpixel-antialiased",
          "dark:bg-claude-gray-900 dark:text-claude-gray-50 transition-colors duration-300"
        )}
      >
        <ThemeProvider>{children}</ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}

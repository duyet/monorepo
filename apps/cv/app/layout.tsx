import "@duyet/components/styles.css";
import "./globals.css";

import Analytics from "@duyet/components/Analytics";
import Container from "@duyet/components/Container";
import Footer from "@duyet/components/Footer";
import Head from "@duyet/components/Head";
import Header from "@duyet/components/Header";
import { ABOUT, BLOG, HOME, INSIGHTS, PHOTOS } from "@duyet/components/Menu";
import ThemeProvider from "@duyet/components/ThemeProvider";
import { Inter, Lora } from "next/font/google";

const inter = Inter({
  weight: ["300", "400", "700"],
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const lora = Lora({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-lora",
  display: "swap",
});

export const metadata = {
  title: "Duyet Le | Resume",
  description: "",
};

interface LayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: LayoutProps) {
  return (
    <html
      className={`${inter.variable} ${lora.variable}`}
      lang="en"
      style={{
        width: "100%",
        margin: 0,
        padding: 0,

        fontFamily:
          "-apple-system, BlinkMacSystemFont, ui-sans-serif, system-ui, var(--font-inter)",
      }}
      suppressHydrationWarning
    >
      <Head />

      <body className="bg-[var(--background)] text-[var(--foreground)] antialiased">
        <ThemeProvider>
          <main>
            <Container className="mb-20 mt-10 min-h-screen max-w-3xl md:mt-20 print:mb-10 print:mt-10">
              {children}
            </Container>
          </main>
          <div className="border-t print:hidden">
            <Header
              logo={false}
              containerClassName="max-w-3xl"
              longText="Resume"
              navigationItems={[HOME, BLOG, PHOTOS, INSIGHTS, ABOUT]}
              shortText="CV"
            />
          </div>
          <Footer className="print:hidden" containerClassName="max-w-3xl" />
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  );
}

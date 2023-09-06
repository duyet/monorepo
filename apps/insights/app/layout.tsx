import './globals.css';
import '@duyet/components/styles.css';

import { Inter } from 'next/font/google';
import {
  Header,
  Footer,
  Analytics,
  ThemeProvider,
  Container,
  Head,
} from '@duyet/components';

const inter = Inter({
  weight: ['100', '200', '300', '400', '700'],
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata = {
  title: 'Insights | duyet.net',
  description: 'Insights for duyet.net',
};

interface LayoutProps {
  cloudflare: React.ReactNode;
  wakatime: React.ReactNode;
  github: React.ReactNode;
}

export default function RootLayout({
  cloudflare,
  wakatime,
  github,
}: LayoutProps) {
  return (
    <html className={inter.className} lang="en">
      <Head />
      <body className="bg-white text-gray-700 antialiased dark:bg-slate-900 dark:text-slate-50">
        <ThemeProvider>
          <Header longText="Insights" shortText="Insights" />
          <main>
            <Container className="mb-20">
              {cloudflare}
              {wakatime}
              {github}
            </Container>
          </main>
          <Footer />
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  );
}

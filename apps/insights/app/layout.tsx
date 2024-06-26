import './globals.css';

import Analytics from '@duyet/components/Analytics';
import Container from '@duyet/components/Container';
import Footer from '@duyet/components/Footer';
import Head from '@duyet/components/Head';
import Header from '@duyet/components/Header';
import ThemeProvider from '@duyet/components/ThemeProvider';
import { Inter } from 'next/font/google';
import { Tabs } from '../components/tabs';

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
  children: React.ReactNode;
}

export default function RootLayout({ children }: LayoutProps) {
  return (
    <html className={inter.className} lang="en">
      <Head />
      <body className="bg-white text-gray-700 antialiased dark:bg-slate-900 dark:text-slate-50">
        <ThemeProvider>
          <Header longText="Insights" shortText="Insights" />

          <main>
            <Container className="mb-20">
              <div>
                <Tabs
                  tabs={[
                    { text: 'Blog', href: '/blog' },
                    { text: 'GitHub', href: '/github' },
                    { text: 'Wakatime', href: '/wakatime' },
                  ]}
                />
              </div>
              <div className="mt-10">{children}</div>
            </Container>
          </main>

          <Footer />
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  );
}

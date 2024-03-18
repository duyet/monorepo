import '@duyet/components/styles.css';
import './globals.css';

import Analytics from '@duyet/components/Analytics';
import Auth0Provider from '@duyet/components/Auth0Provider';
import Footer from '@duyet/components/Footer';
import Head from '@duyet/components/Head';
import Header from '@duyet/components/Header';
import ThemeProvider from '@duyet/components/ThemeProvider';
import { Inter } from 'next/font/google';

const inter = Inter({
  weight: ['100', '200', '300', '400', '700'],
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata = {
  title: 'Tôi là Duyệt',
  description:
    'Data Engineer. I blog about data engineering, bigdata, rust and more',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html className={inter.className} lang="en">
      <Head />
      <body className="bg-white text-gray-700 antialiased dark:bg-slate-900 dark:text-slate-50">
        <Auth0Provider>
          <ThemeProvider>
            <Header />
            <main>{children}</main>
            <Footer />
            <Analytics />
          </ThemeProvider>
        </Auth0Provider>
      </body>
    </html>
  );
}

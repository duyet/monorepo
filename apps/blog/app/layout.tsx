import './globals.css';
import '@duyet/components/styles.css';

import { Inter } from 'next/font/google';
import {
  Header,
  Footer,
  Analytics,
  ThemeProvider,
  Auth0Provider,
} from '@duyet/components';
import Logo from '../public/duyet-notion.svg';

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
      <head>
        <meta charSet="utf-8" />
        <meta content="follow, index" name="robots" />
        <meta content="ie=edge" httpEquiv="x-ua-compatible" />
        <link href="/icon.svg" rel="icon" sizes="any" />
      </head>
      <body className="bg-white text-gray-700 antialiased dark:bg-slate-900 dark:text-slate-50">
        <Auth0Provider>
          <ThemeProvider>
            <Header
              logo={Logo} // eslint-disable-line -- TODO: what is the type of logo?
            />
            <main>{children}</main>
            <Footer />
            <Analytics />
          </ThemeProvider>
        </Auth0Provider>
      </body>
    </html>
  );
}
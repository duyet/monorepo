import './globals.css';
import '@duyet/components/styles.css';

import {
  Head,
  Analytics,
  ThemeProvider,
  Header,
  Footer,
} from '@duyet/components';

export const metadata = {
  title: 'Duyet Photos',
  description: '',
};

interface LayoutProps {
  children: React.ReactNode;
  modal: React.ReactNode;
}

export default function RootLayout({ children }: LayoutProps) {
  return (
    <html lang="en" style={{ width: '100%', margin: 0, padding: 0 }}>
      <Head />

      <body className="bg-white text-gray-700 antialiased dark:bg-slate-900 dark:text-slate-50">
        <ThemeProvider>
          <Header longText={metadata.title} shortText="Photos" />
          {children}
          <Footer />
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  );
}

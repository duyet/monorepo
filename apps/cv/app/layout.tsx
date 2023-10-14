import './globals.css';
import '@duyet/components/styles.css';

import {
  Head,
  Analytics,
  ThemeProvider,
  Header,
  Container,
  Footer,
} from '@duyet/components';

export const metadata = {
  title: 'Duyet Resume',
  description: '',
};

interface LayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: LayoutProps) {
  return (
    <html lang="en" style={{ width: '100%', margin: 0, padding: 0 }}>
      <Head />

      <body className="bg-white text-gray-700 antialiased dark:bg-slate-900 dark:text-slate-50">
        <ThemeProvider>
          <Header longText={metadata.title} shortText="CV" />
          <main>
            <Container className="mb-20 min-h-screen">{children}</Container>
          </main>
          <Footer />
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  );
}

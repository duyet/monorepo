import './globals.css';
import '@duyet/components/styles.css';

import { Head, Analytics } from '@duyet/components';

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
      <body style={{ margin: 0, padding: 0 }}>{children}</body>
      <Analytics />
    </html>
  );
}

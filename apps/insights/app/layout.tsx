import './globals.css';

import Analytics from '@duyet/components/Analytics';
import Container from '@duyet/components/Container';
import Footer from '@duyet/components/Footer';
import Head from '@duyet/components/Head';
import Header from '@duyet/components/Header';
import ThemeProvider from '@duyet/components/ThemeProvider';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@duyet/components/ui/tabs';
import { Inter } from 'next/font/google';

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
  posthog: React.ReactNode;
  wakatime: React.ReactNode;
  github: React.ReactNode;
}

export default function RootLayout({
  cloudflare,
  posthog,
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
              <Tabs defaultValue="blog">
                <TabsList className="mb-3 text-muted-foreground">
                  <TabsTrigger value="blog">Blog Insights</TabsTrigger>
                  <TabsTrigger value="wakatime">Wakatime</TabsTrigger>
                  <TabsTrigger value="github">Github</TabsTrigger>
                </TabsList>
                <TabsContent value="blog">
                  {cloudflare}
                  {posthog}
                </TabsContent>
                <TabsContent value="wakatime">{wakatime}</TabsContent>
                <TabsContent value="github">{github}</TabsContent>
              </Tabs>
            </Container>
          </main>

          <Footer />
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  );
}

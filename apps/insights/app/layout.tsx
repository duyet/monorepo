import '@duyet/components/styles.css'
import './globals.css'

import Analytics from '@duyet/components/Analytics'
import Container from '@duyet/components/Container'
import Footer from '@duyet/components/Footer'
import Head from '@duyet/components/Head'
import Header from '@duyet/components/Header'
import ThemeProvider from '@duyet/components/ThemeProvider'
import { Inter } from 'next/font/google'
import { GlobalPeriodSelector } from '../components/GlobalPeriodSelector'
import { CompactNavigation } from '../components/navigation/CompactNavigation'

const inter = Inter({
  weight: ['100', '200', '300', '400', '700'],
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
})

export const metadata = {
  title: 'Insights | duyet.net',
  description: 'Insights for duyet.net',
}

interface LayoutProps {
  children: React.ReactNode
}

export default function RootLayout({ children }: LayoutProps) {
  return (
    <html className={inter.className} lang="en" suppressHydrationWarning>
      <Head />
      <body className="bg-[var(--background)] text-[var(--foreground)] antialiased">
        <ThemeProvider>
          <Header longText="Insights" shortText="Insights" />

          <main>
            <Container className="mb-20">
              <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                <CompactNavigation />
                <GlobalPeriodSelector />
              </div>
              <div>{children}</div>
            </Container>
          </main>

          <Footer />
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  )
}

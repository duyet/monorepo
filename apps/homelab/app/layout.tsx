import '@duyet/components/styles.css'
import './globals.css'

import Analytics from '@duyet/components/Analytics'
import Container from '@duyet/components/Container'
import Footer from '@duyet/components/Footer'
import Head from '@duyet/components/Head'
import Header from '@duyet/components/Header'
import ThemeProvider from '@duyet/components/ThemeProvider'
import { homelabConfig } from '@duyet/config'
import { Inter } from 'next/font/google'

const inter = Inter({
  weight: ['100', '200', '300', '400', '700'],
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
})

export const metadata = homelabConfig.metadata

interface LayoutProps {
  children: React.ReactNode
}

export default function RootLayout({ children }: LayoutProps) {
  return (
    <html
      className={inter.className}
      lang={homelabConfig.metadata.lang}
      suppressHydrationWarning
    >
      <Head />
      <body className="bg-[var(--background)] text-[var(--foreground)] antialiased">
        <ThemeProvider>
          <Header
            longText={homelabConfig.header.longText}
            shortText={homelabConfig.header.shortText}
          />

          <main>
            <Container className="mb-20">
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

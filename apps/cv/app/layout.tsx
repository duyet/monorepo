import '@duyet/components/styles.css'
import './globals.css'

import Analytics from '@duyet/components/Analytics'
import Container from '@duyet/components/Container'
import Footer from '@duyet/components/Footer'
import Head from '@duyet/components/Head'
import Header from '@duyet/components/Header'
import { ABOUT, BLOG, INSIGHTS } from '@duyet/components/Menu'
import ThemeProvider from '@duyet/components/ThemeProvider'
import { Bodoni_Moda as Bodoni, Inter } from 'next/font/google'

const inter = Inter({
  weight: ['300', '400', '700'],
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const bodoni = Bodoni({
  weight: ['400', '700'],
  subsets: ['latin'],
  variable: '--font-bodoni',
  display: 'swap',
})

export const metadata = {
  title: 'Duyet Le | Resume',
  description: '',
}

interface LayoutProps {
  children: React.ReactNode
}

export default function RootLayout({ children }: LayoutProps) {
  return (
    <html
      className={`${inter.variable} ${bodoni.variable}`}
      lang="en"
      style={{
        width: '100%',
        margin: 0,
        padding: 0,

        fontFamily:
          '-apple-system, BlinkMacSystemFont, ui-sans-serif, system-ui, var(--font-inter)',
      }}
    >
      <Head />

      <body className="bg-white text-gray-700 antialiased dark:bg-slate-900 dark:text-slate-50">
        <ThemeProvider>
          <Header
            className="print:hidden"
            containerClassName="max-w-3xl"
            longText="Resume"
            navigationItems={[BLOG, ABOUT, INSIGHTS]}
            shortText="CV"
          />
          <main>
            <Container className="mb-20 min-h-screen max-w-3xl">
              {children}
            </Container>
          </main>
          <Footer className="print:hidden" containerClassName="max-w-3xl" />
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  )
}

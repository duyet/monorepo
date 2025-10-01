import '@duyet/components/styles.css'
import './globals.css'

import Analytics from '@duyet/components/Analytics'
import Footer from '@duyet/components/Footer'
import Head from '@duyet/components/Head'
import ThemeProvider from '@duyet/components/ThemeProvider'
import { cn } from '@duyet/libs/utils'
// import { AxiomWebVitals } from 'next-axiom'
import { Inter } from 'next/font/google'

const inter = Inter({
  weight: ['400', '700'],
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata = {
  title: 'Tôi là Duyệt',
  description: 'Data Engineer. I blog about Data Engineering, Rust and more',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      className={inter.variable}
      lang="en"
      style={{
        fontFamily:
          '-apple-system, BlinkMacSystemFont, ui-sans-serif, system-ui, var(--font-inter)',
      }}
      suppressHydrationWarning
    >
      <Head />
      {/* <AxiomWebVitals /> */}
      <body
        className={cn(
          'bg-beige-100 text-beige-900 subpixel-antialiased',
          'transition-colors duration-1000 dark:bg-brown-800 dark:text-brown-50',
        )}
      >
        <ThemeProvider>
          {children}
          <Footer />
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  )
}

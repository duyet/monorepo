import '@duyet/components/styles.css'
import './globals.css'

import Analytics from '@duyet/components/Analytics'
import Footer from '@duyet/components/Footer'
import Head from '@duyet/components/Head'
import ThemeProvider from '@duyet/components/ThemeProvider'
import { cn } from '@duyet/libs/utils'
// import { AxiomWebVitals } from 'next-axiom'
import { Inter, Libre_Baskerville } from 'next/font/google'

const inter = Inter({
  weight: ['400', '700'],
  subsets: ['latin', 'vietnamese'],
  variable: '--font-inter',
  display: 'swap',
})

const libreBaskerville = Libre_Baskerville({
  weight: ['400', '700'],
  subsets: ['latin', 'latin-ext'],
  variable: '--font-serif',
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
      className={cn(inter.variable, libreBaskerville.variable)}
      lang="en"
      style={{
        fontFamily:
          'var(--font-inter), -apple-system, BlinkMacSystemFont, ui-sans-serif, system-ui, sans-serif',
      }}
      suppressHydrationWarning
    >
      <Head />
      {/* <AxiomWebVitals /> */}
      <body
        className={cn(
          'bg-[var(--background)] text-[var(--foreground)] subpixel-antialiased',
          'transition-colors duration-1000',
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

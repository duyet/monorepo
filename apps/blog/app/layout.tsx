import '@duyet/components/styles.css'
import './globals.css'

import Analytics from '@duyet/components/Analytics'
import Footer from '@duyet/components/Footer'
import Head from '@duyet/components/Head'
import ThemeProvider from '@duyet/components/ThemeProvider'
import { cn } from '@duyet/libs/utils'
// import { AxiomWebVitals } from 'next-axiom'
import { Inter, Tinos } from 'next/font/google'

const inter = Inter({
  weight: ['400', '700'],
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const tinos = Tinos({
  weight: ['400', '700'],
  subsets: ['latin'],
  variable: '--font-tinos',
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
      className={`${inter.variable} ${tinos.variable}`}
      lang="en"
      suppressHydrationWarning
    >
      <Head />
      {/* <AxiomWebVitals /> */}
      <body
        className={cn(
          'text-beige-900 subpixel-antialiased',
          'transition-colors duration-1000 dark:bg-brown-800 dark:text-brown-50',
        )}
        style={{
          backgroundColor: '#faf9f5',
        }}
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

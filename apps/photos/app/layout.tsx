import './globals.css'

import Analytics from '@duyet/components/Analytics'
import Footer from '@duyet/components/Footer'
import Head from '@duyet/components/Head'
import Header from '@duyet/components/Header'
import ThemeProvider from '@duyet/components/ThemeProvider'
import { cn } from '@duyet/libs/utils'
import { Inter } from 'next/font/google'

const inter = Inter({
  weight: ['400', '700'],
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata = {
  title: 'Photos | Duyệt',
  description:
    'A curated collection of photography by Duyệt - Data Engineer and photographer. Explore stunning landscapes, portraits, and street photography.',
  keywords:
    'photography, portfolio, Duyet, landscape, portrait, street photography, art',
  authors: [{ name: 'Duyệt', url: 'https://duyet.net' }],
  creator: 'Duyệt',
  openGraph: {
    title: 'Photos | Duyệt',
    description: 'A curated collection of photography by Duyệt',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Photos | Duyệt',
    description: 'A curated collection of photography by Duyệt',
    creator: '@_duyet',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
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
      <body
        className={cn(
          'bg-[var(--background)] text-[var(--foreground)] subpixel-antialiased',
          'transition-colors duration-1000',
        )}
      >
        <ThemeProvider>
          <div className="flex min-h-screen flex-col">
            <Header longText="Photos" shortText="Photos" />
            <main className="flex-1" role="main">
              {children}
            </main>
            <Footer />
          </div>
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  )
}

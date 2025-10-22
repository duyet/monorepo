import '@duyet/components/styles.css'
import './globals.css'

import Analytics from '@duyet/components/Analytics'
import Head from '@duyet/components/Head'
import ThemeProvider from '@duyet/components/ThemeProvider'
import { cn } from '@duyet/libs/utils'
import { Inter, Libre_Baskerville } from 'next/font/google'

const inter = Inter({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const libreBaskerville = Libre_Baskerville({
  weight: ['400', '700'],
  subsets: ['latin'],
  variable: '--font-serif',
  display: 'swap',
})

export const metadata = {
  title: 'Duyet Le - Data Engineer',
  description:
    'Data Engineer. I build data infrastructure and love Rust, TypeScript, and open source.',
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
      suppressHydrationWarning
    >
      <Head />
      <body
        className={cn(
          'text-claude-black subpixel-antialiased',
          'transition-colors duration-300 dark:bg-claude-gray-900 dark:text-claude-gray-50',
        )}
      >
        <ThemeProvider>
          {children}
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  )
}

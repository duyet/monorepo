import '@duyet/components/styles.css'
import './globals.css'

import Analytics from '@duyet/components/Analytics'
import Head from '@duyet/components/Head'
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
  title: 'Duyet Le - Data Engineer',
  description: 'Data Engineer. I build data infrastructure and love Rust, TypeScript, and open source.',
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
          'bg-white text-gray-700 subpixel-antialiased',
          'transition-colors duration-1000 dark:bg-slate-900 dark:text-slate-50',
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
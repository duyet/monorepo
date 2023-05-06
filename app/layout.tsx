import 'tailwindcss/tailwind.css'
import { Inter } from 'next/font/google'

import Header from '../components/Header'
import Footer from '../components/Footer'
import Analytics from '../components/Analytics'
import ThemeProvider from '../components/ThemeProvider'
import Auth0Provider from '../components/Auth0Provider'

const inter = Inter({
  weight: ['100', '200', '300', '400', '700'],
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
})

export const metadata = {
  title: 'Tôi là Duyệt',
  description:
    'Data Engineer @ Fossil. I blog about web development, machine learning, data engineering and more',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang='en' className={inter.className}>
      <head>
        <meta charSet='utf-8' />
        <meta name='robots' content='follow, index' />
        <meta httpEquiv='x-ua-compatible' content='ie=edge' />
        <link rel='icon' href='/icon.svg' sizes='any' />
      </head>
      <body className='bg-white text-gray-700 antialiased dark:bg-slate-900 dark:text-slate-50'>
        <Auth0Provider>
          <ThemeProvider>
            <Header />
            <main>{children}</main>
            <Footer />
            <Analytics />
          </ThemeProvider>
        </Auth0Provider>
      </body>
    </html>
  )
}

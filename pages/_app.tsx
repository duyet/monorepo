import 'tailwindcss/tailwind.css'

import Head from 'next/head'
import Script from 'next/script'
import type { AppProps } from 'next/app'
import { Auth0Provider } from '@auth0/auth0-react'

import Header from '../components/Header'
import Footer from '../components/Footer'
import Analytics from '../components/Analytics'

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <Auth0Provider
      clientId={process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID}
      domain={process.env.NEXT_PUBLIC_AUTH0_DOMAIN}
    >
      <Head>
        <title>Tôi là Duyệt</title>
        <meta name='viewport' content='width=device-width, initial-scale=1' />
        <meta
          name='description'
          content='Data Engineer @ Fossil. I blog about web development, machine learning, data engineering and more.'
        />
      </Head>

      <Header />

      <main className='py-5'>
        <Component {...pageProps} />
      </main>

      <Footer />

      <Analytics />

    </Auth0Provider>
  )
}

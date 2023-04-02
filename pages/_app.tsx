import 'tailwindcss/tailwind.css'

import Head from 'next/head'
import type { AppProps } from 'next/app'
import { Auth0Provider } from '@auth0/auth0-react'

import Header from '../components/Header'

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <Auth0Provider
      clientId={process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID}
      domain={process.env.NEXT_PUBLIC_AUTH0_DOMAIN}
    >
      <Head>
        <meta name='viewport' content='width=device-width, initial-scale=1' />
        <meta
          name='description'
          content='Data Engineer @ Fossil. I blog about web development, machine learning, data engineering and more.'
        />
        <title>Tôi là Duyệt</title>
      </Head>

      <Header />

      <main className='py-5'>
        <Component {...pageProps} />
      </main>
    </Auth0Provider>
  )
}

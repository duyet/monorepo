import 'tailwindcss/tailwind.css'

import Head from 'next/head'
import Script from 'next/script'
import type { AppProps } from 'next/app'
import { Auth0Provider } from '@auth0/auth0-react'

import Header from '../components/Header'
import Footer from '../components/Footer'

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_MEASUREMENT_ID

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

      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy='afterInteractive'
      />

      <Script id='google-analytics' strategy='afterInteractive'>
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){window.dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_MEASUREMENT_ID}');
        `}
      </Script>

      <Script id='pageview' strategy='afterInteractive'>
        {`
          !function(e,n,t){e.onload=function(){
          let e=n.createElement("script");
          e.src=t,n.body.appendChild(e)}}
          (window,document,"//pageview.duyet.net/pageview.js");
        `}
      </Script>
    </Auth0Provider>
  )
}

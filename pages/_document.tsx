import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang='en' className=''>
      <Head>
        <meta charSet='utf-8' />
        <meta name='robots' content='follow, index' />
        <meta httpEquiv='x-ua-compatible' content='ie=edge' />
      </Head>
      <body className='bg-white text-gray-700 antialiased dark:bg-slate-900 dark:text-slate-50'>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}

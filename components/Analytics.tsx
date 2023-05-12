import Script from 'next/script'
import { Analytics } from '@vercel/analytics/react'

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_MEASUREMENT_ID

export default function AnalyticWrapper() {
  return (
    <>
      <Analytics />

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
      <Script id='clarity' strategy='afterInteractive'>
        {`
          (function(c,l,a,r,i,t,y){
            c[a] = c[a] || function() { (c[a].q = c[a].q || []).push(arguments) };
            t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
            y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
          })(window, document, "clarity", "script", "h2lw6wemnl");
      `}
      </Script>
    </>
  )
}

import { useEffect } from "react";

const GA_MEASUREMENT_ID = import.meta.env.VITE_MEASUREMENT_ID;
const POSTHOG_API_KEY = import.meta.env.VITE_POSTHOG_KEY;
const SELINE_TOKEN = import.meta.env.VITE_SELINE_TOKEN;

function loadScript(
  src: string,
  id: string,
  dataset?: Record<string, string>,
): void {
  if (document.getElementById(id)) return;
  const el = document.createElement("script");
  el.id = id;
  el.src = src;
  el.async = true;
  if (dataset) {
    for (const [k, v] of Object.entries(dataset)) {
      el.dataset[k] = v;
    }
  }
  document.head.appendChild(el);
}

function inlineScript(id: string, code: string): void {
  if (document.getElementById(id)) return;
  const el = document.createElement("script");
  el.id = id;
  el.textContent = code;
  document.head.appendChild(el);
}

export function AnalyticsScripts() {
  useEffect(() => {
    // Pageview
    inlineScript(
      "pageview",
      `!function(e,n,t){e.onload=function(){let e=n.createElement("script");e.src=t,n.body.appendChild(e)}}(window,document,"//pageview.duyet.net/pageview.js");`,
    );

    // Clarity
    inlineScript(
      "clarity",
      `(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window,document,"clarity","script","h2lw6wemnl");`,
    );

    // Jitsu
    loadScript("https://j.duyet.net/p.js", "jitsu");

    // Google Analytics
    if (GA_MEASUREMENT_ID) {
      loadScript(
        `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`,
        "gtag-script",
      );
      inlineScript(
        "google-analytics",
        `window.dataLayer=window.dataLayer||[];function gtag(){window.dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${GA_MEASUREMENT_ID}');`,
      );
    }

    // Seline
    if (SELINE_TOKEN) {
      loadScript("https://cdn.seline.so/seline.js", "seline-script", {
        token: SELINE_TOKEN,
      });
    }

    // PostHog
    if (POSTHOG_API_KEY) {
      inlineScript(
        "posthog",
        `!function(t,e){var o,n,p,r;e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.async=!0,p.src=s.api_host+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],u.toString=function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e},u.people.toString=function(){return u.toString(1)+".people (stub)"},o="capture identify alias people.set people.set_once set_config register register_once unregister opt_out_capturing has_opted_out_capturing opt_in_capturing reset isFeatureEnabled onFeatureFlags getFeatureFlag getFeatureFlagPayload reloadFeatureFlags group updateEarlyAccessFeatureEnrollment getEarlyAccessFeatures getActiveMatchingSurveys getSurveys onSessionId".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);posthog.init('${POSTHOG_API_KEY}',{api_host:'https://app.posthog.com'})`,
      );
    }
  }, []);

  return null;
}

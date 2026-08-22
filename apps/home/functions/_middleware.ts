interface PagesContext {
  request: Request;
  next: (request?: Request) => Promise<Response>;
}

/** Currently deployed retry always cache-busts, which re-runs hydrateRoot. */
export const LEGACY_CACHE_BUST_IMPORT =
  'import(s.src+(s.src.indexOf("?")>=0?"&":"?")+"cf_retry="+n).catch(function(e){';

/** First retry reuses the script URL (ESM cache no-op if the module already ran). */
export const SAME_URL_FIRST_RETRY_IMPORT =
  'import((n<=1?s.src:s.src+(s.src.indexOf("?")>=0?"&":"?")+"cf_retry="+n)).then(function(){window.__CF_ENTRY_RAN__=true}).catch(function(e){';

export function rewriteHydrationRetryHtml(html: string): string {
  return html
    .replace(
      'if(window.__CF_ENTRY_RAN__)return;if(document.querySelector("main,header"))return;boot(1)',
      "if(window.__CF_ENTRY_RAN__)return;boot(1)"
    )
    .replace(
      'if(!document.querySelector("main"))boot(1)',
      "if(window.__CF_ENTRY_RAN__)return;boot(1)"
    )
    .replace(LEGACY_CACHE_BUST_IMPORT, SAME_URL_FIRST_RETRY_IMPORT);
}

export function hydrationRetryHref(src: string, n: number): string {
  return n <= 1 ? src : `${src}${src.includes("?") ? "&" : "?"}cf_retry=${n}`;
}

export async function onRequest(context: PagesContext): Promise<Response> {
  const { request, next } = context;
  const accept = request.headers.get("accept") || "";

  if (accept.includes("text/markdown")) {
    const url = new URL(request.url);
    if (url.pathname === "/" || url.pathname === "/index.html") {
      const llmsUrl = new URL("/llms.txt", request.url).toString();
      try {
        const res = await fetch(llmsUrl);
        if (res.ok) {
          const text = await res.text();
          // Standard token estimation (approx 4 chars per token)
          const tokenCount = Math.ceil(text.length / 4);

          return new Response(text, {
            status: 200,
            headers: {
              "Content-Type": "text/markdown; charset=utf-8",
              "x-markdown-tokens": tokenCount.toString(),
              Link: '</.well-known/api-catalog>; rel="api-catalog", </auth.md>; rel="describedby"',
              "Access-Control-Allow-Origin": "*",
              // Same URL returns markdown or HTML depending on Accept, so
              // shared caches must not reuse one representation for the other.
              Vary: "Accept, Accept-Encoding",
            },
          });
        }
      } catch (error) {
        console.error(
          "Failed to fetch llms.txt for markdown negotiation:",
          error
        );
      }
    }
  }

  const res = await next();
  const contentType = res.headers.get("content-type") || "";
  if (!contentType.includes("text/html")) return res;

  // Same URL returns HTML or markdown depending on Accept, so shared caches
  // must not reuse one representation for the other.
  const headers = new Headers(res.headers);
  const existingVary = headers.get("Vary");
  headers.set(
    "Vary",
    existingVary
      ? `${existingVary}, Accept, Accept-Encoding`
      : "Accept, Accept-Encoding"
  );

  const text = await res.text();
  const patched = rewriteHydrationRetryHtml(text);
  if (patched === text) {
    return new Response(text, { status: res.status, headers });
  }

  headers.delete("content-length");
  return new Response(patched, { status: res.status, headers });
}

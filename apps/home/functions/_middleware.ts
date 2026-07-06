interface PagesContext {
  request: Request;
  next: (request?: Request) => Promise<Response>;
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
              "Link": '</.well-known/api-catalog>; rel="api-catalog", </auth.md>; rel="describedby"',
              "Access-Control-Allow-Origin": "*",
            },
          });
        }
      } catch (error) {
        console.error("Failed to fetch llms.txt for markdown negotiation:", error);
      }
    }
  }

  return next();
}

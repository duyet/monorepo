const AIDR_ORIGIN = "https://aidr.today";
const LEGACY_HOST = "news.duyet.net";
const METHOD_PRESERVE_REDIRECT = 308;
const METHOD_CHANGE_REDIRECT = 301;

function redirectStatus(method: string): number {
  switch (method) {
    case "POST":
    case "PUT":
    case "PATCH":
    case "DELETE":
      return METHOD_PRESERVE_REDIRECT;
    default:
      return METHOD_CHANGE_REDIRECT;
  }
}

function targetPath(pathname: string): string {
  return pathname === "/news-tab.zip" ? "/aidr.zip" : pathname;
}

export function redirectToAidr(request: Request): Response | null {
  const url = new URL(request.url);
  if (url.hostname !== LEGACY_HOST) return null;

  const target = `${AIDR_ORIGIN}${targetPath(url.pathname)}${url.search}`;
  return Response.redirect(target, redirectStatus(request.method));
}

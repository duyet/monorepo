export const dynamic = "force-static";

export function GET(): Response {
  const siteUrl = process.env.NEXT_PUBLIC_DUYET_BLOG_URL || "https://blog.duyet.net";

  const robotsTxt = `User-agent: *
Allow: /

Sitemap: ${siteUrl}/sitemap.xml
Sitemap: ${siteUrl}/sitemap
`;

  return new Response(robotsTxt, {
    headers: {
      "Content-Type": "text/plain",
    },
  });
}

export const dynamic = "force-static";

export function GET(): Response {
  const siteUrl = "https://blog.duyet.net";

  const robotsTxt = `User-agent: *
Allow: /

Sitemap: ${siteUrl}/sitemap.xml
Sitemap: ${siteUrl}/sitemap

# LLM and AI agent resources
# llms.txt: ${siteUrl}/llms.txt
# llms-full.txt: ${siteUrl}/llms-full.txt
`;

  return new Response(robotsTxt, {
    headers: {
      "Content-Type": "text/plain",
    },
  });
}

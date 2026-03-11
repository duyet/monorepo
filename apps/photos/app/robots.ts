import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = "https://photos.duyet.net";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/feed"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}

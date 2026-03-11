import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = "https://cv.duyet.net";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/pdf/"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}

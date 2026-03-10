import type { MetadataRoute } from "next";

// Static generation for sitemap
export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = "https://cv.duyet.net";
  const lastModified = new Date().toISOString();

  return [
    {
      url: siteUrl,
      lastModified,
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: `${siteUrl}/pdf`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.8,
    },
  ];
}

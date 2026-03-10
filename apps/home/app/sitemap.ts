import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = "https://duyet.net";
  const lastModified = new Date().toISOString();

  return [
    {
      url: siteUrl,
      lastModified,
      changeFrequency: "daily" as const,
      priority: 1,
    },
    {
      url: `${siteUrl}/about`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    },
    {
      url: `${siteUrl}/ls`,
      lastModified,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    },
  ];
}

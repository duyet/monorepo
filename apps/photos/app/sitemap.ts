import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = "https://photos.duyet.net";
  const lastModified = new Date().toISOString();

  // Generate year pages from 2022 to current year
  const currentYear = new Date().getFullYear();
  const minYear = 2022;

  const yearPages = [];
  for (let year = minYear; year <= currentYear; year++) {
    yearPages.push({
      url: `${siteUrl}/${year}`,
      lastModified,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    });
  }

  return [
    // Main photos page - highest priority
    {
      url: siteUrl,
      lastModified,
      changeFrequency: "daily" as const,
      priority: 1,
    },
    // RSS feed
    {
      url: `${siteUrl}/feed`,
      lastModified,
      changeFrequency: "daily" as const,
      priority: 0.9,
    },
    // Year archive pages
    ...yearPages,
  ];
}

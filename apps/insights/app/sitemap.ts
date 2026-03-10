import type { MetadataRoute } from "next";

export const dynamic = "force-static";

const PERIODS = ["7", "30", "365", "all"] as const;
const DATA_SOURCES = ["blog", "github", "ai", "wakatime"] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = "https://insights.duyet.net";
  const lastModified = new Date().toISOString();

  // Static pages
  const staticPages = [
    {
      url: siteUrl,
      lastModified,
      changeFrequency: "daily" as const,
      priority: 1,
    },
    {
      url: `${siteUrl}/agents`,
      lastModified,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    },
  ];

  // Data source main pages (without period)
  const dataSourcePages = DATA_SOURCES.map((source) => ({
    url: `${siteUrl}/${source}`,
    lastModified,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  // Data source period pages
  const periodPages = DATA_SOURCES.flatMap((source) =>
    PERIODS.map((period) => ({
      url: `${siteUrl}/${source}/${period}`,
      lastModified,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    }))
  );

  return [...staticPages, ...dataSourcePages, ...periodPages];
}

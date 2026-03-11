import type { MetadataRoute } from "next";
import { organizations, years } from "@/lib/data";
import { slugify } from "@/lib/utils";

export const dynamic = "force-static";

const LICENSES = ["open", "closed", "partial"] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = "https://llm-timeline.duyet.net";
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
      url: `${siteUrl}/lite`,
      lastModified,
      changeFrequency: "daily" as const,
      priority: 0.9,
    },
    {
      url: `${siteUrl}/open`,
      lastModified,
      changeFrequency: "daily" as const,
      priority: 0.9,
    },
    {
      url: `${siteUrl}/org`,
      lastModified,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    },
  ];

  // Organization pages
  const orgPages = organizations.map((org) => ({
    url: `${siteUrl}/org/${slugify(org)}`,
    lastModified,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  // License type pages
  const licensePages = LICENSES.map((type) => ({
    url: `${siteUrl}/license/${type}`,
    lastModified,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  // Year archive pages
  const yearPages = years.map((year) => ({
    url: `${siteUrl}/year/${year}`,
    lastModified,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [...staticPages, ...orgPages, ...licensePages, ...yearPages];
}

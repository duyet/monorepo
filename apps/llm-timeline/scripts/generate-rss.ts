#!/usr/bin/env bun
/**
 * generate-rss.ts — Generate RSS feeds for LLM Timeline
 * Outputs to public/ (included in static export)
 * Run: bun scripts/generate-rss.ts
 *
 * Generates RSS feeds for:
 * - All models: /rss.xml
 * - By license: /license/{open,closed,partial}/rss.xml
 * - By year: /year/{year}/rss.xml
 * - By org: /org/{slug}/rss.xml
 */

import { writeFileSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";

// Import models and data from lib
import { models, lastSynced, organizations, years } from "../lib/data";
import { slugify } from "../lib/utils";

const SITE_URL = "https://llm-timeline.duyet.net";

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

interface RssFeedOptions {
  title: string;
  description: string;
  link: string;
  feedUrl: string;
  models: typeof models;
}

function buildRssFeed({
  title,
  description,
  link,
  feedUrl,
  models,
}: RssFeedOptions): string {
  // Sort by date descending (newest first) for RSS
  const sorted = [...models].sort((a, b) => b.date.localeCompare(a.date));
  // Limit to most recent 200 for RSS
  const recent = sorted.slice(0, 200);

  const items = recent
    .map((m) => {
      const pubDate = new Date(m.date).toUTCString();
      const itemTitle = `${m.name} (${m.org})`;
      const itemDescription = [
        m.params ? `Parameters: ${m.params}` : null,
        `License: ${m.license}`,
        `Type: ${m.type}`,
        "",
        m.desc,
      ]
        .filter(Boolean)
        .join("\n");
      const guid = `${SITE_URL}/#${encodeURIComponent(m.name)}-${m.date}`;

      return `  <item>
    <title>${escapeXml(itemTitle)}</title>
    <link>${link}</link>
    <guid isPermaLink="false">${escapeXml(guid)}</guid>
    <pubDate>${pubDate}</pubDate>
    <category>${escapeXml(m.org)}</category>
    <category>${escapeXml(m.license)}</category>
    <description>${escapeXml(itemDescription)}</description>
  </item>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(title)}</title>
    <link>${link}</link>
    <description>${escapeXml(description)}</description>
    <language>en-us</language>
    <lastBuildDate>${new Date(lastSynced).toUTCString()}</lastBuildDate>
    <atom:link href="${feedUrl}" rel="self" type="application/rss+xml"/>
    <image>
      <url>${SITE_URL}/favicon.svg</url>
      <title>${escapeXml(title)}</title>
      <link>${link}</link>
    </image>
${items}
  </channel>
</rss>`;
}

function writeFeed(path: string, content: string): void {
  const fullPath = resolve(process.cwd(), path);
  mkdirSync(dirname(fullPath), { recursive: true });
  writeFileSync(fullPath, content, "utf-8");
}

// Count generated feeds
let feedCount = 0;

// 1. Main RSS feed (all models)
const mainFeed = buildRssFeed({
  title: "LLM Timeline — Model Releases",
  description:
    "Chronological index of Large Language Model releases from 2017 to present. Updated weekly.",
  link: SITE_URL,
  feedUrl: `${SITE_URL}/rss.xml`,
  models,
});
writeFeed("public/rss.xml", mainFeed);
feedCount++;

// 2. License-specific RSS feeds
const LICENSES = ["open", "closed", "partial"] as const;
const LICENSE_LABELS: Record<(typeof LICENSES)[number], string> = {
  open: "Open License",
  closed: "Closed License",
  partial: "Partial License",
};
const LICENSE_DESCRIPTIONS: Record<(typeof LICENSES)[number], string> = {
  open: "Models with openly available weights and code",
  closed: "Proprietary models with API-only access",
  partial: "Models with some restricted access or partial weights",
};

for (const license of LICENSES) {
  const licenseModels = models.filter((m) => m.license === license);
  const feed = buildRssFeed({
    title: `LLM Timeline — ${LICENSE_LABELS[license]} Models`,
    description: LICENSE_DESCRIPTIONS[license],
    link: `${SITE_URL}/license/${license}`,
    feedUrl: `${SITE_URL}/license/${license}/rss.xml`,
    models: licenseModels,
  });
  writeFeed(`public/license/${license}/rss.xml`, feed);
  feedCount++;
}

// 3. Year-specific RSS feeds
for (const year of years) {
  const yearModels = models.filter(
    (m) => new Date(m.date).getFullYear() === year
  );
  const feed = buildRssFeed({
    title: `LLM Timeline — ${year} Model Releases`,
    description: `Large Language Model releases from ${year}.`,
    link: `${SITE_URL}/year/${year}`,
    feedUrl: `${SITE_URL}/year/${year}/rss.xml`,
    models: yearModels,
  });
  writeFeed(`public/year/${year}/rss.xml`, feed);
  feedCount++;
}

// 4. Organization-specific RSS feeds
for (const org of organizations) {
  const orgModels = models.filter((m) => m.org === org);
  const orgSlug = slugify(org);
  const feed = buildRssFeed({
    title: `LLM Timeline — ${org} Models`,
    description: `Large Language Model releases from ${org}.`,
    link: `${SITE_URL}/org/${orgSlug}`,
    feedUrl: `${SITE_URL}/org/${orgSlug}/rss.xml`,
    models: orgModels,
  });
  writeFeed(`public/org/${orgSlug}/rss.xml`, feed);
  feedCount++;
}

console.log(`Generated ${feedCount} RSS feeds`);
console.log(`  Models: ${models.length} total`);
console.log(`  Last sync: ${lastSynced}`);

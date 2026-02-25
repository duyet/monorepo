#!/usr/bin/env bun
/**
 * generate-sitemap.ts — Generate XML sitemap for LLM Timeline
 * Outputs to public/sitemap.xml (included in static export)
 * Run: bun scripts/generate-sitemap.ts
 */

import { writeFileSync } from 'fs'
import { resolve } from 'path'

// Import models and data from lib
import { models, lastSynced, organizations, years, type Model } from '../lib/data'
import { slugify } from '../lib/utils'

const SITE_URL = 'https://llm-timeline.duyet.net'

interface SitemapEntry {
  url: string
  lastmod: string
  changefreq: string
  priority: string
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function buildSitemap(entries: SitemapEntry[]): string {
  const xmlEntries = entries.map((entry) => {
    return `  <url>
    <loc>${escapeXml(entry.url)}</loc>
    <lastmod>${entry.lastmod}</lastmod>
    <changefreq>${entry.changefreq}</changefreq>
    <priority>${entry.priority}</priority>
  </url>`
  }).join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${xmlEntries}
</urlset>`
}

// Build sitemap entries
const entries: SitemapEntry[] = []

// Helper to get the most recent model date for a filter
function getLatestDate(models: Model[]): string {
  if (models.length === 0) return lastSynced
  return models.reduce((latest: string, m: Model) => (m.date > latest ? m.date : latest), models[0].date)
}

// 1. Main page (highest priority)
entries.push({
  url: SITE_URL,
  lastmod: lastSynced,
  changefreq: 'weekly',
  priority: '1.0',
})

// 2. License pages
const LICENSES = ['open', 'closed', 'partial'] as const
for (const license of LICENSES) {
  const licenseModels = models.filter(m => m.license === license)
  entries.push({
    url: `${SITE_URL}/license/${license}`,
    lastmod: getLatestDate(licenseModels),
    changefreq: 'weekly',
    priority: '0.8',
  })
}

// 3. Year pages
for (const year of years) {
  const yearModels = models.filter(m => new Date(m.date).getFullYear() === year)
  entries.push({
    url: `${SITE_URL}/year/${year}`,
    lastmod: getLatestDate(yearModels),
    changefreq: 'monthly',
    priority: '0.7',
  })
}

// 4. Organization pages
for (const org of organizations) {
  const orgModels = models.filter(m => m.org === org)
  const orgSlug = slugify(org)
  entries.push({
    url: `${SITE_URL}/org/${orgSlug}`,
    lastmod: getLatestDate(orgModels),
    changefreq: 'weekly',
    priority: '0.6',
  })
}

// 5. RSS feeds (lower priority)
entries.push({
  url: `${SITE_URL}/rss.xml`,
  lastmod: lastSynced,
  changefreq: 'weekly',
  priority: '0.4',
})

for (const license of LICENSES) {
  entries.push({
    url: `${SITE_URL}/license/${license}/rss.xml`,
    lastmod: lastSynced,
    changefreq: 'weekly',
    priority: '0.4',
  })
}

for (const year of years) {
  entries.push({
    url: `${SITE_URL}/year/${year}/rss.xml`,
    lastmod: lastSynced,
    changefreq: 'monthly',
    priority: '0.4',
  })
}

for (const org of organizations) {
  const orgSlug = slugify(org)
  entries.push({
    url: `${SITE_URL}/org/${orgSlug}/rss.xml`,
    lastmod: lastSynced,
    changefreq: 'weekly',
    priority: '0.4',
  })
}

// Generate and write sitemap
const xml = buildSitemap(entries)
const outputPath = resolve(process.cwd(), 'public/sitemap.xml')
writeFileSync(outputPath, xml, 'utf-8')

console.log(`Generated sitemap: ${outputPath}`)
console.log(`  URLs: ${entries.length} total`)
console.log(`  Last sync: ${lastSynced}`)

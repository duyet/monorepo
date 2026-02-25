#!/usr/bin/env bun
/**
 * generate-rss.ts — Generate RSS feed for LLM Timeline
 * Outputs to public/rss.xml (included in static export)
 * Run: bun scripts/generate-rss.ts
 */

import { writeFileSync } from 'fs'
import { resolve } from 'path'

// Import models from data
import { models, lastSynced } from '../lib/data'

const SITE_URL = 'https://llm-timeline.duyet.net'
const OUTPUT_PATH = resolve(process.cwd(), 'public/rss.xml')

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function buildRss(): string {
  // Sort by date descending (newest first) for RSS
  const sorted = [...models].sort((a, b) => b.date.localeCompare(a.date))
  // Limit to most recent 200 for RSS
  const recent = sorted.slice(0, 200)

  const items = recent.map((m) => {
    const pubDate = new Date(m.date).toUTCString()
    const title = `${m.name} (${m.org})`
    const description = [
      m.params ? `Parameters: ${m.params}` : null,
      `License: ${m.license}`,
      `Type: ${m.type}`,
      '',
      m.desc,
    ].filter(Boolean).join('\n')
    const guid = `${SITE_URL}/#${encodeURIComponent(m.name)}-${m.date}`

    return `  <item>
    <title>${escapeXml(title)}</title>
    <link>${SITE_URL}</link>
    <guid isPermaLink="false">${escapeXml(guid)}</guid>
    <pubDate>${pubDate}</pubDate>
    <category>${escapeXml(m.org)}</category>
    <category>${escapeXml(m.license)}</category>
    <description>${escapeXml(description)}</description>
  </item>`
  }).join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>LLM Timeline — Model Releases</title>
    <link>${SITE_URL}</link>
    <description>Chronological index of Large Language Model releases from 2017 to present. Updated weekly.</description>
    <language>en-us</language>
    <lastBuildDate>${new Date(lastSynced).toUTCString()}</lastBuildDate>
    <atom:link href="${SITE_URL}/rss.xml" rel="self" type="application/rss+xml"/>
    <image>
      <url>${SITE_URL}/favicon.ico</url>
      <title>LLM Timeline</title>
      <link>${SITE_URL}</link>
    </image>
${items}
  </channel>
</rss>`
}

const xml = buildRss()
writeFileSync(OUTPUT_PATH, xml, 'utf-8')
console.log(`Generated RSS feed: ${OUTPUT_PATH}`)
console.log(`  Models: ${models.length} total, 200 in feed`)
console.log(`  Last sync: ${lastSynced}`)

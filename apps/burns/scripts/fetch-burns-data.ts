#!/usr/bin/env tsx

import { Database } from "duckdb-async";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const MOTHERDUCK_TOKEN = process.env.MOTHERDUCK_TOKEN;

const OUTPUT_DIR = join(import.meta.dirname, "..", "public");
const OUTPUT_FILE = join(OUTPUT_DIR, "token-data.json");

/** SQL CASE that maps raw source/model → display agent names. */
const AGENT_CASE = `
  CASE
    WHEN source IN ('antigravity', 'gemini') THEN 'Google Antigravity'
    WHEN source = 'opencode' THEN 'opencode'
    WHEN source = 'codex' THEN 'Codex'
    WHEN source = 'grok' THEN 'Grok'
    WHEN source = 'hermes' THEN 'Hermes'
    WHEN source = 'openclaw' THEN 'OpenClaw'
    WHEN source = 'pi' THEN 'pi'
    WHEN source = 'ccusage' AND (
      lower(coalesce(model_name, '')) LIKE '%glm%'
      OR lower(coalesce(model_name, '')) LIKE '%z-ai%'
      OR lower(coalesce(model_name, '')) LIKE '%zai%'
    ) THEN 'Z.AI'
    WHEN source = 'ccusage' THEN 'Claude Code'
    WHEN lower(coalesce(model_name, '')) LIKE '%glm%'
      OR lower(coalesce(model_name, '')) LIKE '%z-ai%'
      OR lower(coalesce(model_name, '')) LIKE '%zai%'
      THEN 'Z.AI'
    ELSE source
  END
`;

async function main() {
  if (!MOTHERDUCK_TOKEN) {
    throw new Error("MOTHERDUCK_TOKEN is required");
  }

  console.log("Connecting to MotherDuck...");
  const db = await Database.create(
    `md:ccusage?motherduck_token=${MOTHERDUCK_TOKEN}`,
  );

  const parseNum = (v: unknown): number =>
    typeof v === "bigint" ? Number(v) : Number(v ?? 0);

  const formatDate = (v: unknown): string => {
    if (v instanceof Date) return v.toISOString().slice(0, 10);
    return String(v).slice(0, 10);
  };

  console.log("Fetching totals...");
  const totalsRows = await db.all(`
    SELECT
      COALESCE(SUM(input_tokens), 0)          as input_tokens,
      COALESCE(SUM(output_tokens), 0)         as output_tokens,
      COALESCE(SUM(cache_creation_tokens), 0) as cache_creation_tokens,
      COALESCE(SUM(cache_read_tokens), 0)     as cache_read_tokens,
      COALESCE(SUM(total_tokens), 0)          as total_tokens,
      COALESCE(SUM(cost), 0)                  as total_cost
    FROM ccusage_events
    WHERE record_type = 'daily'
  `);

  const totals = totalsRows[0];

  console.log("Fetching daily breakdown...");
  const dailyRows = await db.all(`
    SELECT
      date,
      COALESCE(SUM(input_tokens), 0)          as input_tokens,
      COALESCE(SUM(output_tokens), 0)         as output_tokens,
      COALESCE(SUM(cache_creation_tokens), 0) as cache_creation_tokens,
      COALESCE(SUM(cache_read_tokens), 0)     as cache_read_tokens,
      COALESCE(SUM(total_tokens), 0)          as total_tokens,
      COALESCE(SUM(cost), 0)                  as cost
    FROM ccusage_events
    WHERE record_type = 'daily'
    GROUP BY date
    ORDER BY date DESC
  `);

  const firstDate = dailyRows.length > 0
    ? formatDate(dailyRows[dailyRows.length - 1].date)
    : null;
  const lastDate = dailyRows.length > 0
    ? formatDate(dailyRows[0].date)
    : null;

  console.log("Fetching per-agent breakdown per day...");
  const sourceRows = await db.all(`
    SELECT
      date,
      ${AGENT_CASE} as source,
      COALESCE(SUM(total_tokens), 0) as total_tokens,
      COALESCE(SUM(cost), 0)         as cost
    FROM ccusage_events
    WHERE record_type = 'daily'
    GROUP BY date, ${AGENT_CASE}
    ORDER BY date DESC
  `);

  console.log("Fetching all-time per-agent totals...");
  const sourceTotalRows = await db.all(`
    SELECT
      ${AGENT_CASE} as source,
      COALESCE(SUM(total_tokens), 0) as total_tokens,
      COALESCE(SUM(cost), 0)         as cost
    FROM ccusage_events
    WHERE record_type = 'daily'
    GROUP BY ${AGENT_CASE}
    ORDER BY total_tokens DESC
  `);

  const byDate = new Map<string, { source: string; total_tokens: number; cost: number }[]>();
  for (const row of sourceRows) {
    const date = formatDate(row.date);
    const entry = {
      source: String(row.source),
      total_tokens: parseNum(row.total_tokens),
      cost: Math.round(parseNum(row.cost) * 100) / 100,
    };
    // Drop zero-token, zero-cost noise rows
    if (entry.total_tokens === 0 && entry.cost === 0) continue;
    if (!byDate.has(date)) byDate.set(date, []);
    byDate.get(date)!.push(entry);
  }

  // Sort each day's agents by tokens desc
  for (const entries of byDate.values()) {
    entries.sort((a, b) => b.total_tokens - a.total_tokens);
  }

  const source_totals = sourceTotalRows
    .map((row) => ({
      source: String(row.source),
      total_tokens: parseNum(row.total_tokens),
      cost: Math.round(parseNum(row.cost) * 100) / 100,
    }))
    .filter((e) => e.total_tokens > 0 || e.cost > 0);

  // Logo row order: known display agents first, then any extras by tokens
  const preferred = [
    "Google Antigravity",
    "Z.AI",
    "opencode",
    "Claude Code",
    "Codex",
    "Grok",
  ];
  const known = new Set(source_totals.map((s) => s.source));
  const sources = [
    ...preferred.filter((s) => known.has(s)),
    ...source_totals.map((s) => s.source).filter((s) => !preferred.includes(s)),
  ];

  const data = {
    generatedAt: new Date().toISOString(),
    firstDate,
    lastDate,
    sources,
    totals: {
      input_tokens: parseNum(totals.input_tokens),
      output_tokens: parseNum(totals.output_tokens),
      cache_creation_tokens: parseNum(totals.cache_creation_tokens),
      cache_read_tokens: parseNum(totals.cache_read_tokens),
      total_tokens: parseNum(totals.total_tokens),
      total_cost: Math.round(parseNum(totals.total_cost) * 100) / 100,
    },
    source_totals,
    daily: dailyRows.map((row) => ({
      date: formatDate(row.date),
      input_tokens: parseNum(row.input_tokens),
      output_tokens: parseNum(row.output_tokens),
      cache_creation_tokens: parseNum(row.cache_creation_tokens),
      cache_read_tokens: parseNum(row.cache_read_tokens),
      total_tokens: parseNum(row.total_tokens),
      cost: Math.round(parseNum(row.cost) * 100) / 100,
      by_source: byDate.get(formatDate(row.date)) ?? [],
    })),
  };

  mkdirSync(OUTPUT_DIR, { recursive: true });
  writeFileSync(OUTPUT_FILE, JSON.stringify(data, null, 2));

  console.log(`\nTotal tokens: ${data.totals.total_tokens.toLocaleString()}`);
  console.log(`Total cost:   $${data.totals.total_cost.toLocaleString()}`);
  console.log(`Days:         ${data.daily.length}`);
  console.log(`Range:        ${firstDate ?? "N/A"} → ${lastDate ?? "N/A"}`);
  console.log(`Agents:       ${source_totals.map((s) => s.source).join(", ")}`);
  console.log(
    `Days w/ by_source: ${data.daily.filter((d) => d.by_source.length > 0).length}`,
  );
  console.log(`Written to:   ${OUTPUT_FILE}`);

  await db.close();
}

main().catch((err) => {
  console.error("Failed:", err);
  process.exit(1);
});

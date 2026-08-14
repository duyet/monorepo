#!/usr/bin/env tsx

import { Database } from "duckdb-async";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { normalizeSource } from "../src/lib/sources";

const MOTHERDUCK_TOKEN = process.env.MOTHERDUCK_TOKEN;

const OUTPUT_DIR = join(import.meta.dirname, "..", "public");
const OUTPUT_FILE = join(OUTPUT_DIR, "token-data.json");

type SourceAgg = { source: string; total_tokens: number; cost: number };

function mergeSource(map: Map<string, SourceAgg>, source: string, tokens: number, cost: number) {
  const existing = map.get(source);
  if (existing) {
    existing.total_tokens += tokens;
    existing.cost += cost;
    return;
  }
  map.set(source, { source, total_tokens: tokens, cost });
}

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
      source,
      model_name,
      COALESCE(SUM(total_tokens), 0) as total_tokens,
      COALESCE(SUM(cost), 0)         as cost
    FROM ccusage_events
    WHERE record_type = 'daily'
    GROUP BY date, source, model_name
    ORDER BY date DESC
  `);

  const byDateMaps = new Map<string, Map<string, SourceAgg>>();
  const allTime = new Map<string, SourceAgg>();

  for (const row of sourceRows) {
    const tokens = parseNum(row.total_tokens);
    const cost = parseNum(row.cost);
    if (tokens === 0 && cost === 0) continue;

    const source = normalizeSource(String(row.source ?? ""), String(row.model_name ?? ""));
    const date = formatDate(row.date);
    if (!byDateMaps.has(date)) byDateMaps.set(date, new Map());
    mergeSource(byDateMaps.get(date)!, source, tokens, cost);
    mergeSource(allTime, source, tokens, cost);
  }

  const byDate = new Map<string, SourceAgg[]>();
  for (const [date, map] of byDateMaps) {
    const entries = [...map.values()]
      .map((e) => ({
        ...e,
        cost: Math.round(e.cost * 100) / 100,
      }))
      .sort((a, b) => b.total_tokens - a.total_tokens);
    byDate.set(date, entries);
  }

  const source_totals = [...allTime.values()]
    .map((e) => ({
      ...e,
      cost: Math.round(e.cost * 100) / 100,
    }))
    .filter((e) => e.total_tokens > 0 || e.cost > 0)
    .sort((a, b) => b.total_tokens - a.total_tokens);

  const sources = source_totals.map((s) => s.source);

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

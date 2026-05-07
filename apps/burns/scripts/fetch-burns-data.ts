#!/usr/bin/env bun

import { Database } from "duckdb-async";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const MOTHERDUCK_TOKEN =
  process.env.MOTHERDUCK_TOKEN ??
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Imx2ZHVpdDA4QGdtYWlsLmNvbSIsIm1kUmVnaW9uIjoiYXdzLXVzLWVhc3QtMSIsInNlc3Npb24iOiJsdmR1aXQwOC5nbWFpbC5jb20iLCJwYXQiOiJycE5KZUp2ZldOSkhFODZkcjJvTkppMzlDYzZOLWNOYzk1c29YWVlMa1FnIiwidXNlcklkIjoiNzdjZTE5NTYtYzg0Yy00MDJhLWFmZTEtMjU3M2JhOTJkOGExIiwiaXNzIjoibWRfcGF0IiwicmVhZE9ubHkiOmZhbHNlLCJ0b2tlblR5cGUiOiJyZWFkX3dyaXRlIiwiaWF0IjoxNzc4MDU4NjcwfQ.r91S2weNKmyl0X2O65_iFI8mAa6f7RVjeQ33CFITIuc";

const OUTPUT_DIR = join(import.meta.dirname, "..", "public");
const OUTPUT_FILE = join(OUTPUT_DIR, "token-data.json");

async function main() {
  console.log("Connecting to MotherDuck...");
  const db = await Database.create(
    `md:ccusage?motherduck_token=${MOTHERDUCK_TOKEN}`,
  );

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
  // DuckDB returns BIGINT as string for large numbers, convert
  const parseNum = (v: unknown): number =>
    typeof v === "bigint" ? Number(v) : Number(v ?? 0);

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

  const data = {
    generatedAt: new Date().toISOString(),
    totals: {
      input_tokens: parseNum(totals.input_tokens),
      output_tokens: parseNum(totals.output_tokens),
      cache_creation_tokens: parseNum(totals.cache_creation_tokens),
      cache_read_tokens: parseNum(totals.cache_read_tokens),
      total_tokens: parseNum(totals.total_tokens),
      total_cost: Math.round(parseNum(totals.total_cost) * 100) / 100,
    },
    daily: dailyRows.map((row) => ({
      date: String(row.date),
      input_tokens: parseNum(row.input_tokens),
      output_tokens: parseNum(row.output_tokens),
      cache_creation_tokens: parseNum(row.cache_creation_tokens),
      cache_read_tokens: parseNum(row.cache_read_tokens),
      total_tokens: parseNum(row.total_tokens),
      cost: Math.round(parseNum(row.cost) * 100) / 100,
    })),
  };

  mkdirSync(OUTPUT_DIR, { recursive: true });
  writeFileSync(OUTPUT_FILE, JSON.stringify(data, null, 2));

  console.log(`\nTotal tokens: ${data.totals.total_tokens.toLocaleString()}`);
  console.log(`Total cost:   $${data.totals.total_cost.toLocaleString()}`);
  console.log(`Days:         ${data.daily.length}`);
  console.log(`Written to:   ${OUTPUT_FILE}`);

  await db.close();
}

main().catch((err) => {
  console.error("Failed:", err);
  process.exit(1);
});

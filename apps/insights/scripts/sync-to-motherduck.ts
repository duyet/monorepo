#!/usr/bin/env bun
/**
 * Mirror the local DuckDB analytics cache to MotherDuck.
 *
 * Pre-requisite: `bun scripts/sync-analytics-cache.ts` has already
 * populated the local DuckDB file at ANALYTICS_CACHE_PATH.
 *
 * This script reads MOTHERDUCK_TOKEN from the environment, attaches a
 * MotherDuck database alongside the local cache, and copies every
 * table over. It's idempotent — tables are dropped and recreated on
 * each run so MotherDuck reflects the latest snapshot.
 *
 * Env:
 *   MOTHERDUCK_TOKEN    — required, MotherDuck access token
 *   MOTHERDUCK_DATABASE — optional, defaults to "duyet_analytics"
 */
import { DuckDBInstance } from "@duckdb/node-api";
import { existsSync } from "node:fs";
import { ANALYTICS_CACHE_PATH } from "../lib/analytics-cache-path";

const token = process.env.MOTHERDUCK_TOKEN;
if (!token) {
  console.error(
    "[motherduck-sync] MOTHERDUCK_TOKEN not set — skipping MotherDuck sync.",
  );
  process.exit(0);
}

if (!existsSync(ANALYTICS_CACHE_PATH)) {
  console.error(
    `[motherduck-sync] Local DuckDB cache not found at ${ANALYTICS_CACHE_PATH}.`,
    "Run sync-analytics-cache.ts first.",
  );
  process.exit(1);
}

const database = process.env.MOTHERDUCK_DATABASE ?? "duyet_analytics";

// Open the local cache, then attach MotherDuck as a remote database.
const instance = await DuckDBInstance.create(ANALYTICS_CACHE_PATH, {
  access_mode: "READ_ONLY",
});
const connection = await instance.connect();

try {
  await connection.run("INSTALL motherduck;");
  await connection.run("LOAD motherduck;");
  await connection.run(`SET motherduck_token = '${token}';`);
  await connection.run(`ATTACH 'md:${database}' AS md;`);

  const tablesReader = await connection.runAndReadAll(
    "SELECT table_name FROM information_schema.tables WHERE table_schema = 'main' AND table_type = 'BASE TABLE'",
  );
  const tables = tablesReader
    .getRowObjectsJson()
    .map((row) => row.table_name as string)
    .filter(Boolean);

  if (tables.length === 0) {
    console.warn("[motherduck-sync] No tables found in local cache.");
  } else {
    console.log(
      `[motherduck-sync] Mirroring ${tables.length} table(s) to md:${database}:`,
      tables.join(", "),
    );

    for (const table of tables) {
      const ident = `md.main."${table.replace(/"/g, '""')}"`;
      await connection.run(`DROP TABLE IF EXISTS ${ident};`);
      await connection.run(
        `CREATE TABLE ${ident} AS SELECT * FROM main."${table.replace(/"/g, '""')}";`,
      );
      console.log(`[motherduck-sync] ✓ ${table}`);
    }

    console.log(
      `[motherduck-sync] Done. Query via md:${database} or attach in dashboards.`,
    );
  }
} finally {
  connection.closeSync();
  instance.closeSync();
}

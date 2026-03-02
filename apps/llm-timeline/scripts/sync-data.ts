#!/usr/bin/env bun
/**
 * sync-data.ts — Pull LLM model data from registered sources and regenerate lib/data.ts
 *
 * Usage:
 *   bun scripts/sync-data.ts              # Fetch from all sources and write lib/data.ts
 *   bun scripts/sync-data.ts --dry-run    # Preview changes, don't write
 *   bun scripts/sync-data.ts --verbose    # Show column mapping and row details
 *   bun scripts/sync-data.ts --no-epoch   # Skip a source (auto-generated per source)
 *   bun scripts/sync-data.ts --help       # Show this help
 */

import { resolve } from "path";
import { writeFileSync } from "fs";
import { ALL_SOURCES, getEnabledSources } from "./sources";
import { mergeAllSources, formatMergeStats } from "../lib/deduplicator";
import { generateDataTs } from "../lib/codegen";

const OUTPUT_PATH = resolve(process.cwd(), "lib/data.ts");

// ---------------------------------------------------------------------------
// CLI args
// ---------------------------------------------------------------------------

const args = process.argv.slice(2);
const isDryRun = args.includes("--dry-run");
const isVerbose = args.includes("--verbose");
const showHelp = args.includes("--help") || args.includes("-h");

// Build disabled set from --no-{name} flags
const disabled = new Set(
  args.filter((a) => a.startsWith("--no-")).map((a) => a.slice(5))
);

if (showHelp) {
  const sourceFlags = ALL_SOURCES.map(
    (s) => `  --no-${s.name}`.padEnd(18) + `Skip ${s.label}`
  ).join("\n");
  const sourceList = ALL_SOURCES.map(
    (s) => `  ${s.label}: ${s.urls.join(", ")}`
  ).join("\n");
  console.log(`
sync-data.ts — Sync LLM model data to lib/data.ts

Usage:
  bun scripts/sync-data.ts [flags]

Flags:
  --dry-run         Print the generated output without writing the file
  --verbose         Show column mapping, skipped rows, and row-level details
${sourceFlags}
  --help            Show this help message

Sources:
${sourceList}

Output: ${OUTPUT_PATH}
`);
  process.exit(0);
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const sources = getEnabledSources(disabled);
  if (sources.length === 0) {
    console.error("All sources disabled — nothing to do");
    process.exit(1);
  }

  console.log(`Fetching from ${sources.length} source(s)...\n`);

  // Fetch all sources
  const results = [];
  for (let i = 0; i < sources.length; i++) {
    const source = sources[i];
    console.log(`${i + 1}. Fetching from ${source.label}...`);

    try {
      const models = await source.fetch({ verbose: isVerbose });
      console.log(`   ${models.length} models\n`);
      results.push({ source, models });
    } catch (err) {
      console.error(`   Warning: Failed to fetch ${source.label}: ${err}`);
      console.error(`   Continuing without this source...\n`);
    }
  }

  if (results.length === 0) {
    console.error("No data fetched from any source — aborting");
    process.exit(1);
  }

  // Merge
  console.log(`Merging ${results.length} source(s)...`);
  const { models, stats } = mergeAllSources(results);
  console.log(formatMergeStats(stats));

  if (models.length === 0) {
    console.error("No valid models found — aborting to prevent empty output");
    process.exit(1);
  }

  // Generate
  const syncDate = new Date().toISOString().slice(0, 10);
  const output = generateDataTs(models, sources, syncDate, stats);

  const orgs = Array.from(new Set(models.map((m) => m.org))).sort();
  const years = Array.from(
    new Set(models.map((m) => new Date(m.date).getFullYear()))
  ).sort((a, b) => b - a);

  if (isDryRun) {
    console.log(`\n--- DRY RUN: Preview of lib/data.ts (first 60 lines) ---\n`);
    console.log(output.split("\n").slice(0, 60).join("\n"));
    console.log(
      `\n... (${output.split("\n").length} total lines, ${models.length} models)`
    );
    console.log(
      `Organizations (${orgs.length}): ${orgs.slice(0, 10).join(", ")}${orgs.length > 10 ? ", ..." : ""}`
    );
    console.log(`Years: ${years.join(", ")}`);
    console.log(`\nWould write to: ${OUTPUT_PATH}`);
  } else {
    writeFileSync(OUTPUT_PATH, output, "utf-8");
    console.log(`\nWrote ${models.length} models to ${OUTPUT_PATH}`);
    console.log(`Organizations: ${orgs.length}`);
    console.log(`Years: ${years.join(", ")}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

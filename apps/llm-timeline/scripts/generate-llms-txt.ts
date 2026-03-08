#!/usr/bin/env bun
/**
 * generate-llms-txt.ts — Generate llms.txt for LLM Timeline
 * Outputs to public/llms.txt (included in static export)
 * Run: bun scripts/generate-llms-txt.ts
 */

import { writeFileSync } from "node:fs";
import { resolve } from "node:path";

// Import models from data
import { models, lastSynced } from "../lib/data";

const _SITE_URL = "https://llm-timeline.duyet.net";
const OUTPUT_PATH = resolve(process.cwd(), "public/llms.txt");

function buildLlmsTxt(): string {
  // Sort by date descending (newest first)
  const sorted = [...models].sort((a, b) => b.date.localeCompare(a.date));

  const modelsList = sorted
    .map((m) => {
      const params = m.params ? ` | Parameters: ${m.params}` : "";
      return `- **${m.name}** (${m.org}) — ${m.date}${params}
  - License: ${m.license} | Type: ${m.type}
  - ${m.desc}`;
    })
    .join("\n\n");

  return `# LLM Timeline

> Interactive timeline of Large Language Model releases from 2017 to present. Tracks ${models.length}+ models with release dates, organizations, parameter counts, license types, and descriptions.

## About

This site provides a chronological index of large language models (LLMs) from 2017 through the present. Data is sourced from LifeArchitect.AI's models table and synchronized weekly.

## Models

${modelsList}

## Data Structure

Each model entry includes:
- **name**: Model name (e.g., GPT-4, Claude 3, Gemini 1.5)
- **date**: Release date (YYYY-MM-DD)
- **org**: Organization (OpenAI, Anthropic, Google DeepMind, Meta, etc.)
- **params**: Parameter count (e.g., 175B, 1.8T) when available
- **type**: "model" or "milestone"
- **license**: "open", "closed", or "partial"
- **desc**: Brief description

## Source

- Data: https://lifearchitect.ai/models-table
- Code: https://github.com/duyet/monorepo/tree/master/apps/llm-timeline
- Last updated: ${lastSynced}

## License

Data sourced from LifeArchitect.AI. Site code: MIT.
`;
}

const content = buildLlmsTxt();
writeFileSync(OUTPUT_PATH, content, "utf-8");
console.log(`Generated llms.txt: ${OUTPUT_PATH}`);
console.log(`  Models: ${models.length} total`);
console.log(`  Last sync: ${lastSynced}`);

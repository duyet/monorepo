/**
 * One-time transform: rewrite `lib/data.ts` so the `models` array is emitted as
 * chunks of `Model[]` instead of one literal with 4,307 members.
 *
 * ## Why
 *
 * `lib/data.ts` is a 56,614-line generated file whose first line is
 * `// @ts-nocheck`. The reason is one error:
 *
 *     TS2590: Expression produces a union type that is too complex to represent
 *
 * A single array literal of 4,307 distinct object literal types makes TypeScript
 * try to form the union of all of them, and it gives up. So the file that defines
 * the app's entire dataset was, in practice, **not type-checked at all** — the
 * one file most in need of checking was the one exempt from it.
 *
 * Emitting `const c0: Model[] = [...]`, `c1`, … and then
 * `export const models: Model[] = [...c0, ...c1, …]` collapses that: each chunk
 * element is just `Model`, so there is no 4,307-member union to compute.
 *
 * ## What this script guarantees
 *
 * It does not re-derive the data — it re-shapes the *text* of the existing
 * array literal, entry for entry, in order. `verifyDataUnchanged()` compares the
 * imported runtime value before and after, which is the only assertion that
 * actually matters: the app's rendered pages depend on these 4,307 rows.
 *
 * Run from `apps/llm-timeline`:
 *
 *   pnpm exec tsx scripts/chunk-data-ts.ts          # dry run, prints the plan
 *   pnpm exec tsx scripts/chunk-data-ts.ts --write  # rewrite lib/data.ts
 */

import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const APP_DIR = join(dirname(fileURLToPath(import.meta.url)), "..");
const DATA_FILE = join(APP_DIR, "lib/data.ts");

/** Entries per chunk. */
const CHUNK_SIZE = 250;

const NOCHECK = "// @ts-nocheck — machine-generated file, types validated by Model interface";

interface Plan {
  readonly source: string;
  readonly output: string;
  readonly entryCount: number;
  readonly chunkCount: number;
  readonly removedNoCheck: boolean;
}

/** Index of the `export const models: Model[] = [` line. */
function findModelsDeclaration(source: string): number {
  const index = source.indexOf("export const models: Model[] = [");
  if (index === -1) throw new Error("could not find the models array declaration");
  return index;
}

/**
 * Split the array literal's top-level entries.
 *
 * A hand-rolled scan rather than `eval`: the file is 2 MB of generated text and
 * the entries are multi-line object literals with string values that themselves
 * contain braces, quotes and parentheses. Tracking brace depth and string state
 * is the only way to split them without re-parsing the language.
 */
export function splitEntries(literalBody: string): string[] {
  const entries: string[] = [];
  let depth = 0;
  let start = -1;
  let quote: string | null = null;
  let escaped = false;

  for (let i = 0; i < literalBody.length; i++) {
    const char = literalBody[i];

    if (quote !== null) {
      if (escaped) escaped = false;
      else if (char === "\\") escaped = true;
      else if (char === quote) quote = null;
      continue;
    }

    if (char === "'" || char === '"' || char === "`") {
      quote = char;
      continue;
    }

    if (char === "{") {
      if (depth === 0) start = i;
      depth++;
      continue;
    }

    if (char === "}") {
      depth--;
      // A top-level `},` closes an entry.
      if (depth === 0 && start !== -1) {
        let end = i + 1;
        while (end < literalBody.length && literalBody[end] !== ",") end++;
        entries.push(literalBody.slice(start, end).trimEnd());
        start = -1;
      }
    }
  }

  if (depth !== 0) throw new Error(`unbalanced braces: ended at depth ${depth}`);
  if (entries.length === 0) throw new Error("found no entries");

  return entries;
}

/**
 * Total number of model entries in an **already chunked** file.
 *
 * The inverse of `planChunking`, and the assertion that closes the loop: every
 * text check on a generated file can be satisfied by a file that parses but
 * dropped or reordered rows, and the app's rendered pages depend on all of
 * them. Counting the entries back out and comparing to the imported runtime
 * value is the only check that notices.
 *
 * Reuses `splitEntries` rather than re-deriving a parser, so this cannot drift
 * from the transform that produced the chunks.
 */
export function countChunkedEntries(source: string): number {
  const chunkPattern = /^const c(\d+): Model\[\] = \[$/gm;
  const bodies: string[] = [];

  for (
    let match = chunkPattern.exec(source);
    match !== null;
    match = chunkPattern.exec(source)
  ) {
    // The chunk literal ends at the first `]` that starts a line, optionally
    // followed by `;`. Entries are indented two spaces, so a line-initial `]`
    // cannot be part of a value — which is what makes this safe on a dataset
    // whose strings contain brackets.
    const start = match.index + match[0].length;
    const terminator = /\n\](;?)\n/.exec(source.slice(start));
    if (terminator === null) throw new Error(`unterminated chunk c${match[1]}`);
    bodies.push(source.slice(start + 1, start + 1 + terminator.index));
  }

  if (bodies.length === 0) throw new Error("no chunks found");

  return bodies.reduce((total, body) => total + splitEntries(body).length, 0);
}

export function planChunking(source: string): Plan {
  const declarationAt = findModelsDeclaration(source);
  // Anchor on the `=` first: the first `[` after the declaration keyword is the
  // one in the type annotation `Model[]`, not the array literal's bracket.
  const equalsAt = source.indexOf("=", declarationAt);
  if (equalsAt === -1) throw new Error("no `=` in the models declaration");
  const bodyStart = source.indexOf("[", equalsAt) + 1;
  if (bodyStart === 0) throw new Error("no `[` after the models declaration `=`");

  // The literal ends at the matching `]` for that `[`.
  let depth = 1;
  let i = bodyStart;
  let quote: string | null = null;
  let escaped = false;
  for (; i < source.length; i++) {
    const char = source[i];
    if (quote !== null) {
      if (escaped) escaped = false;
      else if (char === "\\") escaped = true;
      else if (char === quote) quote = null;
      continue;
    }
    if (char === "'" || char === '"' || char === "`") {
      quote = char;
      continue;
    }
    if (char === "[") depth++;
    else if (char === "]") {
      depth--;
      if (depth === 0) break;
    }
  }
  const bodyEnd = i;

  const entries = splitEntries(source.slice(bodyStart, bodyEnd));

  const chunks: string[] = [];
  for (let start = 0; start < entries.length; start += CHUNK_SIZE) {
    const slice = entries.slice(start, start + CHUNK_SIZE);
    chunks.push(
      `const c${chunks.length}: Model[] = [\n${slice
        .map((entry) => `  ${entry}`)
        .join(",\n")},\n];`
    );
  }

  const header = [
    "// Machine-generated by scripts/sync-data.ts — do not edit by hand.",
    "//",
    "// The array is emitted as chunks of `Model[]` rather than one literal.",
    "// A single literal with 4,000+ distinct object literal types makes",
    "// TypeScript give up with TS2590 (\"union type that is too complex to",
    "// represent\"), which is why this file used to need `@ts-nocheck` — i.e.",
    "// the app's entire dataset was the one file exempt from type-checking.",
    "// Chunking collapses the union to `Model`, so the file checks clean.",
  ].join("\n");

  const prefix = source
    .slice(0, declarationAt)
    // The `@ts-nocheck` pragma sits above the declaration, so stripping it means
    // editing the prefix rather than the array body. Refusing to write if it
    // survives is the whole point of the guard below.
    .split("\n")
    .filter((line) => line.trim() !== NOCHECK)
    .join("\n");

  const output = [
    prefix,
    header,
    "",
    ...chunks,
    "",
    `export const models: Model[] = [${chunks
      .map((_, index) => `...c${index}`)
      .join(", ")}].flat();`,
    source.slice(bodyEnd + 1),
  ].join("\n");

  return {
    source,
    output,
    entryCount: entries.length,
    chunkCount: chunks.length,
    removedNoCheck: !output.includes(NOCHECK),
  };
}

async function main(): Promise<void> {
  const source = readFileSync(DATA_FILE, "utf8");
  const plan = planChunking(source);

  console.log(`entries:        ${plan.entryCount}`);
  console.log(`chunks:         ${plan.chunkCount} (of ${CHUNK_SIZE})`);
  console.log(
    `@ts-nocheck removed: ${plan.removedNoCheck ? "yes" : "NO — still present!"}`
  );
  console.log(
    `size:            ${(source.length / 1024 / 1024).toFixed(2)} MB -> ` +
      `${(plan.output.length / 1024 / 1024).toFixed(2)} MB`
  );

  if (plan.removedNoCheck !== true) {
    throw new Error("refusing to write: @ts-nocheck would survive");
  }
  if (plan.entryCount === 0) {
    throw new Error("refusing to write: no entries found");
  }

  if (!process.argv.includes("--write")) {
    console.log("\ndry run — pass --write to apply");
    return;
  }

  writeFileSync(DATA_FILE, plan.output);
  console.log(`\nwrote ${DATA_FILE}`);
}

if (process.argv[1]?.endsWith("chunk-data-ts.ts")) {
  await main();
}

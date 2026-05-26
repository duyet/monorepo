#!/usr/bin/env bun
/**
 * Prebuild script: copy all content/**\/*.md to public/k/<slug>.md
 * so Cloudflare Pages ASSETS can serve the raw markdown files.
 *
 * Slug = basename without extension (no path segments — flat layout).
 *
 * Usage: bun scripts/copy-content-md.ts
 */

import { cpSync, mkdirSync, readdirSync, statSync } from "node:fs";
import { basename, extname, join } from "node:path";

const CONTENT_DIR = join(import.meta.dir, "..", "content");
const OUTPUT_DIR = join(import.meta.dir, "..", "public", "k");

mkdirSync(OUTPUT_DIR, { recursive: true });

function walkMd(dir: string): string[] {
  const paths: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      paths.push(...walkMd(full));
    } else if (extname(entry) === ".md") {
      paths.push(full);
    }
  }
  return paths;
}

const files = walkMd(CONTENT_DIR);
let copied = 0;

for (const src of files) {
  const slug = basename(src, ".md");
  const dest = join(OUTPUT_DIR, `${slug}.md`);
  cpSync(src, dest);
  copied++;
}

console.log(`copy-content-md: copied ${copied} files to public/k/`);

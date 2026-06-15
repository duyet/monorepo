#!/usr/bin/env tsx
/**
 * Prebuild script: copy markdown files from the git submodule to public/
 * so Cloudflare Pages ASSETS can serve the raw markdown files.
 *
 * - articles from kb/raw/kb-content/ to public/k/
 * - memory notes from kb/memory/ to public/m/ (skips _TEMPLATE)
 *
 * Slug = basename without extension (flat layout).
 */

import { cpSync, existsSync, mkdirSync, readdirSync, statSync } from "node:fs";
import { basename, extname, join } from "node:path";

const SCRIPT_DIR = import.meta.dirname!;
const APP_DIR = join(SCRIPT_DIR, "..");
const ARTICLES_DIR = join(APP_DIR, "kb", "raw", "kb-content");
const MEMORY_DIR = join(APP_DIR, "kb", "memory");
const OUTPUT_K_DIR = join(APP_DIR, "public", "k");
const OUTPUT_M_DIR = join(APP_DIR, "public", "m");

mkdirSync(OUTPUT_K_DIR, { recursive: true });
mkdirSync(OUTPUT_M_DIR, { recursive: true });

function walkMd(dir: string): string[] {
  const paths: string[] = [];
  let entries: string[];
  try {
    entries = readdirSync(dir);
  } catch {
    return paths;
  }
  for (const entry of entries) {
    const full = join(dir, entry);
    try {
      if (statSync(full).isDirectory()) {
        paths.push(...walkMd(full));
      } else if (extname(entry) === ".md") {
        paths.push(full);
      }
    } catch {
      // skip
    }
  }
  return paths;
}

// Articles → public/k/
let articlesCopied = 0;
for (const src of walkMd(ARTICLES_DIR)) {
  const slug = basename(src, ".md");
  cpSync(src, join(OUTPUT_K_DIR, `${slug}.md`));
  articlesCopied++;
}

// Memory notes → public/m/ (skip _TEMPLATE)
let memoryCopied = 0;
for (const src of walkMd(MEMORY_DIR)) {
  const slug = basename(src, ".md");
  if (slug.startsWith("_") || slug === "index" || slug === "log") continue;
  cpSync(src, join(OUTPUT_M_DIR, `${slug}.md`));
  memoryCopied++;
}

// viz.html (the OKF graph viewer, generated in the kb repo by `kb gen`) → public/
// Served at /viz.html — a self-contained, no-build viewer over the memory bundle.
let vizCopied = false;
const vizSrc = join(APP_DIR, "kb", "viz.html");
if (existsSync(vizSrc)) {
  cpSync(vizSrc, join(APP_DIR, "public", "viz.html"));
  vizCopied = true;
}

console.log(
  `copy-content-md: ${articlesCopied} articles to public/k/, ${memoryCopied} notes to public/m/${vizCopied ? ", viz.html → public/" : ""}`,
);

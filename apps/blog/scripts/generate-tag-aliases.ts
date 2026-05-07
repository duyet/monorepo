/**
 * Post-build: creates short-form tag alias pages.
 *
 * For compound slugs like "apache-airflow", creates an alias at "airflow"
 * by copying the prerendered HTML and replacing the tag name.
 */
import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import { join } from "node:path";

const DIST_TAG_DIR = join(import.meta.dir, "..", "dist", "client", "tag");
const PUBLIC_DATA = join(import.meta.dir, "..", "public", "posts-data.json");

if (!existsSync(DIST_TAG_DIR)) {
  console.log("  skipping tag aliases (no dist/client/tag)");
  process.exit(0);
}

const posts = JSON.parse(readFileSync(PUBLIC_DATA, "utf-8")) as Array<{
  tags_slug?: string[];
}>;
const existingDirs = new Set(readdirSync(DIST_TAG_DIR));

// Build alias map: lastSegment → fullSlug (only if alias doesn't already exist)
const aliases = new Map<string, string>();
for (const post of posts) {
  for (const slug of post.tags_slug ?? []) {
    const last = slug.split("-").pop()!;
    if (last !== slug && !existingDirs.has(last) && !aliases.has(last)) {
      aliases.set(last, slug);
    }
  }
}

let created = 0;
for (const [shortSlug, fullSlug] of aliases) {
  const sourceFile = join(DIST_TAG_DIR, fullSlug, "index.html");
  if (!existsSync(sourceFile)) continue;

  mkdirSync(join(DIST_TAG_DIR, shortSlug), { recursive: true });

  let html = readFileSync(sourceFile, "utf-8");

  const fullName = fullSlug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
  const shortName = shortSlug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  html = html.replaceAll(fullName, shortName);
  html = html.replaceAll(`/${fullSlug}`, `/${shortSlug}`);

  writeFileSync(join(DIST_TAG_DIR, shortSlug, "index.html"), html, "utf-8");
  created++;
}

console.log(`  ✓ tag aliases (${created})`);

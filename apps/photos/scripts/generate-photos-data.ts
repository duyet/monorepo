#!/usr/bin/env bun
/**
 * Prebuild script: Fetch photos from all providers and write to public/photos-data.json.
 * This runs at build time so the Vite SPA can load photo data as a static JSON file.
 *
 * Usage: bun scripts/generate-photos-data.ts
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { getAllPhotos } from "../lib/photo-provider";

const outputDir = join(import.meta.dir, "../public");
const outputPath = join(outputDir, "photos-data.json");

console.log("Generating photos data...");

try {
  mkdirSync(outputDir, { recursive: true });
  const photos = await getAllPhotos();
  writeFileSync(outputPath, JSON.stringify(photos, null, 2), "utf-8");
  console.log(`✓ Wrote ${photos.length} photos to ${outputPath}`);
} catch (err) {
  console.error("Failed to generate photos data:", err);
  // Write empty array so the app still works (shows fallback UI)
  writeFileSync(outputPath, "[]", "utf-8");
  console.log("✓ Wrote empty photos-data.json as fallback");
}

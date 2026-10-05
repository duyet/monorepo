#!/usr/bin/env tsx
/**
 * Prebuild script: Fetch photos from all providers and write to public/photos-data.json.
 * This runs at build time so the Vite SPA can load photo data as a static JSON file.
 *
 * Usage: bun scripts/generate-photos-data.ts
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { getAllPhotos } from "../lib/photo-provider";
import { photosDataExitCode } from "./photos-data-result";

const outputDir = join(import.meta.dirname!, "../public");
const outputPath = join(outputDir, "photos-data.json");
const tokenConfigured = Boolean(process.env.UNSPLASH_ACCESS_KEY);

console.log("Generating photos data...");

function writePhotos(photos: readonly unknown[]) {
  writeFileSync(outputPath, JSON.stringify(photos, null, 2), "utf-8");
}

function refuseEmptyGallery() {
  console.error(
    "Refusing to publish an empty gallery while UNSPLASH_ACCESS_KEY is set",
  );
  process.exit(1);
}

try {
  mkdirSync(outputDir, { recursive: true });
  const photos = await getAllPhotos();
  writePhotos(photos);
  console.log(`✓ Wrote ${photos.length} photos to ${outputPath}`);
  if (photosDataExitCode(photos, tokenConfigured) !== 0) {
    refuseEmptyGallery();
  }
} catch (err) {
  console.error("Failed to generate photos data:", err);
  // Write empty array so the app still works (shows fallback UI)
  writePhotos([]);
  console.log("✓ Wrote empty photos-data.json as fallback");
  if (photosDataExitCode([], tokenConfigured) !== 0) {
    refuseEmptyGallery();
  }
}

import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { Photo } from "@/lib/types";

let cachedPhotos: Photo[] | null = null;

/**
 * Load photos from the prebuild static JSON data file.
 * Photo data is generated at build time by scripts/generate-photos-data.ts
 * and written to public/photos-data.json.
 *
 * Reads from the filesystem for SSR/prerendering compatibility.
 */
export function loadPhotos(): Photo[] {
  if (cachedPhotos !== null) return cachedPhotos;

  const filePath = join(process.cwd(), "public", "photos-data.json");
  const raw = readFileSync(filePath, "utf-8");
  const data = JSON.parse(raw);
  if (!Array.isArray(data)) {
    throw new Error("Invalid photo data format");
  }
  cachedPhotos = data as Photo[];
  return cachedPhotos;
}

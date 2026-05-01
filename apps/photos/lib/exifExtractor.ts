import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { initSync, extract_exif } from "@duyet/wasm/pkg/exif/exif.js";
import type { DetailedExif } from "./types";

// Initialize WASM module once (build-time only)
let wasmInitialized = false;

function ensureWasmInit() {
  if (wasmInitialized) return;
  // Resolve WASM binary relative to the generated JS bindings
  const bindingsPath = import.meta.resolve(
    "@duyet/wasm/pkg/exif/exif.js"
  );
  const wasmPath = resolve(
    new URL(bindingsPath).pathname.replace(/exif\.js$/, "exif_bg.wasm")
  );
  const wasmBuffer = readFileSync(wasmPath);
  initSync({ module: wasmBuffer });
  wasmInitialized = true;
}

/**
 * Extract EXIF metadata from an image buffer using native Rust/WASM parser
 */
export function extractExifData(
  buffer: Buffer
): DetailedExif | undefined {
  try {
    ensureWasmInit();

    const jsonStr = extract_exif(new Uint8Array(buffer));

    if (jsonStr === "null") {
      return undefined;
    }

    const exif: DetailedExif = JSON.parse(jsonStr);

    // Return undefined if no EXIF data was found
    if (Object.keys(exif).length === 0) {
      return undefined;
    }

    return exif;
  } catch (error) {
    console.error("Error extracting EXIF data:", error);
    return undefined;
  }
}

/**
 * Format GPS coordinates for display
 */
export function formatGPSCoordinates(
  latitude: number,
  longitude: number
): string {
  const latDirection = latitude >= 0 ? "N" : "S";
  const lonDirection = longitude >= 0 ? "E" : "W";

  const latAbs = Math.abs(latitude);
  const lonAbs = Math.abs(longitude);

  return `${latAbs.toFixed(6)}° ${latDirection}, ${lonAbs.toFixed(6)}° ${lonDirection}`;
}

/**
 * Extract date from EXIF or file stats
 */
export function extractPhotoDate(exif?: DetailedExif): string {
  if (exif?.dateTimeOriginal) {
    // Convert EXIF date format (YYYY:MM:DD HH:MM:SS) to ISO
    const exifDate = exif.dateTimeOriginal.replace(
      /^(\d{4}):(\d{2}):(\d{2})/,
      "$1-$2-$3"
    );
    const date = new Date(exifDate);
    if (!Number.isNaN(date.getTime())) {
      return date.toISOString();
    }
  }

  if (exif?.dateTime) {
    const exifDate = exif.dateTime.replace(
      /^(\d{4}):(\d{2}):(\d{2})/,
      "$1-$2-$3"
    );
    const date = new Date(exifDate);
    if (!Number.isNaN(date.getTime())) {
      return date.toISOString();
    }
  }

  // Fallback to current date
  return new Date().toISOString();
}

import { promises as fs } from "node:fs";
import { join } from "node:path";
import type { UnsplashPhoto } from "./types";

// Cache directory in node_modules/.cache for Cloudflare Pages automatic persistence
// Cloudflare Pages caches node_modules between builds, so this cache persists automatically
// See: apps/photos/cache-config/README.md for details
const CACHE_DIR = join(process.cwd(), "node_modules", ".cache", "unsplash");
const CACHE_FILE = join(CACHE_DIR, "photos.json");
const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

interface CacheEntry {
  photoId: string;
  data: Partial<UnsplashPhoto>;
  timestamp: number;
}

interface PhotoCache {
  version: string;
  entries: Record<string, CacheEntry>;
}

/**
 * Ensure cache directory exists
 */
async function ensureCacheDir(): Promise<void> {
  try {
    await fs.mkdir(CACHE_DIR, { recursive: true });
  } catch (error) {
    console.warn("Failed to create cache directory:", error);
  }
}

/**
 * Load photo cache from disk
 */
export async function loadPhotoCache(): Promise<PhotoCache> {
  try {
    await ensureCacheDir();
    const data = await fs.readFile(CACHE_FILE, "utf-8");
    const cache = JSON.parse(data) as PhotoCache;

    // Validate cache structure
    if (!cache.version || !cache.entries) {
      console.warn("Invalid cache format, creating new cache");
      return { version: "1.0", entries: {} };
    }

    return cache;
  } catch (_error) {
    // Cache file doesn't exist or is invalid, return empty cache
    return { version: "1.0", entries: {} };
  }
}

/**
 * Save photo cache to disk
 */
export async function savePhotoCache(cache: PhotoCache): Promise<void> {
  try {
    await ensureCacheDir();
    const data = JSON.stringify(cache, null, 2);
    await fs.writeFile(CACHE_FILE, data, "utf-8");
  } catch (error) {
    console.error("Failed to save cache:", error);
  }
}

/**
 * Cache result with expiry information
 */
export interface CacheResult {
  data: Partial<UnsplashPhoto>;
  isExpired: boolean;
  age: number;
}

/**
 * Get cached photo data if available
 * Returns both fresh and expired cache data
 *
 * @returns CacheResult with data and expiry status, or null if no cache exists
 */
export function getCachedPhotoData(
  cache: PhotoCache,
  photoId: string
): CacheResult | null {
  const entry = cache.entries[photoId];

  if (!entry) {
    return null;
  }

  // Calculate cache age
  const age = Date.now() - entry.timestamp;
  const isExpired = age > CACHE_TTL_MS;

  return {
    data: entry.data,
    isExpired,
    age,
  };
}

/**
 * Add photo data to cache
 */
export function setCachedPhotoData(
  cache: PhotoCache,
  photoId: string,
  data: Partial<UnsplashPhoto>
): void {
  cache.entries[photoId] = {
    photoId,
    data,
    timestamp: Date.now(),
  };
}

/**
 * Get cache statistics
 */
export function getCacheStats(cache: PhotoCache): {
  totalEntries: number;
  validEntries: number;
  expiredEntries: number;
} {
  const now = Date.now();
  let validEntries = 0;
  let expiredEntries = 0;

  for (const entry of Object.values(cache.entries)) {
    const age = now - entry.timestamp;
    if (age <= CACHE_TTL_MS) {
      validEntries++;
    } else {
      expiredEntries++;
    }
  }

  return {
    totalEntries: Object.keys(cache.entries).length,
    validEntries,
    expiredEntries,
  };
}

/**
 * Clean expired entries from cache
 */
export function cleanExpiredCache(cache: PhotoCache): number {
  const now = Date.now();
  let cleaned = 0;

  for (const [photoId, entry] of Object.entries(cache.entries)) {
    const age = now - entry.timestamp;
    if (age > CACHE_TTL_MS) {
      delete cache.entries[photoId];
      cleaned++;
    }
  }

  return cleaned;
}

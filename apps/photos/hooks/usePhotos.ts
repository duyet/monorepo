import { useEffect, useState } from "react";
import { NetworkError, UnknownPhotoError } from "@/lib/errors";
import type { Photo } from "@/lib/types";
import type { PhotoFetchError } from "@/lib/errors";

interface UsePhotosResult {
  photos: Photo[];
  error: PhotoFetchError | null;
  isLoading: boolean;
}

let cachedPhotos: Photo[] | null = null;
let cacheError: PhotoFetchError | null = null;
let fetchPromise: Promise<void> | null = null;

const isServer = typeof window === "undefined";

/**
 * Read a JSON file from the public directory.
 * During SSR/prerender: reads from the filesystem directly.
 * During client-side: fetches via HTTP.
 */
async function readPublicJson<T>(path: string): Promise<T> {
  if (isServer) {
    const { readFileSync, existsSync } = await import("node:fs");
    const { join } = await import("node:path");
    const baseDir = import.meta.dirname ?? process.cwd();
    const candidates = [
      join(baseDir, "..", "public", path),
      join(baseDir, "..", "client", path),
      join(process.cwd(), "public", path),
    ];
    const filePath = candidates.find((p) => existsSync(p));
    if (!filePath) {
      throw new Error(`Public file not found: ${path}`);
    }
    return JSON.parse(readFileSync(filePath, "utf-8")) as T;
  }
  const res = await fetch(`/${path}`);
  if (!res.ok) {
    throw new NetworkError(
      `Failed to load ${path}: ${res.status} ${res.statusText}`
    );
  }
  return res.json() as Promise<T>;
}

/**
 * Fetch photos from the prebuild static JSON data file.
 * Falls back to empty array with error if unavailable.
 *
 * Photo data is generated at build time by scripts/generate-photos-data.ts
 * and written to public/photos-data.json.
 */
async function fetchPhotosData(): Promise<void> {
  try {
    const data = await readPublicJson<unknown>("photos-data.json");
    if (!Array.isArray(data)) {
      throw new UnknownPhotoError("Invalid photo data format");
    }
    cachedPhotos = data as Photo[];
    cacheError = null;
  } catch (err) {
    cachedPhotos = [];
    if (err instanceof NetworkError || err instanceof UnknownPhotoError) {
      cacheError = err;
    } else {
      cacheError = new UnknownPhotoError(err);
    }
  }
}

/**
 * Hook to load all photos for the gallery.
 * Uses a module-level cache so multiple components share one fetch.
 */
export function usePhotos(): UsePhotosResult {
  const [, forceUpdate] = useState(0);
  const [isLoading, setIsLoading] = useState(cachedPhotos === null);

  useEffect(() => {
    if (cachedPhotos !== null) {
      setIsLoading(false);
      return;
    }

    if (!fetchPromise) {
      fetchPromise = fetchPhotosData();
    }

    fetchPromise.then(() => {
      setIsLoading(false);
      forceUpdate((n) => n + 1);
    });
  }, []);

  return {
    photos: cachedPhotos ?? [],
    error: cacheError,
    isLoading,
  };
}

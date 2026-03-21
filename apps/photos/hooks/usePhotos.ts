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

/**
 * Fetch photos from the prebuild static JSON data file.
 * Falls back to empty array with error if unavailable.
 *
 * Photo data is generated at build time by scripts/generate-photos-data.ts
 * and written to public/photos-data.json.
 */
async function fetchPhotosData(): Promise<void> {
  try {
    const response = await fetch("/photos-data.json");
    if (!response.ok) {
      throw new NetworkError(
        `Failed to load photo data: ${response.status} ${response.statusText}`
      );
    }
    const data = await response.json();
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

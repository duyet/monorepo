import { getAllClickHousePhotos } from "./clickhouse-provider";
import { getAllCloudinaryPhotos } from "./cloudinary-provider";
import { getAllDuckDBPhotos } from "./duckdb-provider";
import type { PhotoFetchError } from "./errors";
import { UnknownPhotoError } from "./errors";
import { getFallbackPhotos } from "./fallback-provider";
import type { Photo } from "./types";
import { getAllUnsplashPhotos } from "./unsplash-provider";

// Re-export Photo type for convenience
export type { Photo } from "./types";

/**
 * Get all photos from all enabled providers.
 * Priority: ClickHouse (if available) > Unsplash API > Cloudinary > Fallback
 *
 * - ClickHouse: Fast, no rate limits, weekly sync
 * - Unsplash API: Fallback when ClickHouse unavailable/empty
 * - Cloudinary: Always fetched as additional photo source
 * - Fallback: Sample photos when all providers fail
 *
 * Always returns photos, never throws.
 */
export async function getAllPhotos(): Promise<Photo[]> {
  console.log("📸 Fetching photos from all providers...");
  console.log("");

  const allPhotos: Photo[] = [];
  const errors: PhotoFetchError[] = [];

  // Try the local DuckDB cache first so builds still have data when ClickHouse
  // is temporarily unreachable.
  const duckDBPhotos = await getAllDuckDBPhotos();
  if (duckDBPhotos.length > 0) {
    console.log("🦆 DuckDB cache available - using as primary source");
    allPhotos.push(...duckDBPhotos);
  }

  // Try ClickHouse next (fastest remote source, no Unsplash rate limits)
  const clickhousePhotos =
    allPhotos.length === 0 ? await getAllClickHousePhotos() : [];

  if (clickhousePhotos.length > 0) {
    console.log("🚀 ClickHouse data available - using as primary source");
    allPhotos.push(...clickhousePhotos);
  }

  // If no ClickHouse photos, fall back to API providers
  if (allPhotos.length === 0) {
    console.log("⚠️  No ClickHouse data - falling back to API providers");

    const [unsplashResult, cloudinaryResult] = await Promise.allSettled([
      getAllUnsplashPhotos(),
      getAllCloudinaryPhotos(),
    ]);

    // Handle Unsplash result
    if (unsplashResult.status === "fulfilled") {
      const result = unsplashResult.value;
      if (result.success) {
        allPhotos.push(...result.photos);
        console.log(`✅ Unsplash: ${result.photos.length} photos`);
      } else {
        console.error(
          `❌ Unsplash error: ${result.error.userMessage} (${result.error.type})`
        );
        errors.push(result.error);
      }
    } else {
      console.error(
        "❌ Unexpected error fetching Unsplash photos:",
        unsplashResult.reason
      );
      errors.push(new UnknownPhotoError(unsplashResult.reason));
    }

    // Handle Cloudinary result
    if (cloudinaryResult.status === "fulfilled") {
      allPhotos.push(...cloudinaryResult.value);
      console.log(`✅ Cloudinary: ${cloudinaryResult.value.length} photos`);
    } else {
      console.error(
        "❌ Error fetching Cloudinary photos:",
        cloudinaryResult.reason
      );
      errors.push(new UnknownPhotoError(cloudinaryResult.reason));
    }

    // If both providers failed and we have no photos, use fallback
    if (allPhotos.length === 0 && errors.length > 0) {
      console.log("");
      console.log("🚫 All photo providers failed to return photos.");
      console.log("   📦 Using fallback photos...");

      const fallbackPhotos = await getFallbackPhotos();
      allPhotos.push(...fallbackPhotos);
    }
  } else {
    // ClickHouse succeeded - still fetch Cloudinary for additional photos
    const cloudinaryResult = await getAllCloudinaryPhotos().catch(() => []);
    if (cloudinaryResult.length > 0) {
      allPhotos.push(...cloudinaryResult);
      console.log(
        `✅ Cloudinary (additional): ${cloudinaryResult.length} photos`
      );
    }
  }

  // Sort all photos by creation date (newest first) and deduplicate by ID
  const uniquePhotos = Array.from(
    new Map(allPhotos.map((p) => [p.id, p])).values()
  );

  uniquePhotos.sort((a, b) => {
    const dateA = new Date(a.created_at).getTime();
    const dateB = new Date(b.created_at).getTime();
    if (Number.isNaN(dateA) || Number.isNaN(dateB)) return 0;
    return dateB - dateA;
  });

  console.log("");
  console.log(`📊 Total unique photos: ${uniquePhotos.length}`);
  console.log("");

  return uniquePhotos;
}

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
 * Result type for getAllPhotos
 * Returns either photos or a structured error
 */
export type GetAllPhotosResult =
  | { success: true; photos: Photo[]; error: null }
  | { success: false; photos: []; error: PhotoFetchError };

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

/**
 * EXIF filter interface for client-side filtering
 */
export interface EXIFFilters {
  camera?: string;
  lens?: string;
  focalLength?: [number, number];
  iso?: [number, number];
  aperture?: [number, number];
}

/**
 * Filter photos by EXIF metadata
 * This is a helper function that can be used on the client side
 * The actual filtering is handled by the EXIFFilters component
 */
export function filterByEXIF(
  photos: Photo[],
  exifFilters: EXIFFilters
): Photo[] {
  return photos.filter((photo) => {
    // Photo must have EXIF data to be filtered
    if (!photo.exif) return false;

    // Camera filter
    if (exifFilters.camera) {
      const camera =
        photo.exif.name ||
        [photo.exif.make, photo.exif.model].filter(Boolean).join(" ");
      if (
        !camera ||
        !camera.toLowerCase().includes(exifFilters.camera.toLowerCase())
      ) {
        return false;
      }
    }

    // Lens filtering not supported yet — skip
    // (lens field is not present in Photo.exif interface)

    // Focal length filter
    if (exifFilters.focalLength) {
      const focalLength = photo.exif.focal_length
        ? Number.parseFloat(photo.exif.focal_length.toString())
        : null;
      if (
        focalLength !== null &&
        !Number.isNaN(focalLength) &&
        (focalLength < exifFilters.focalLength[0] ||
          focalLength > exifFilters.focalLength[1])
      ) {
        return false;
      }
    }

    // ISO filter
    if (exifFilters.iso) {
      if (
        photo.exif.iso !== null &&
        photo.exif.iso !== undefined &&
        (photo.exif.iso < exifFilters.iso[0] ||
          photo.exif.iso > exifFilters.iso[1])
      ) {
        return false;
      }
    }

    // Aperture filter
    if (exifFilters.aperture) {
      const aperture = photo.exif.aperture
        ? Number.parseFloat(photo.exif.aperture.toString().replace(/^f\//, ""))
        : null;
      if (
        aperture !== null &&
        !Number.isNaN(aperture) &&
        (aperture < exifFilters.aperture[0] ||
          aperture > exifFilters.aperture[1])
      ) {
        return false;
      }
    }

    return true;
  });
}

/**
 * Extract unique EXIF values from a photo collection
 * Useful for populating filter dropdowns
 */
export function getEXIFOptions(photos: Photo[]) {
  const cameras = new Set<string>();
  const focalLengths = new Set<number>();
  const isos = new Set<number>();
  const apertures = new Set<number>();

  photos.forEach((photo) => {
    if (!photo.exif) return;

    // Extract camera
    if (photo.exif.make || photo.exif.model || photo.exif.name) {
      const camera =
        photo.exif.name ||
        [photo.exif.make, photo.exif.model].filter(Boolean).join(" ");
      if (camera) cameras.add(camera);
    }

    // Extract focal length
    if (photo.exif.focal_length) {
      const fl = Number.parseFloat(photo.exif.focal_length.toString());
      if (!Number.isNaN(fl)) focalLengths.add(fl);
    }

    // Extract ISO
    if (photo.exif.iso) {
      isos.add(photo.exif.iso);
    }

    // Extract aperture
    if (photo.exif.aperture) {
      const apt = Number.parseFloat(
        photo.exif.aperture.toString().replace(/^f\//, "")
      );
      if (!Number.isNaN(apt)) apertures.add(apt);
    }
  });

  return {
    cameras: Array.from(cameras).sort(),
    focalLengths: Array.from(focalLengths).sort((a, b) => a - b),
    isos: Array.from(isos).sort((a, b) => a - b),
    apertures: Array.from(apertures).sort((a, b) => a - b),
  };
}

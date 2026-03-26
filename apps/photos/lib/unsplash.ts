import { createApi } from "unsplash-js";
import {
  cleanExpiredCache,
  getCachedPhotoData,
  getCacheStats,
  loadPhotoCache,
  savePhotoCache,
  setCachedPhotoData,
} from "./cache";
import { UNSPLASH_USERNAME } from "./config";
import {
  ApiError,
  AuthError,
  isRateLimitError,
  NetworkError,
  PhotoFetchError,
  RateLimitError,
  UnknownPhotoError,
} from "./errors";
import type { PhotosByYear, UnsplashPhoto } from "./types";

const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY;
const USERNAME = UNSPLASH_USERNAME;

let unsplash: ReturnType<typeof createApi> | null = null;

if (UNSPLASH_ACCESS_KEY) {
  unsplash = createApi({
    accessKey: UNSPLASH_ACCESS_KEY,
  });
}

export async function getUserPhotos(
  page = 1,
  perPage = 30,
  orderBy = "latest"
): Promise<UnsplashPhoto[]> {
  if (!unsplash) {
    throw new AuthError("unsplash");
  }

  try {
    const result = await unsplash.users.getPhotos({
      username: USERNAME,
      page,
      perPage,
      orderBy: orderBy as "latest" | "oldest" | "popular" | "views" | "downloads",
      stats: true, // Include statistics (views, downloads)
    });

    if (result.errors) {
      console.error("❌ Unsplash API errors:", result.errors);
      throw new ApiError(
        "unsplash",
        `Failed to fetch photos from Unsplash: ${result.errors.join(", ")}`
      );
    }

    const photos = (result.response?.results ||
      []) as unknown as UnsplashPhoto[];

    // Process photos with stats, location, and EXIF mapping
    const processedPhotos = photos.map((photo) => {
      return {
        ...photo,
        // Map statistics to our expected format if available
        stats: photo.statistics
          ? {
              views: photo.statistics.views?.total || 0,
              downloads: photo.statistics.downloads?.total || 0,
            }
          : undefined,
        // Ensure location and EXIF are properly passed through
        location: photo.location || undefined,
        exif: photo.exif || undefined,
      };
    });

    return processedPhotos;
  } catch (error) {
    // Check if it's a rate limit error
    if (isRateLimitError(error)) {
      console.warn(`🚫 Unsplash API rate limit hit on page ${page}`);
      throw new RateLimitError("unsplash");
    }

    // Re-throw our typed errors
    if (
      error instanceof RateLimitError ||
      error instanceof AuthError ||
      error instanceof ApiError ||
      error instanceof NetworkError
    ) {
      throw error;
    }

    // Wrap unknown errors
    console.error("❌ Error fetching user photos:", error);
    throw new UnknownPhotoError(error);
  }
}

/**
 * Track a photo download (required by Unsplash API guidelines)
 * This should be called when displaying photos during build time
 *
 * @param downloadLocation - The download_location URL from photo.links.download_location
 */
export async function trackPhotoDownload(
  downloadLocation: string
): Promise<void> {
  if (!unsplash) {
    return;
  }

  try {
    // Use the download_location URL directly from the photo object
    // This URL includes necessary authentication parameters (ixid)
    await unsplash.photos.trackDownload({ downloadLocation });
  } catch (error) {
    // Don't fail the build if tracking fails
    // This is a non-critical operation
    if (error instanceof Error) {
      console.debug(`  Download tracking failed: ${error.message}`);
    }
  }
}

/**
 * Fetch detailed photo information including EXIF and location data
 * This is used when the listing API doesn't provide complete metadata
 *
 * @returns Photo details, null on error, or 'RATE_LIMIT' string if rate limited
 */
export async function getPhotoDetails(
  photoId: string
): Promise<Partial<UnsplashPhoto> | null | "RATE_LIMIT"> {
  if (!unsplash) {
    return null;
  }

  try {
    const result = await unsplash.photos.get({ photoId });

    // Log API response status for debugging
    if (result.status) {
      console.debug(`   API response for ${photoId}: HTTP ${result.status}`);
    }

    if (result.errors) {
      console.error(
        `   ⚠️  API errors for photo ${photoId}:`,
        JSON.stringify(result.errors, null, 2)
      );
      return null;
    }

    if (result.response) {
      const detailed = result.response as Partial<UnsplashPhoto>;
      return {
        location: detailed.location,
        exif: detailed.exif,
        description: detailed.description,
        alt_description: detailed.alt_description,
      };
    }

    console.warn(`   ⚠️  No response data for photo ${photoId}`);
    return null;
  } catch (error) {
    // Check for rate limit error first
    if (isRateLimitError(error)) {
      console.warn(`   ⚠️  Rate limit reached at photo ${photoId}`);
      return "RATE_LIMIT";
    }

    // Enhanced error logging with more details
    console.error(`   ❌ Failed to fetch details for photo ${photoId}:`);

    if (error instanceof Error) {
      console.error(`      Error message: ${error.message}`);
      console.error(`      Error name: ${error.name}`);

      // Check if it's a fetch/network error with response
      if ("response" in error) {
        const err = error as Error & { response?: { status?: number; statusText?: string } };
        console.error(
          `      HTTP Status: ${err.response?.status ?? "unknown"}`
        );
        console.error(
          `      Status Text: ${err.response?.statusText ?? "unknown"}`
        );
      }

      // Log stack trace for debugging
      if (error.stack) {
        console.error(
          `      Stack trace: ${error.stack.split("\n").slice(0, 3).join("\n")}`
        );
      }
    } else {
      console.error("      Raw error:", JSON.stringify(error, null, 2));
    }

    return null;
  }
}

/**
 * Check if a photo needs detailed data enrichment
 */
function needsEnrichment(photo: UnsplashPhoto): boolean {
  // Only fetch details if we're missing EXIF or location data
  const hasExif =
    photo.exif &&
    (photo.exif.make ||
      photo.exif.model ||
      photo.exif.aperture ||
      photo.exif.exposure_time);
  const hasLocation =
    photo.location && (photo.location.city || photo.location.country);

  return !hasExif || !hasLocation;
}

export async function getAllUserPhotos(): Promise<UnsplashPhoto[]> {
  const allPhotos: UnsplashPhoto[] = [];
  let page = 1;
  let hasMore = true;
  const maxPages = 3; // Limit to avoid rate limits
  let rateLimitError: RateLimitError | null = null;
  let otherError: Error | null = null;

  console.log("📸 Fetching user photos from Unsplash...");

  // Step 1: Fetch all pages of photos
  while (hasMore && page <= maxPages) {
    try {
      const photos = await getUserPhotos(page, 30, "latest");

      if (photos.length === 0) {
        hasMore = false;
      } else {
        allPhotos.push(...photos);
        console.log(`   ✓ Fetched page ${page}: ${photos.length} photos`);
        page++;

        // Respect rate limits - add a delay between page requests
        if (page <= maxPages) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      }
    } catch (error) {
      // If we hit rate limits, stop fetching more pages but return what we have
      if (error instanceof RateLimitError) {
        console.warn(`🚫 Rate limit reached while fetching page ${page}`);
        console.warn(
          "   💡 Unsplash API limit: 50 requests/hour for demo applications"
        );
        console.warn(
          `   📦 Using ${allPhotos.length} photos already fetched from previous pages`
        );
        rateLimitError = error;
        hasMore = false;
      } else if (error instanceof PhotoFetchError) {
        // For other typed errors, log and continue with what we have
        console.error(`❌ Error fetching page ${page}: ${error.message}`);
        otherError = error;
        hasMore = false;
      } else {
        console.error(`❌ Unexpected error fetching page ${page}:`, error);
        otherError = error instanceof Error ? error : new Error(String(error));
        hasMore = false;
      }
    }
  }

  console.log(`📊 Total photos fetched: ${allPhotos.length}`);

  // Step 2: Load cache and enrich photos with detailed data if needed
  console.log("💾 Loading photo cache...");
  const cache = await loadPhotoCache();
  const cacheStats = getCacheStats(cache);
  console.log(
    `   Cache contains ${cacheStats.validEntries} valid entries (${cacheStats.expiredEntries} expired)`
  );

  // Clean expired entries
  if (cacheStats.expiredEntries > 0) {
    const cleaned = cleanExpiredCache(cache);
    console.log(`   Cleaned ${cleaned} expired cache entries`);
  }

  const photosNeedingEnrichment = allPhotos.filter(needsEnrichment);

  if (photosNeedingEnrichment.length > 0) {
    console.log(
      `🔍 Enriching ${photosNeedingEnrichment.length} photos with detailed EXIF and location data...`
    );

    let successCount = 0;
    let failureCount = 0;
    let freshCacheHits = 0;
    let expiredCacheUsed = 0;
    let apiCalls = 0;
    let rateLimitHit = false;
    const failedPhotos: string[] = [];

    for (let i = 0; i < photosNeedingEnrichment.length; i++) {
      const photo = photosNeedingEnrichment[i];

      try {
        // Check cache first (returns both fresh and expired cache)
        const cacheResult = getCachedPhotoData(cache, photo.id);

        // If cache is fresh (not expired), use it directly
        if (cacheResult && !cacheResult.isExpired) {
          Object.assign(photo, {
            location: cacheResult.data.location || photo.location,
            exif: cacheResult.data.exif || photo.exif,
            description: cacheResult.data.description || photo.description,
            alt_description:
              cacheResult.data.alt_description || photo.alt_description,
          });
          successCount++;
          freshCacheHits++;

          if ((i + 1) % 10 === 0) {
            console.log(
              `   ✓ Enriched ${i + 1}/${photosNeedingEnrichment.length} photos (${successCount} success, ${freshCacheHits} fresh cache, ${expiredCacheUsed} stale cache, ${apiCalls} API calls)`
            );
          }
          continue;
        }

        // Cache is expired or doesn't exist - need to fetch from API
        // Stop making API calls if we hit rate limit
        if (rateLimitHit) {
          // Try to use expired cache as fallback
          if (cacheResult) {
            console.log(
              `   📦 Using stale cache for ${photo.id} (rate limit reached)`
            );
            Object.assign(photo, {
              location: cacheResult.data.location || photo.location,
              exif: cacheResult.data.exif || photo.exif,
              description: cacheResult.data.description || photo.description,
              alt_description:
                cacheResult.data.alt_description || photo.alt_description,
            });
            successCount++;
            expiredCacheUsed++;
          } else {
            console.log(
              `   ⏭️  Skipping ${photo.id} (rate limit reached, no cache available)`
            );
            failureCount++;
            failedPhotos.push(photo.id);
          }
          continue;
        }

        // Fetch from API
        const details = await getPhotoDetails(photo.id);
        apiCalls++;

        // Check if we hit rate limit
        if (details === "RATE_LIMIT") {
          rateLimitHit = true;
          console.warn("");
          console.warn("   🚫 Rate limit reached! Stopping further API calls.");
          console.warn(
            "   💡 Will use stale cache data for remaining photos when available."
          );
          console.warn("");

          // Use expired cache as fallback for this photo
          if (cacheResult) {
            Object.assign(photo, {
              location: cacheResult.data.location || photo.location,
              exif: cacheResult.data.exif || photo.exif,
              description: cacheResult.data.description || photo.description,
              alt_description:
                cacheResult.data.alt_description || photo.alt_description,
            });
            successCount++;
            expiredCacheUsed++;
          } else {
            failureCount++;
            failedPhotos.push(photo.id);
          }
          continue;
        }

        // Handle successful API response
        if (details) {
          // Cache the fresh result
          setCachedPhotoData(cache, photo.id, details);

          // Merge detailed data into the photo
          Object.assign(photo, {
            location: details.location || photo.location,
            exif: details.exif || photo.exif,
            description: details.description || photo.description,
            alt_description: details.alt_description || photo.alt_description,
          });
          successCount++;

          if ((i + 1) % 10 === 0) {
            console.log(
              `   ✓ Enriched ${i + 1}/${photosNeedingEnrichment.length} photos (${successCount} success, ${freshCacheHits} fresh cache, ${expiredCacheUsed} stale cache, ${apiCalls} API calls)`
            );
          }
        } else {
          // API returned null (error) - use expired cache as fallback
          if (cacheResult) {
            console.log(`   📦 API error for ${photo.id}, using stale cache`);
            Object.assign(photo, {
              location: cacheResult.data.location || photo.location,
              exif: cacheResult.data.exif || photo.exif,
              description: cacheResult.data.description || photo.description,
              alt_description:
                cacheResult.data.alt_description || photo.alt_description,
            });
            successCount++;
            expiredCacheUsed++;
          } else {
            failureCount++;
            failedPhotos.push(photo.id);
          }
        }

        // Rate limiting: add delay after API calls
        if (i < photosNeedingEnrichment.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 800));
        }
      } catch (error) {
        // Catch unexpected errors and continue
        failureCount++;
        failedPhotos.push(photo.id);
        console.error(
          `   ⚠️  Unexpected error enriching photo ${photo.id}:`,
          error
        );
        // Continue with other photos even if one fails
      }
    }

    console.log("");
    console.log(
      `   ✅ Enrichment complete: ${successCount}/${photosNeedingEnrichment.length} photos enriched successfully`
    );
    console.log(
      `   📊 Fresh cache: ${freshCacheHits}, Stale cache: ${expiredCacheUsed}, API calls: ${apiCalls}`
    );
    console.log(
      `   💰 Saved ${freshCacheHits + expiredCacheUsed} API requests by using cache!`
    );

    if (expiredCacheUsed > 0) {
      console.log(
        `   💡 ${expiredCacheUsed} photos used stale cache data (TTL expired but kept as fallback)`
      );
    }

    if (failureCount > 0) {
      console.log(
        `   ⚠️  ${failureCount} photos failed to enrich (no cache or API available)`
      );
      if (failedPhotos.length <= 10) {
        console.log(`   Failed photo IDs: ${failedPhotos.join(", ")}`);
      } else {
        console.log(
          `   Failed photo IDs (first 10): ${failedPhotos.slice(0, 10).join(", ")}...`
        );
      }
      console.log("");

      if (rateLimitHit) {
        console.log("   🚫 Rate limit was reached during enrichment.");
        console.log(
          "   💡 Next build will use cache and continue where we left off."
        );
        console.log(
          "   Photos without enriched data will still display with available metadata."
        );
      } else {
        console.log("   💡 Tip: Common causes for enrichment failures:");
        console.log(
          "      • Unsplash API rate limit reached (50 requests/hour)"
        );
        console.log("      • Network connectivity issues");
        console.log("      • Temporary Unsplash API issues");
        console.log(
          "   Photos without enriched data will still display with available metadata."
        );
      }
    }

    // Save cache after enrichment
    console.log("   💾 Saving cache...");
    await savePhotoCache(cache);
    console.log("   ✓ Cache saved successfully");
  } else {
    console.log("✓ All photos already have complete metadata");
  }

  // Step 3: Track downloads for all photos (required by Unsplash API guidelines)
  // According to Unsplash: "trigger download endpoint when displaying photos"
  console.log("📥 Tracking photo downloads for Unsplash attribution...");
  let downloadTrackingErrors = 0;

  for (let i = 0; i < allPhotos.length; i++) {
    const photo = allPhotos[i];

    try {
      // Use the download_location from photo.links which includes auth params
      await trackPhotoDownload(photo.links.download_location);
    } catch (_error) {
      downloadTrackingErrors++;
      // Silent fail - don't clutter logs
    }

    // Small delay to avoid rate limits (batch requests)
    if ((i + 1) % 20 === 0 && i < allPhotos.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }

  if (downloadTrackingErrors > 0) {
    console.log(
      `   ⚠️  ${downloadTrackingErrors}/${allPhotos.length} download tracking calls failed (non-critical)`
    );
  } else {
    console.log(
      `   ✓ Successfully tracked ${allPhotos.length} photo downloads`
    );
  }

  console.log(
    `✨ Completed: ${allPhotos.length} photos ready with full metadata`
  );

  // If we got no photos at all, throw the error that stopped us
  if (allPhotos.length === 0) {
    if (rateLimitError) {
      throw rateLimitError;
    }
    if (otherError) {
      throw otherError;
    }
    throw new UnknownPhotoError("No photos were fetched from Unsplash");
  }

  return allPhotos;
}

export function groupPhotosByYear(photos: UnsplashPhoto[]): PhotosByYear {
  return photos.reduce((acc: PhotosByYear, photo) => {
    const year = new Date(photo.created_at).getFullYear().toString();

    if (!acc[year]) {
      acc[year] = [];
    }

    acc[year].push(photo);
    return acc;
  }, {});
}

export function getPhotosByYear(
  photos: UnsplashPhoto[],
  year: string
): UnsplashPhoto[] {
  return photos.filter((photo) => {
    const photoYear = new Date(photo.created_at).getFullYear().toString();
    return photoYear === year;
  });
}

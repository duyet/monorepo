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
      orderBy: orderBy as any,
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
      const detailed = result.response as any;
      return {
        location: detailed.location,
        exif: detailed.exif,
        // Also include any other fields that might be missing
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
        const err = error as any;
        console.error(
          `      HTTP Status: ${err.response?.status || "unknown"}`
        );
        console.error(
          `      Status Text: ${err.response?.statusText || "unknown"}`
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

/**
 * The subset of photo fields that enrichment can contribute, either from the
 * detail API or from a cache entry.
 */
type EnrichmentSource = {
  location?: UnsplashPhoto["location"];
  exif?: UnsplashPhoto["exif"];
  description?: UnsplashPhoto["description"];
  alt_description?: UnsplashPhoto["alt_description"];
};

/**
 * Merge enrichment data into a photo, keeping the photo's existing value
 * whenever the incoming source does not carry a field. Applied identically
 * for fresh cache, stale cache, and successful API responses.
 */
function applyEnrichment(
  photo: UnsplashPhoto,
  source: EnrichmentSource
): void {
  Object.assign(photo, {
    location: source.location || photo.location,
    exif: source.exif || photo.exif,
    description: source.description || photo.description,
    alt_description: source.alt_description || photo.alt_description,
  });
}

/**
 * Running tallies used to report enrichment progress.
 */
type EnrichmentCounters = {
  success: number;
  freshCache: number;
  staleCache: number;
  apiCalls: number;
};

function logEnrichmentProgress(
  completed: number,
  total: number,
  counters: EnrichmentCounters
): void {
  console.log(
    `   ✓ Enriched ${completed}/${total} photos (${counters.success} success, ${counters.freshCache} fresh cache, ${counters.staleCache} stale cache, ${counters.apiCalls} API calls)`
  );
}

/** Why pagination stopped early, if it did. Re-thrown only when nothing arrived. */
interface PaginationOutcome {
  photos: UnsplashPhoto[];
  rateLimitError: RateLimitError | null;
  otherError: Error | null;
}

/** Unsplash demo accounts are limited to 50 requests/hour; three pages is well inside it. */
const MAX_PAGES = 3;
const PER_PAGE = 30;
const PAGE_DELAY_MS = 1000;
const ENRICH_DELAY_MS = 800;
const DOWNLOAD_BATCH = 20;
const DOWNLOAD_DELAY_MS = 500;

/** Resolve after `ms`. Named so the delays above are the only place time is invented. */
const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Step 1 — page through the user's photos.
 *
 * A failure does **not** discard what was already fetched: the error is
 * recorded and returned alongside the photos, and the caller only re-throws it
 * when the account yielded nothing at all. That is why a mid-run rate limit
 * degrades the build rather than failing it.
 */
async function fetchAllPages(): Promise<PaginationOutcome> {
  const photos: UnsplashPhoto[] = [];
  let page = 1;
  let hasMore = true;
  let rateLimitError: RateLimitError | null = null;
  let otherError: Error | null = null;

  console.log("📸 Fetching user photos from Unsplash...");

  while (hasMore && page <= MAX_PAGES) {
    try {
      const batch = await getUserPhotos(page, PER_PAGE, "latest");

      if (batch.length === 0) {
        hasMore = false;
      } else {
        photos.push(...batch);
        console.log(`   ✓ Fetched page ${page}: ${batch.length} photos`);
        page++;

        // Respect rate limits - add a delay between page requests
        if (page <= MAX_PAGES) {
          await sleep(PAGE_DELAY_MS);
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
          `   📦 Using ${photos.length} photos already fetched from previous pages`
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

  console.log(`📊 Total photos fetched: ${photos.length}`);
  return { photos, rateLimitError, otherError };
}

/**
 * Step 3 — fire Unsplash's download endpoint for each photo.
 *
 * Required by the API's attribution rules ("trigger download endpoint when
 * displaying photos"). **Failures are counted and otherwise ignored**: this is
 * attribution bookkeeping, and a tracking outage must not fail a build that
 * has already produced a complete gallery.
 */
async function trackDownloads(photos: UnsplashPhoto[]): Promise<void> {
  console.log("📥 Tracking photo downloads for Unsplash attribution...");
  let downloadTrackingErrors = 0;

  for (let i = 0; i < photos.length; i++) {
    const photo = photos[i];

    try {
      // Use the download_location from photo.links which includes auth params
      await trackPhotoDownload(photo.links.download_location);
    } catch (_error) {
      downloadTrackingErrors++;
      // Silent fail - don't clutter logs
    }

    // Small delay to avoid rate limits (batch requests)
    if ((i + 1) % DOWNLOAD_BATCH === 0 && i < photos.length - 1) {
      await sleep(DOWNLOAD_DELAY_MS);
    }
  }

  if (downloadTrackingErrors > 0) {
    console.log(
      `   ⚠️  ${downloadTrackingErrors}/${photos.length} download tracking calls failed (non-critical)`
    );
  } else {
    console.log(`   ✓ Successfully tracked ${photos.length} photo downloads`);
  }

  console.log(`✨ Completed: ${photos.length} photos ready with full metadata`);
}

/**
 * Fetch, enrich and track every photo the user has.
 *
 * Three sequential phases, each of which degrades rather than fails: a
 * partial page set, an un-enrichable photo, and a failed download-tracking
 * call all still produce a usable gallery.
 */
/**
 * Step 2 — fill in EXIF and location data, from cache where possible.
 *
 * Three fallbacks, in order, and all of them are shipped behaviour rather
 * than an accident:
 *
 * 1. a **fresh** cache entry is used without touching the API;
 * 2. an **expired** entry is used when the API call fails or the rate limit
 *    is hit — a slightly stale EXIF beats none, and the build is not allowed
 *    to stall on it;
 * 3. otherwise the photo is left as-is, counted and logged, and still
 *    returned. A gallery with unenriched photos is a valid outcome.
 *
 * Once the rate limit is hit mid-run, no further API calls are made and every
 * remaining photo takes fallback 2.
 */
async function enrichPhotos(photos: UnsplashPhoto[]): Promise<void> {
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

const photosNeedingEnrichment = photos.filter(needsEnrichment);

if (photosNeedingEnrichment.length > 0) {
  console.log(
    `🔍 Enriching ${photosNeedingEnrichment.length} photos with detailed EXIF and location data...`
  );

  const counters: EnrichmentCounters = {
    success: 0,
    freshCache: 0,
    staleCache: 0,
    apiCalls: 0,
  };
  let failureCount = 0;
  let rateLimitHit = false;
  const failedPhotos: string[] = [];

  const total = photosNeedingEnrichment.length;

  /**
   * Fall back to an expired cache entry for a photo whose API enrichment did
   * not happen. Returns true when the cache entry was usable.
   */
  const useStaleCache = (
    photo: UnsplashPhoto,
    cacheResult: ReturnType<typeof getCachedPhotoData>
  ): boolean => {
    if (cacheResult) {
      applyEnrichment(photo, cacheResult.data);
      counters.success++;
      counters.staleCache++;
      return true;
    }

    failureCount++;
    failedPhotos.push(photo.id);
    return false;
  };

  for (let i = 0; i < photosNeedingEnrichment.length; i++) {
    const photo = photosNeedingEnrichment[i];

    try {
      // Check cache first (returns both fresh and expired cache)
      const cacheResult = getCachedPhotoData(cache, photo.id);

      // If cache is fresh (not expired), use it directly
      if (cacheResult && !cacheResult.isExpired) {
        applyEnrichment(photo, cacheResult.data);
        counters.success++;
        counters.freshCache++;

        if ((i + 1) % 10 === 0) {
          logEnrichmentProgress(i + 1, total, counters);
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
        } else {
          console.log(
            `   ⏭️  Skipping ${photo.id} (rate limit reached, no cache available)`
          );
        }
        useStaleCache(photo, cacheResult);
        continue;
      }

      // Fetch from API
      const details = await getPhotoDetails(photo.id);
      counters.apiCalls++;

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
        useStaleCache(photo, cacheResult);
        continue;
      }

      // Handle successful API response
      if (details) {
        // Cache the fresh result
        setCachedPhotoData(cache, photo.id, details);

        // Merge detailed data into the photo
        applyEnrichment(photo, details);
        counters.success++;

        if ((i + 1) % 10 === 0) {
          logEnrichmentProgress(i + 1, total, counters);
        }
      } else {
        // API returned null (error) - use expired cache as fallback
        if (cacheResult) {
          console.log(`   📦 API error for ${photo.id}, using stale cache`);
        }
        useStaleCache(photo, cacheResult);
      }

      // Rate limiting: add delay after API calls
      if (i < photosNeedingEnrichment.length - 1) {
        await sleep(ENRICH_DELAY_MS);
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
    `   ✅ Enrichment complete: ${counters.success}/${total} photos enriched successfully`
  );
  console.log(
    `   📊 Fresh cache: ${counters.freshCache}, Stale cache: ${counters.staleCache}, API calls: ${counters.apiCalls}`
  );
  console.log(
    `   💰 Saved ${counters.freshCache + counters.staleCache} API requests by using cache!`
  );

  if (counters.staleCache > 0) {
    console.log(
      `   💡 ${counters.staleCache} photos used stale cache data (TTL expired but kept as fallback)`
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
}

export async function getAllUserPhotos(): Promise<UnsplashPhoto[]> {
  const { photos: allPhotos, rateLimitError, otherError } = await fetchAllPages();

  // Step 2: Load cache and enrich photos with detailed data if needed
  await enrichPhotos(allPhotos);

  // Step 3: Track downloads for all photos (required by Unsplash API guidelines)
  await trackDownloads(allPhotos);

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

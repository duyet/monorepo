import { createApi } from 'unsplash-js'
import type { PhotosByYear, UnsplashPhoto } from './types'
import {
  loadPhotoCache,
  savePhotoCache,
  getCachedPhotoData,
  setCachedPhotoData,
  getCacheStats,
  cleanExpiredCache,
} from './cache'

const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY
const USERNAME = '_duyet'

let unsplash: ReturnType<typeof createApi> | null = null

if (UNSPLASH_ACCESS_KEY) {
  unsplash = createApi({
    accessKey: UNSPLASH_ACCESS_KEY,
  })
}

export async function getUserPhotos(
  page = 1,
  perPage = 30,
  orderBy = 'latest',
): Promise<UnsplashPhoto[]> {
  if (!unsplash) {
    console.warn('UNSPLASH_ACCESS_KEY not configured, returning empty array')
    return []
  }

  try {
    const result = await unsplash.users.getPhotos({
      username: USERNAME,
      page,
      perPage,
      orderBy: orderBy as any,
      stats: true, // Include statistics (views, downloads)
    })

    if (result.errors) {
      console.error('Unsplash API errors:', result.errors)
      throw new Error('Failed to fetch photos from Unsplash')
    }

    const photos = (result.response?.results ||
      []) as unknown as UnsplashPhoto[]

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
      }
    })

    return processedPhotos
  } catch (error) {
    // Check if it's a rate limit error
    if (
      error instanceof Error &&
      error.message.includes('expected JSON response')
    ) {
      console.warn(`Rate limit hit on page ${page}, returning empty array`)
      return []
    }
    console.error('Error fetching user photos:', error)
    throw error
  }
}

/**
 * Track a photo download (required by Unsplash API guidelines)
 * This should be called when displaying photos during build time
 */
export async function trackPhotoDownload(
  photoId: string,
): Promise<void> {
  if (!unsplash) {
    return
  }

  try {
    await unsplash.photos.trackDownload({ downloadLocation: `https://api.unsplash.com/photos/${photoId}/download` })
  } catch (error) {
    // Don't fail the build if tracking fails
    console.warn(`Failed to track download for photo ${photoId}:`, error)
  }
}

/**
 * Check if error is a rate limit error
 */
function isRateLimitError(error: unknown): boolean {
  if (!(error instanceof Error)) return false

  // Common rate limit error patterns
  return (
    error.message.includes('expected JSON response') ||
    error.message.includes('Rate Limit Exceeded') ||
    error.message.includes('429') ||
    ('response' in error && (error as any).response?.status === 429)
  )
}

/**
 * Fetch detailed photo information including EXIF and location data
 * This is used when the listing API doesn't provide complete metadata
 *
 * @returns Photo details, null on error, or 'RATE_LIMIT' string if rate limited
 */
export async function getPhotoDetails(
  photoId: string,
): Promise<Partial<UnsplashPhoto> | null | 'RATE_LIMIT'> {
  if (!unsplash) {
    return null
  }

  try {
    const result = await unsplash.photos.get({ photoId })

    // Log API response status for debugging
    if (result.status) {
      console.debug(`   API response for ${photoId}: HTTP ${result.status}`)
    }

    if (result.errors) {
      console.error(`   ⚠️  API errors for photo ${photoId}:`, JSON.stringify(result.errors, null, 2))
      return null
    }

    if (result.response) {
      const detailed = result.response as any
      return {
        location: detailed.location,
        exif: detailed.exif,
        // Also include any other fields that might be missing
        description: detailed.description,
        alt_description: detailed.alt_description,
      }
    }

    console.warn(`   ⚠️  No response data for photo ${photoId}`)
    return null
  } catch (error) {
    // Check for rate limit error first
    if (isRateLimitError(error)) {
      console.warn(`   ⚠️  Rate limit reached at photo ${photoId}`)
      return 'RATE_LIMIT'
    }

    // Enhanced error logging with more details
    console.error(`   ❌ Failed to fetch details for photo ${photoId}:`)

    if (error instanceof Error) {
      console.error(`      Error message: ${error.message}`)
      console.error(`      Error name: ${error.name}`)

      // Check if it's a fetch/network error with response
      if ('response' in error) {
        const err = error as any
        console.error(`      HTTP Status: ${err.response?.status || 'unknown'}`)
        console.error(`      Status Text: ${err.response?.statusText || 'unknown'}`)
      }

      // Log stack trace for debugging
      if (error.stack) {
        console.error(`      Stack trace: ${error.stack.split('\n').slice(0, 3).join('\n')}`)
      }
    } else {
      console.error(`      Raw error:`, JSON.stringify(error, null, 2))
    }

    return null
  }
}

/**
 * Check if a photo needs detailed data enrichment
 */
function needsEnrichment(photo: UnsplashPhoto): boolean {
  // Only fetch details if we're missing EXIF or location data
  const hasExif = photo.exif && (
    photo.exif.make ||
    photo.exif.model ||
    photo.exif.aperture ||
    photo.exif.exposure_time
  )
  const hasLocation = photo.location && (photo.location.city || photo.location.country)

  return !hasExif || !hasLocation
}

export async function getAllUserPhotos(): Promise<UnsplashPhoto[]> {
  const allPhotos: UnsplashPhoto[] = []
  let page = 1
  let hasMore = true
  const maxPages = 3 // Limit to avoid rate limits

  console.log('📸 Fetching user photos from Unsplash...')

  // Step 1: Fetch all pages of photos
  while (hasMore && page <= maxPages) {
    try {
      const photos = await getUserPhotos(page, 30, 'latest')

      if (photos.length === 0) {
        hasMore = false
      } else {
        allPhotos.push(...photos)
        console.log(`   ✓ Fetched page ${page}: ${photos.length} photos`)
        page++

        // Respect rate limits - add a delay between page requests
        if (page <= maxPages) {
          await new Promise((resolve) => setTimeout(resolve, 1000))
        }
      }
    } catch (error) {
      console.error(`Error fetching page ${page}:`, error)

      // If we hit rate limits, stop fetching more pages but return what we have
      if (
        error instanceof Error &&
        error.message.includes('expected JSON response')
      ) {
        console.warn('Likely hit rate limits, stopping at page', page - 1)
        hasMore = false
      } else {
        hasMore = false
      }
    }
  }

  console.log(`📊 Total photos fetched: ${allPhotos.length}`)

  // Step 2: Load cache and enrich photos with detailed data if needed
  console.log(`💾 Loading photo cache...`)
  const cache = await loadPhotoCache()
  const cacheStats = getCacheStats(cache)
  console.log(`   Cache contains ${cacheStats.validEntries} valid entries (${cacheStats.expiredEntries} expired)`)

  // Clean expired entries
  if (cacheStats.expiredEntries > 0) {
    const cleaned = cleanExpiredCache(cache)
    console.log(`   Cleaned ${cleaned} expired cache entries`)
  }

  const photosNeedingEnrichment = allPhotos.filter(needsEnrichment)

  if (photosNeedingEnrichment.length > 0) {
    console.log(`🔍 Enriching ${photosNeedingEnrichment.length} photos with detailed EXIF and location data...`)

    let successCount = 0
    let failureCount = 0
    let cacheHits = 0
    let apiCalls = 0
    let rateLimitHit = false
    const failedPhotos: string[] = []

    for (let i = 0; i < photosNeedingEnrichment.length; i++) {
      const photo = photosNeedingEnrichment[i]

      try {
        // Check cache first
        const cachedData = getCachedPhotoData(cache, photo.id)

        if (cachedData) {
          // Use cached data - merge into photo
          Object.assign(photo, {
            location: cachedData.location || photo.location,
            exif: cachedData.exif || photo.exif,
            description: cachedData.description || photo.description,
            alt_description: cachedData.alt_description || photo.alt_description,
          })
          successCount++
          cacheHits++

          if ((i + 1) % 10 === 0) {
            console.log(`   ✓ Enriched ${i + 1}/${photosNeedingEnrichment.length} photos (${successCount} success, ${cacheHits} cache hits, ${apiCalls} API calls)`)
          }
          continue
        }

        // No cache - need to fetch from API
        // Stop making API calls if we hit rate limit
        if (rateLimitHit) {
          console.log(`   ⏭️  Skipping API call for ${photo.id} (rate limit reached)`)
          failureCount++
          failedPhotos.push(photo.id)
          continue
        }

        // Fetch from API
        const details = await getPhotoDetails(photo.id)
        apiCalls++

        // Check if we hit rate limit
        if (details === 'RATE_LIMIT') {
          rateLimitHit = true
          failureCount++
          failedPhotos.push(photo.id)
          console.warn(``)
          console.warn(`   🚫 Rate limit reached! Stopping further API calls.`)
          console.warn(`   💡 Remaining photos will use cached data if available, or continue without enrichment.`)
          console.warn(``)
          continue
        }

        // Handle successful API response
        if (details) {
          // Cache the result
          setCachedPhotoData(cache, photo.id, details)

          // Merge detailed data into the photo
          Object.assign(photo, {
            location: details.location || photo.location,
            exif: details.exif || photo.exif,
            description: details.description || photo.description,
            alt_description: details.alt_description || photo.alt_description,
          })
          successCount++

          if ((i + 1) % 10 === 0) {
            console.log(`   ✓ Enriched ${i + 1}/${photosNeedingEnrichment.length} photos (${successCount} success, ${cacheHits} cache hits, ${apiCalls} API calls)`)
          }
        } else {
          // API returned null (error)
          failureCount++
          failedPhotos.push(photo.id)
        }

        // Rate limiting: add delay after API calls
        if (i < photosNeedingEnrichment.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 800))
        }
      } catch (error) {
        // Catch unexpected errors and continue
        failureCount++
        failedPhotos.push(photo.id)
        console.error(`   ⚠️  Unexpected error enriching photo ${photo.id}:`, error)
        // Continue with other photos even if one fails
      }
    }

    console.log(``)
    console.log(`   ✅ Enrichment complete: ${successCount}/${photosNeedingEnrichment.length} photos enriched successfully`)
    console.log(`   📊 Cache hits: ${cacheHits}, API calls: ${apiCalls} (saved ${cacheHits} API requests!)`)

    if (failureCount > 0) {
      console.log(`   ⚠️  ${failureCount} photos failed to enrich`)
      if (failedPhotos.length <= 10) {
        console.log(`   Failed photo IDs: ${failedPhotos.join(', ')}`)
      } else {
        console.log(`   Failed photo IDs (first 10): ${failedPhotos.slice(0, 10).join(', ')}...`)
      }
      console.log(``)

      if (rateLimitHit) {
        console.log(`   🚫 Rate limit was reached during enrichment.`)
        console.log(`   💡 Next build will use cache and continue where we left off.`)
        console.log(`   Photos without enriched data will still display with available metadata.`)
      } else {
        console.log(`   💡 Tip: Common causes for enrichment failures:`)
        console.log(`      • Unsplash API rate limit reached (50 requests/hour)`)
        console.log(`      • Network connectivity issues`)
        console.log(`      • Temporary Unsplash API issues`)
        console.log(`   Photos without enriched data will still display with available metadata.`)
      }
    }

    // Save cache after enrichment
    console.log(`   💾 Saving cache...`)
    await savePhotoCache(cache)
    console.log(`   ✓ Cache saved successfully`)
  } else {
    console.log('✓ All photos already have complete metadata')
  }

  // Step 3: Track downloads for all photos (required by Unsplash API guidelines)
  // This is required when displaying photos, even during build time
  console.log('📥 Tracking photo downloads for Unsplash attribution...')
  let downloadTrackingErrors = 0
  for (let i = 0; i < allPhotos.length; i++) {
    try {
      await trackPhotoDownload(allPhotos[i].id)
    } catch (error) {
      downloadTrackingErrors++
      // Don't fail the build, but count errors
      if (downloadTrackingErrors === 1) {
        console.warn('   ⚠️  Some download tracking calls failed (this is non-critical)')
      }
    }

    // Small delay to avoid rate limits
    if (i < allPhotos.length - 1 && i % 20 === 0) {
      await new Promise((resolve) => setTimeout(resolve, 500))
    }
  }

  if (downloadTrackingErrors > 0) {
    console.log(`   ⚠️  ${downloadTrackingErrors}/${allPhotos.length} download tracking calls failed (non-critical)`)
  }

  console.log(`✨ Completed: ${allPhotos.length} photos ready with full metadata`)

  return allPhotos
}

export function groupPhotosByYear(photos: UnsplashPhoto[]): PhotosByYear {
  return photos.reduce((acc: PhotosByYear, photo) => {
    const year = new Date(photo.created_at).getFullYear().toString()

    if (!acc[year]) {
      acc[year] = []
    }

    acc[year].push(photo)
    return acc
  }, {})
}

export function getPhotosByYear(
  photos: UnsplashPhoto[],
  year: string,
): UnsplashPhoto[] {
  return photos.filter((photo) => {
    const photoYear = new Date(photo.created_at).getFullYear().toString()
    return photoYear === year
  })
}

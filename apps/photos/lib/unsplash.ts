import { createApi } from 'unsplash-js'
import type { PhotosByYear, UnsplashPhoto } from './types'

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
 * Fetch detailed photo information including EXIF and location data
 * This is used when the listing API doesn't provide complete metadata
 */
export async function getPhotoDetails(
  photoId: string,
): Promise<Partial<UnsplashPhoto> | null> {
  if (!unsplash) {
    return null
  }

  try {
    const result = await unsplash.photos.get({ photoId })
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
    return null
  } catch (error) {
    console.warn(`Failed to fetch details for photo ${photoId}:`, error)
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

  // Step 2: Enrich photos with detailed data if needed
  const photosNeedingEnrichment = allPhotos.filter(needsEnrichment)

  if (photosNeedingEnrichment.length > 0) {
    console.log(`🔍 Enriching ${photosNeedingEnrichment.length} photos with detailed EXIF and location data...`)

    for (let i = 0; i < photosNeedingEnrichment.length; i++) {
      const photo = photosNeedingEnrichment[i]

      try {
        // Fetch detailed photo data
        const details = await getPhotoDetails(photo.id)

        if (details) {
          // Merge detailed data into the photo
          Object.assign(photo, {
            location: details.location || photo.location,
            exif: details.exif || photo.exif,
            description: details.description || photo.description,
            alt_description: details.alt_description || photo.alt_description,
          })

          if ((i + 1) % 10 === 0) {
            console.log(`   ✓ Enriched ${i + 1}/${photosNeedingEnrichment.length} photos`)
          }
        }

        // Rate limiting: wait between requests to avoid hitting API limits
        // Unsplash allows 50 requests per hour, so we space them out
        if (i < photosNeedingEnrichment.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 800))
        }
      } catch (error) {
        console.warn(`   ⚠ Failed to enrich photo ${photo.id}:`, error)
        // Continue with other photos even if one fails
      }
    }

    console.log(`   ✓ Completed enrichment: ${photosNeedingEnrichment.length} photos processed`)
  } else {
    console.log('✓ All photos already have complete metadata')
  }

  // Step 3: Track downloads for all photos (required by Unsplash API guidelines)
  // This is required when displaying photos, even during build time
  console.log('📥 Tracking photo downloads for Unsplash attribution...')
  for (let i = 0; i < allPhotos.length; i++) {
    await trackPhotoDownload(allPhotos[i].id)

    // Small delay to avoid rate limits
    if (i < allPhotos.length - 1 && i % 20 === 0) {
      await new Promise((resolve) => setTimeout(resolve, 500))
    }
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

export function formatPhotoDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

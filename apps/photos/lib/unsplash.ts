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

// Optional function to fetch detailed info for specific photo (used on demand)
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
      }
    }
    return null
  } catch (error) {
    console.warn(`Failed to fetch details for photo ${photoId}:`, error)
    return null
  }
}

export async function getAllUserPhotos(): Promise<UnsplashPhoto[]> {
  const allPhotos: UnsplashPhoto[] = []
  let page = 1
  let hasMore = true
  const maxPages = 3 // Limit to avoid rate limits

  while (hasMore && page <= maxPages) {
    try {
      const photos = await getUserPhotos(page, 30, 'latest')

      if (photos.length === 0) {
        hasMore = false
      } else {
        allPhotos.push(...photos)
        page++

        // Respect rate limits - add a longer delay between requests
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

import type { Photo } from './types'
import { getAllUnsplashPhotos } from './unsplash-provider'
import { getAllCloudinaryPhotos } from './cloudinary-provider'

/**
 * Get all photos from all enabled providers (Unsplash + Cloudinary)
 * Photos are merged and sorted by creation date (newest first)
 */
export async function getAllPhotos(): Promise<Photo[]> {
  console.log('📸 Fetching photos from all providers...')
  console.log('')

  const allPhotos: Photo[] = []

  // Fetch from Unsplash
  try {
    const unsplashPhotos = await getAllUnsplashPhotos()
    allPhotos.push(...unsplashPhotos)
    console.log(`✅ Unsplash: ${unsplashPhotos.length} photos`)
  } catch (error) {
    console.error('❌ Error fetching Unsplash photos:', error)
    // Continue with other providers even if one fails
  }

  // Fetch from Cloudinary
  try {
    const cloudinaryPhotos = await getAllCloudinaryPhotos()
    allPhotos.push(...cloudinaryPhotos)
    console.log(`✅ Cloudinary: ${cloudinaryPhotos.length} photos`)
  } catch (error) {
    console.error('❌ Error fetching Cloudinary photos:', error)
    // Continue even if Cloudinary fails
  }

  // Sort all photos by creation date (newest first)
  allPhotos.sort((a, b) => {
    const dateA = new Date(a.created_at).getTime()
    const dateB = new Date(b.created_at).getTime()
    return dateB - dateA
  })

  console.log('')
  console.log(`📊 Total photos from all providers: ${allPhotos.length}`)
  console.log('')

  return allPhotos
}

/**
 * Group photos by year
 */
export function groupPhotosByYear(photos: Photo[]): { [year: string]: Photo[] } {
  return photos.reduce(
    (acc: { [year: string]: Photo[] }, photo) => {
      const year = new Date(photo.created_at).getFullYear().toString()

      if (!acc[year]) {
        acc[year] = []
      }

      acc[year].push(photo)
      return acc
    },
    {},
  )
}

/**
 * Get photos by year
 */
export function getPhotosByYear(photos: Photo[], year: string): Photo[] {
  return photos.filter((photo) => {
    const photoYear = new Date(photo.created_at).getFullYear().toString()
    return photoYear === year
  })
}

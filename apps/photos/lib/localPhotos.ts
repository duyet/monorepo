import fs from 'fs'
import path from 'path'
import sharp from 'sharp'
import { v4 as uuidv4 } from 'uuid'
import { LocalPhoto } from './types'
import { extractExifData, extractPhotoDate } from './exifExtractor'

const PUBLIC_DIR = path.join(process.cwd(), 'public')
const PHOTOS_DIR = path.join(PUBLIC_DIR, 'photos')

/**
 * Scan the public/photos directory and extract metadata from all photos at build time
 */
export async function scanLocalPhotos(): Promise<LocalPhoto[]> {
  const photos: LocalPhoto[] = []

  try {
    // Check if photos directory exists
    if (!fs.existsSync(PHOTOS_DIR)) {
      console.log('No photos directory found, skipping local photo scan')
      return []
    }

    // Read all files in the photos directory
    const files = fs.readdirSync(PHOTOS_DIR)

    // Filter for image files only
    const imageFiles = files.filter((file) => {
      const ext = path.extname(file).toLowerCase()
      return ['.jpg', '.jpeg', '.png', '.webp'].includes(ext)
    })

    console.log(`Found ${imageFiles.length} photos in public/photos directory`)

    // Process each image file
    for (const filename of imageFiles) {
      try {
        const filePath = path.join(PHOTOS_DIR, filename)
        const buffer = fs.readFileSync(filePath)
        const stats = fs.statSync(filePath)

        // Extract EXIF metadata
        const exif = await extractExifData(buffer)

        // Get image metadata using sharp
        const image = sharp(buffer)
        const metadata = await image.metadata()

        // Determine the creation date
        const createdAt = extractPhotoDate(exif)

        // Extract location from GPS if available
        let location
        if (exif?.gps?.latitude && exif?.gps?.longitude) {
          location = {
            position: {
              latitude: exif.gps.latitude,
              longitude: exif.gps.longitude,
            },
          }
        }

        // Create photo object
        const photo: LocalPhoto = {
          id: uuidv4(),
          source: 'local',
          filename,
          originalName: filename,
          created_at: createdAt,
          updated_at: stats.mtime.toISOString(),
          width: metadata.width || 0,
          height: metadata.height || 0,
          size: stats.size,
          mimeType: getMimeType(filename),
          urls: {
            raw: `/photos/${filename}`,
            full: `/photos/${filename}`,
            regular: `/photos/${filename}`,
            small: `/photos/${filename}`,
            thumb: `/photos/${filename}`,
          },
          exif,
          location,
          description: exif?.description || exif?.userComment,
          stats: {
            views: 0,
            downloads: 0,
          },
        }

        photos.push(photo)
        console.log(`Processed: ${filename} (${metadata.width}x${metadata.height})`)
      } catch (error) {
        console.error(`Error processing ${filename}:`, error)
      }
    }

    console.log(`Successfully processed ${photos.length} local photos`)
    return photos
  } catch (error) {
    console.error('Error scanning local photos:', error)
    return []
  }
}

/**
 * Get MIME type from filename
 */
function getMimeType(filename: string): string {
  const ext = path.extname(filename).toLowerCase()
  const mimeTypes: Record<string, string> = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.webp': 'image/webp',
  }
  return mimeTypes[ext] || 'image/jpeg'
}

/**
 * Group local photos by year
 */
export function groupLocalPhotosByYear(
  photos: LocalPhoto[]
): { [year: string]: LocalPhoto[] } {
  const photosByYear: { [year: string]: LocalPhoto[] } = {}

  photos.forEach((photo) => {
    const date = new Date(photo.created_at)
    const year = date.getFullYear().toString()

    if (!photosByYear[year]) {
      photosByYear[year] = []
    }

    photosByYear[year].push(photo)
  })

  // Sort photos within each year by date (newest first)
  Object.keys(photosByYear).forEach((year) => {
    photosByYear[year].sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
  })

  return photosByYear
}

/**
 * Merge Unsplash and local photos, sorted by date
 */
export function mergePhotos<T extends { created_at: string; source?: string }>(
  unsplashPhotos: T[],
  localPhotos: LocalPhoto[]
): (T | LocalPhoto)[] {
  const allPhotos = [
    ...unsplashPhotos,
    ...localPhotos,
  ]

  // Sort by created_at date (newest first)
  allPhotos.sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )

  return allPhotos
}

import fs from 'fs'
import path from 'path'
import { LocalPhoto, Photo } from './types'

// Directory structure for local photos
const PUBLIC_DIR = path.join(process.cwd(), 'public')
const PHOTOS_DIR = path.join(PUBLIC_DIR, 'photos')
const THUMBS_DIR = path.join(PHOTOS_DIR, 'thumbs')
const METADATA_FILE = path.join(PHOTOS_DIR, 'metadata.json')

/**
 * Ensure all required directories exist
 */
export function ensureDirectories() {
  if (!fs.existsSync(PHOTOS_DIR)) {
    fs.mkdirSync(PHOTOS_DIR, { recursive: true })
  }
  if (!fs.existsSync(THUMBS_DIR)) {
    fs.mkdirSync(THUMBS_DIR, { recursive: true })
  }
}

/**
 * Load all local photos metadata from the JSON file
 */
export function loadLocalPhotos(): LocalPhoto[] {
  try {
    if (!fs.existsSync(METADATA_FILE)) {
      return []
    }

    const data = fs.readFileSync(METADATA_FILE, 'utf-8')
    const photos: LocalPhoto[] = JSON.parse(data)

    // Ensure all photos have source: 'local'
    return photos.map((photo) => ({
      ...photo,
      source: 'local' as const,
    }))
  } catch (error) {
    console.error('Error loading local photos:', error)
    return []
  }
}

/**
 * Save local photos metadata to the JSON file
 */
export function saveLocalPhotos(photos: LocalPhoto[]): void {
  try {
    ensureDirectories()
    const data = JSON.stringify(photos, null, 2)
    fs.writeFileSync(METADATA_FILE, data, 'utf-8')
  } catch (error) {
    console.error('Error saving local photos:', error)
    throw error
  }
}

/**
 * Add a new local photo to the metadata
 */
export function addLocalPhoto(photo: LocalPhoto): void {
  const photos = loadLocalPhotos()
  photos.push(photo)
  saveLocalPhotos(photos)
}

/**
 * Get a single local photo by ID
 */
export function getLocalPhoto(id: string): LocalPhoto | null {
  const photos = loadLocalPhotos()
  return photos.find((photo) => photo.id === id) || null
}

/**
 * Update a local photo's metadata
 */
export function updateLocalPhoto(
  id: string,
  updates: Partial<LocalPhoto>
): LocalPhoto | null {
  const photos = loadLocalPhotos()
  const index = photos.findIndex((photo) => photo.id === id)

  if (index === -1) {
    return null
  }

  photos[index] = {
    ...photos[index],
    ...updates,
    id, // Prevent ID from being changed
    source: 'local', // Ensure source stays 'local'
    updated_at: new Date().toISOString(),
  }

  saveLocalPhotos(photos)
  return photos[index]
}

/**
 * Delete a local photo (both file and metadata)
 */
export function deleteLocalPhoto(id: string): boolean {
  const photos = loadLocalPhotos()
  const photo = photos.find((p) => p.id === id)

  if (!photo) {
    return false
  }

  try {
    // Delete the photo file
    const photoPath = path.join(PHOTOS_DIR, photo.filename)
    if (fs.existsSync(photoPath)) {
      fs.unlinkSync(photoPath)
    }

    // Delete the thumbnail
    const thumbFilename = `thumb_${photo.filename}`
    const thumbPath = path.join(THUMBS_DIR, thumbFilename)
    if (fs.existsSync(thumbPath)) {
      fs.unlinkSync(thumbPath)
    }

    // Remove from metadata
    const updatedPhotos = photos.filter((p) => p.id !== id)
    saveLocalPhotos(updatedPhotos)

    return true
  } catch (error) {
    console.error('Error deleting local photo:', error)
    return false
  }
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
export function mergePhotos(
  unsplashPhotos: Photo[],
  localPhotos: LocalPhoto[]
): Photo[] {
  const allPhotos: Photo[] = [
    ...unsplashPhotos,
    ...localPhotos.map((photo) => ({ ...photo, source: 'local' as const })),
  ]

  // Sort by created_at date (newest first)
  allPhotos.sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )

  return allPhotos
}

/**
 * Get photos directory paths
 */
export function getPhotosPaths() {
  return {
    publicDir: PUBLIC_DIR,
    photosDir: PHOTOS_DIR,
    thumbsDir: THUMBS_DIR,
    metadataFile: METADATA_FILE,
  }
}

/**
 * Generate a unique filename for uploaded photos
 */
export function generateUniqueFilename(originalFilename: string): string {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 9)
  const ext = path.extname(originalFilename)
  const baseName = path.basename(originalFilename, ext).replace(/[^a-z0-9]/gi, '_')

  return `${baseName}_${timestamp}_${random}${ext}`
}

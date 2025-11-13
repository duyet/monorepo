import type { Photo } from './photo-provider'
import { OWNER_USERNAME } from './config'

/**
 * Professional metadata formatting utilities
 */

/**
 * Format photo date in human-readable format
 */
export function formatPhotoDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export interface PhotoMetadata {
  dateFormatted: string
  dimensions: string
  location?: string
  stats?: {
    views: string
    downloads: string
  }
  exif?: {
    camera: string
    settings: string
  }
  attribution?: {
    photographer: string
    username: string
    profileUrl: string
  }
}

/**
 * Extract and format comprehensive photo metadata
 */
export function formatPhotoMetadata(photo: Photo): PhotoMetadata {
  const metadata: PhotoMetadata = {
    dateFormatted: formatPhotoDate(photo.created_at),
    dimensions: `${photo.width} × ${photo.height}`,
  }

  // Location information
  if (photo.location && (photo.location.city || photo.location.country)) {
    metadata.location = [photo.location.city, photo.location.country]
      .filter(Boolean)
      .join(', ')
  }

  // Statistics
  if (photo.stats && (photo.stats.views !== undefined || photo.stats.downloads !== undefined)) {
    metadata.stats = {
      views: photo.stats.views !== undefined ? photo.stats.views.toLocaleString() : '0',
      downloads: photo.stats.downloads !== undefined ? photo.stats.downloads.toLocaleString() : '0',
    }
  }

  // EXIF data
  if (photo.exif && (photo.exif.make || photo.exif.model)) {
    const camera = [photo.exif.make, photo.exif.model].filter(Boolean).join(' ')
    const settings = [
      photo.exif.aperture && `f/${photo.exif.aperture}`,
      photo.exif.exposure_time && `${photo.exif.exposure_time}s`,
      photo.exif.iso && `ISO ${photo.exif.iso}`,
      photo.exif.focal_length && `${photo.exif.focal_length}mm`,
    ]
      .filter(Boolean)
      .join(' • ')

    if (camera) {
      metadata.exif = { camera, settings }
    }
  }

  // Attribution (exclude owner's username from attribution)
  if (photo.user && photo.user.username !== OWNER_USERNAME) {
    metadata.attribution = {
      photographer: photo.user.name || '',
      username: photo.user.username || '',
      profileUrl: photo.user.links?.html || '',
    }
  }

  return metadata
}

/**
 * Format photo description with fallback
 */
export function formatPhotoDescription(photo: Photo): string {
  return (
    photo.description ||
    photo.alt_description ||
    `Photograph ${photo.id}${photo.user?.name ? ` by ${photo.user.name}` : ''}`
  )
}

/**
 * Format EXIF settings compactly
 */
export function formatExifSettings(photo: Photo): string | null {
  if (!photo.exif) return null

  const settings: string[] = []

  if (photo.exif.aperture) settings.push(`f/${photo.exif.aperture}`)
  if (photo.exif.exposure_time) settings.push(`${photo.exif.exposure_time}s`)
  if (photo.exif.iso) settings.push(`ISO ${photo.exif.iso}`)
  if (photo.exif.focal_length) settings.push(`${photo.exif.focal_length}mm`)

  return settings.length > 0 ? settings.join(' • ') : null
}

/**
 * Format camera name from EXIF
 */
export function formatCameraName(photo: Photo): string | null {
  if (!photo.exif) return null

  if (photo.exif.name) return photo.exif.name

  const parts: string[] = []
  if (photo.exif.make) parts.push(photo.exif.make)
  if (photo.exif.model) parts.push(photo.exif.model)

  return parts.length > 0 ? parts.join(' ') : null
}

/**
 * Format compact metadata for card overlays
 */
export function formatCompactMetadata(photo: Photo): {
  primary: string[]
  secondary: string[]
} {
  const primary: string[] = []
  const secondary: string[] = []

  // Date is always primary
  primary.push(formatPhotoDate(photo.created_at))

  // Stats in primary if available
  if (photo.stats) {
    if (photo.stats.views !== undefined) {
      primary.push(`👁 ${photo.stats.views.toLocaleString()}`)
    }
    if (photo.stats.downloads !== undefined) {
      primary.push(`⬇ ${photo.stats.downloads.toLocaleString()}`)
    }
  }

  // Dimensions in secondary
  secondary.push(`${photo.width} × ${photo.height}`)

  // Location in secondary if available
  if (photo.location && (photo.location.city || photo.location.country)) {
    const location = [photo.location.city, photo.location.country]
      .filter(Boolean)
      .join(', ')
    secondary.push(`📍 ${location}`)
  }

  // Camera info in secondary if available
  const cameraName = formatCameraName(photo)
  if (cameraName) {
    secondary.push(`📷 ${cameraName}`)
  }

  return { primary, secondary }
}

/**
 * Format metadata for professional portfolio display
 */
export function formatPortfolioMetadata(photo: Photo): {
  title: string
  subtitle: string
  technical: string[]
  creative: string[]
} {
  const title = photo.description || `Untitled Photography`
  const subtitle = formatPhotoDate(photo.created_at)

  const technical: string[] = [`${photo.width} × ${photo.height}`]

  const creative: string[] = []

  // Add EXIF technical data
  if (photo.exif) {
    if (photo.exif.make || photo.exif.model) {
      technical.push(
        [photo.exif.make, photo.exif.model].filter(Boolean).join(' '),
      )
    }
    if (photo.exif.aperture || photo.exif.exposure_time || photo.exif.iso) {
      const settings = [
        photo.exif.aperture && `f/${photo.exif.aperture}`,
        photo.exif.exposure_time && `${photo.exif.exposure_time}s`,
        photo.exif.iso && `ISO ${photo.exif.iso}`,
      ]
        .filter(Boolean)
        .join(' • ')
      if (settings) technical.push(settings)
    }
    if (photo.exif.focal_length) {
      technical.push(`${photo.exif.focal_length}mm`)
    }
  }

  // Add creative context
  if (photo.location && (photo.location.city || photo.location.country)) {
    creative.push(
      [photo.location.city, photo.location.country].filter(Boolean).join(', '),
    )
  }

  if (photo.stats) {
    creative.push(`${photo.stats.views.toLocaleString()} views`)
  }

  return { title, subtitle, technical, creative }
}

/**
 * Format caption for photo stream/feed display
 * Priority: description → alt_description → location + date → date only
 */
export function formatFeedCaption(photo: Photo): string {
  // Priority 1: Description
  if (photo.description) {
    return photo.description
  }

  // Priority 2: Alt description
  if (photo.alt_description) {
    return photo.alt_description
  }

  // Priority 3: Location + Date (if location available)
  if (photo.location && (photo.location.city || photo.location.country)) {
    const location = [photo.location.city, photo.location.country]
      .filter(Boolean)
      .join(', ')
    const date = formatPhotoDate(photo.created_at)
    return `${location} • ${date}`
  }

  // Priority 4: Date only
  return formatPhotoDate(photo.created_at)
}

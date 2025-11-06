import type { UnsplashPhoto } from './types'
import { formatPhotoDate } from './unsplash'

/**
 * Professional metadata formatting utilities
 */

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
export function formatPhotoMetadata(photo: UnsplashPhoto): PhotoMetadata {
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
  if (photo.stats) {
    metadata.stats = {
      views: photo.stats.views.toLocaleString(),
      downloads: photo.stats.downloads.toLocaleString(),
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

  // Attribution (exclude _duyet as specified)
  if (photo.user.username !== '_duyet') {
    metadata.attribution = {
      photographer: photo.user.name,
      username: photo.user.username,
      profileUrl: photo.user.links.html,
    }
  }

  return metadata
}

/**
 * Format photo description with fallback
 */
export function formatPhotoDescription(photo: UnsplashPhoto): string {
  return (
    photo.description ||
    photo.alt_description ||
    `Photograph ${photo.id} by ${photo.user.name}`
  )
}

/**
 * Format compact metadata for card overlays
 */
export function formatCompactMetadata(photo: UnsplashPhoto): {
  primary: string[]
  secondary: string[]
} {
  const primary: string[] = []
  const secondary: string[] = []

  // Date is always primary
  primary.push(formatPhotoDate(photo.created_at))

  // Stats in primary if available
  if (photo.stats) {
    primary.push(`👁 ${photo.stats.views.toLocaleString()}`)
    primary.push(`⬇ ${photo.stats.downloads.toLocaleString()}`)
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

  return { primary, secondary }
}

/**
 * Format metadata for professional portfolio display
 */
export function formatPortfolioMetadata(photo: UnsplashPhoto): {
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
export function formatFeedCaption(photo: UnsplashPhoto): string {
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

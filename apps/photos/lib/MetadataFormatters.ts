import type { Photo, isLocalPhoto, DetailedExif } from './types'
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
    detailedInfo?: string[] // Additional EXIF info for local photos
  }
  attribution?: {
    photographer: string
    username: string
    profileUrl?: string
  }
  fileInfo?: {
    size: string
    filename: string
    mimeType: string
  }
  source: 'local' | 'unsplash'
}

/**
 * Format file size in human-readable format
 */
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}

/**
 * Format detailed EXIF info for local photos
 */
function formatDetailedExif(exif: DetailedExif): string[] {
  const details: string[] = []

  if (exif.lensModel) details.push(`Lens: ${exif.lensModel}`)
  if (exif.focalLengthIn35mm) details.push(`${exif.focalLengthIn35mm}mm (35mm equiv)`)
  if (exif.exposureMode) details.push(`Exposure: ${exif.exposureMode}`)
  if (exif.meteringMode) details.push(`Metering: ${exif.meteringMode}`)
  if (exif.flash) details.push(`Flash: ${exif.flash}`)
  if (exif.whiteBalance) details.push(`WB: ${exif.whiteBalance}`)
  if (exif.software) details.push(`Software: ${exif.software}`)

  return details
}

/**
 * Extract and format comprehensive photo metadata
 */
export function formatPhotoMetadata(photo: Photo): PhotoMetadata {
  const metadata: PhotoMetadata = {
    dateFormatted: formatPhotoDate(photo.created_at),
    dimensions: `${photo.width} × ${photo.height}`,
    source: photo.source || 'unsplash',
  }

  // Location information
  if (photo.location) {
    if (photo.source === 'local' && photo.location.position) {
      // For local photos with GPS coordinates
      const { latitude, longitude } = photo.location.position
      metadata.location = `${latitude.toFixed(6)}°, ${longitude.toFixed(6)}°`
      if (photo.location.name) {
        metadata.location = `${photo.location.name} (${metadata.location})`
      }
    } else if (photo.location.city || photo.location.country) {
      metadata.location = [photo.location.city, photo.location.country]
        .filter(Boolean)
        .join(', ')
    }
  }

  // Statistics
  if (photo.stats) {
    metadata.stats = {
      views: photo.stats.views.toLocaleString(),
      downloads: photo.stats.downloads.toLocaleString(),
    }
  }

  // EXIF data
  if (photo.exif) {
    if (photo.source === 'local') {
      // Detailed EXIF for local photos
      const exif = photo.exif as DetailedExif
      const camera = [exif.make, exif.model].filter(Boolean).join(' ')
      const settings = [
        exif.aperture && `f/${exif.aperture}`,
        exif.exposureTime && `${exif.exposureTime}`,
        exif.iso && `ISO ${exif.iso}`,
        exif.focalLength && `${exif.focalLength}mm`,
      ]
        .filter(Boolean)
        .join(' • ')

      if (camera || settings) {
        metadata.exif = {
          camera,
          settings,
          detailedInfo: formatDetailedExif(exif),
        }
      }
    } else {
      // Standard EXIF for Unsplash photos
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
  }

  // File info for local photos
  if (photo.source === 'local') {
    metadata.fileInfo = {
      size: formatFileSize(photo.size),
      filename: photo.originalName,
      mimeType: photo.mimeType,
    }
  }

  // Attribution
  if (photo.user) {
    if (photo.source === 'unsplash' && 'links' in photo.user) {
      // Unsplash attribution (exclude _duyet)
      if (photo.user.username !== '_duyet') {
        metadata.attribution = {
          photographer: photo.user.name,
          username: photo.user.username,
          profileUrl: photo.user.links.html,
        }
      }
    } else if (photo.source === 'local') {
      // Local photo uploader info
      metadata.attribution = {
        photographer: photo.user.name || 'Unknown',
        username: photo.user.username || 'local',
      }
    }
  }

  return metadata
}

/**
 * Format photo description with fallback
 */
export function formatPhotoDescription(photo: Photo): string {
  if (photo.source === 'local') {
    return photo.description || photo.alt_description || `Photo ${photo.originalName}`
  }

  return (
    photo.description ||
    photo.alt_description ||
    `Photograph ${photo.id} by ${photo.user.name}`
  )
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
    primary.push(`👁 ${photo.stats.views.toLocaleString()}`)
    primary.push(`⬇ ${photo.stats.downloads.toLocaleString()}`)
  }

  // Add source indicator
  if (photo.source === 'local') {
    primary.push('📁 Local')
  }

  // Dimensions in secondary
  secondary.push(`${photo.width} × ${photo.height}`)

  // Location in secondary if available
  if (photo.location) {
    if (photo.source === 'local' && photo.location.position) {
      const { latitude, longitude } = photo.location.position
      secondary.push(`📍 ${latitude.toFixed(2)}°, ${longitude.toFixed(2)}°`)
    } else if (photo.location.city || photo.location.country) {
      const location = [photo.location.city, photo.location.country]
        .filter(Boolean)
        .join(', ')
      secondary.push(`📍 ${location}`)
    }
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
    if (photo.source === 'local') {
      const exif = photo.exif as DetailedExif
      if (exif.make || exif.model) {
        technical.push([exif.make, exif.model].filter(Boolean).join(' '))
      }
      if (exif.aperture || exif.exposureTime || exif.iso) {
        const settings = [
          exif.aperture && `f/${exif.aperture}`,
          exif.exposureTime && `${exif.exposureTime}`,
          exif.iso && `ISO ${exif.iso}`,
        ]
          .filter(Boolean)
          .join(' • ')
        if (settings) technical.push(settings)
      }
      if (exif.focalLength) {
        technical.push(`${exif.focalLength}mm`)
      }
    } else {
      if (photo.exif.make || photo.exif.model) {
        technical.push(
          [photo.exif.make, photo.exif.model].filter(Boolean).join(' ')
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
  }

  // Add creative context
  if (photo.location && (photo.location.city || photo.location.country)) {
    creative.push(
      [photo.location.city, photo.location.country].filter(Boolean).join(', ')
    )
  }

  if (photo.stats) {
    creative.push(`${photo.stats.views.toLocaleString()} views`)
  }

  return { title, subtitle, technical, creative }
}

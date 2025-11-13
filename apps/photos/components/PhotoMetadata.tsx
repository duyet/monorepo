'use client'

import { useState } from 'react'
import type { Photo } from '@/lib/photo-provider'
import {
  formatExifSettings,
  formatCameraName,
  formatPhotoDate,
} from '@/lib/MetadataFormatters'
import { Info, X } from 'lucide-react'

interface PhotoMetadataProps {
  photo: Photo
  className?: string
}

/**
 * PhotoMetadata: Expandable metadata display component
 * Shows detailed info about photo: stats, EXIF, location when expanded
 */
export default function PhotoMetadata({
  photo,
  className = '',
}: PhotoMetadataProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const cameraName = formatCameraName(photo)
  const exifSettings = formatExifSettings(photo)
  const hasLocation = photo.location && (photo.location.city || photo.location.country)
  const location = hasLocation
    ? [photo.location?.city, photo.location?.country].filter(Boolean).join(', ')
    : null

  // Don't show button if there's no metadata to display
  const hasMetadata = photo.stats || cameraName || exifSettings || hasLocation

  if (!hasMetadata) return null

  return (
    <div className={`relative inline-flex items-center ${className}`}>
      {/* Info Toggle Icon */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="group inline-flex items-center justify-center rounded-full p-1 text-neutral-600 transition-all hover:bg-neutral-200 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-700 dark:hover:text-neutral-100"
        aria-label={isExpanded ? 'Hide photo details' : 'Show photo details'}
        aria-expanded={isExpanded}
      >
        {isExpanded ? (
          <X className="h-4 w-4" />
        ) : (
          <Info className="h-4 w-4" />
        )}
      </button>

      {/* Expandable Metadata Panel */}
      {isExpanded && (
        <div className="absolute left-0 top-full z-10 mt-2 min-w-64 max-w-xs rounded border border-neutral-200 bg-white px-3 py-2 text-left shadow-lg dark:border-neutral-700 dark:bg-neutral-800">
          <div className="space-y-1 text-[11px] text-neutral-700 dark:text-neutral-200">
            {/* Date */}
            <div>{formatPhotoDate(photo.created_at)}</div>

            {/* Stats */}
            {photo.stats && (
              <>
                <div>{photo.stats.views.toLocaleString()} views</div>
                <div>{photo.stats.downloads.toLocaleString()} downloads</div>
              </>
            )}

            {/* Camera & EXIF */}
            {cameraName && (
              <div>
                {cameraName}
                {exifSettings && ` • ${exifSettings}`}
              </div>
            )}

            {/* Location */}
            {location && <div>{location}</div>}
          </div>
        </div>
      )}
    </div>
  )
}

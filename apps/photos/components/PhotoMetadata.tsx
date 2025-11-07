'use client'

import { useState } from 'react'
import type { UnsplashPhoto } from '@/lib/types'
import {
  formatExifSettings,
  formatCameraName,
  formatPhotoDate,
} from '@/lib/MetadataFormatters'
import { Info, X, Camera, MapPin, Eye, Download, Calendar } from 'lucide-react'

interface PhotoMetadataProps {
  photo: UnsplashPhoto
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
        <div className="absolute left-0 top-full z-10 mt-2 w-72 max-w-[calc(100vw-2rem)] rounded-lg border border-neutral-200/80 bg-white/95 p-3 shadow-xl backdrop-blur-sm dark:border-neutral-700/80 dark:bg-neutral-900/95">
          <div className="space-y-2">
            {/* Date */}
            <div className="flex items-center gap-2.5">
              <Calendar className="h-3.5 w-3.5 flex-shrink-0 text-neutral-400 dark:text-neutral-500" />
              <div className="min-w-0 flex-1">
                <div className="text-[10px] font-medium uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
                  Date
                </div>
                <div className="text-xs text-neutral-700 dark:text-neutral-300">
                  {formatPhotoDate(photo.created_at)}
                </div>
              </div>
            </div>

            {/* Stats */}
            {photo.stats && (
              <>
                <div className="flex items-center gap-2.5">
                  <Eye className="h-3.5 w-3.5 flex-shrink-0 text-neutral-400 dark:text-neutral-500" />
                  <div className="min-w-0 flex-1">
                    <div className="text-[10px] font-medium uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
                      Views
                    </div>
                    <div className="text-xs text-neutral-700 dark:text-neutral-300">
                      {photo.stats.views.toLocaleString()}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <Download className="h-3.5 w-3.5 flex-shrink-0 text-neutral-400 dark:text-neutral-500" />
                  <div className="min-w-0 flex-1">
                    <div className="text-[10px] font-medium uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
                      Downloads
                    </div>
                    <div className="text-xs text-neutral-700 dark:text-neutral-300">
                      {photo.stats.downloads.toLocaleString()}
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Camera */}
            {cameraName && (
              <div className="flex items-center gap-2.5">
                <Camera className="h-3.5 w-3.5 flex-shrink-0 text-neutral-400 dark:text-neutral-500" />
                <div className="min-w-0 flex-1">
                  <div className="text-[10px] font-medium uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
                    Camera
                  </div>
                  <div className="text-xs text-neutral-700 dark:text-neutral-300">
                    {cameraName}
                  </div>
                  {exifSettings && (
                    <div className="mt-0.5 text-[11px] text-neutral-500 dark:text-neutral-400">
                      {exifSettings}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Location */}
            {location && (
              <div className="flex items-center gap-2.5">
                <MapPin className="h-3.5 w-3.5 flex-shrink-0 text-neutral-400 dark:text-neutral-500" />
                <div className="min-w-0 flex-1">
                  <div className="text-[10px] font-medium uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
                    Location
                  </div>
                  <div className="text-xs text-neutral-700 dark:text-neutral-300">
                    {location}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

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
      {/* Info Toggle Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="group inline-flex items-center gap-1.5 rounded-full bg-neutral-100 px-3 py-1.5 text-xs font-medium text-neutral-600 transition-all hover:bg-neutral-200 hover:text-neutral-900 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700 dark:hover:text-neutral-100"
        aria-label={isExpanded ? 'Hide photo details' : 'Show photo details'}
        aria-expanded={isExpanded}
      >
        {isExpanded ? (
          <>
            <X className="h-3.5 w-3.5" />
            <span>Hide details</span>
          </>
        ) : (
          <>
            <Info className="h-3.5 w-3.5" />
            <span>Show details</span>
          </>
        )}
      </button>

      {/* Expandable Metadata Panel */}
      {isExpanded && (
        <div className="absolute left-0 top-full z-10 mt-2 w-80 max-w-[calc(100vw-2rem)] rounded-lg border border-neutral-200 bg-white p-4 shadow-lg dark:border-neutral-700 dark:bg-neutral-800">
          <div className="space-y-3">
            {/* Date */}
            <div className="flex items-start gap-3">
              <Calendar className="mt-0.5 h-4 w-4 flex-shrink-0 text-neutral-400" />
              <div className="min-w-0 flex-1">
                <div className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                  Date
                </div>
                <div className="text-sm text-neutral-900 dark:text-neutral-100">
                  {formatPhotoDate(photo.created_at)}
                </div>
              </div>
            </div>

            {/* Stats */}
            {photo.stats && (
              <>
                <div className="flex items-start gap-3">
                  <Eye className="mt-0.5 h-4 w-4 flex-shrink-0 text-neutral-400" />
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                      Views
                    </div>
                    <div className="text-sm text-neutral-900 dark:text-neutral-100">
                      {photo.stats.views.toLocaleString()}
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Download className="mt-0.5 h-4 w-4 flex-shrink-0 text-neutral-400" />
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                      Downloads
                    </div>
                    <div className="text-sm text-neutral-900 dark:text-neutral-100">
                      {photo.stats.downloads.toLocaleString()}
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Camera */}
            {cameraName && (
              <div className="flex items-start gap-3">
                <Camera className="mt-0.5 h-4 w-4 flex-shrink-0 text-neutral-400" />
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                    Camera
                  </div>
                  <div className="text-sm text-neutral-900 dark:text-neutral-100">
                    {cameraName}
                  </div>
                  {exifSettings && (
                    <div className="mt-0.5 text-xs text-neutral-600 dark:text-neutral-400">
                      {exifSettings}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Location */}
            {location && (
              <div className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-neutral-400" />
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                    Location
                  </div>
                  <div className="text-sm text-neutral-900 dark:text-neutral-100">
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

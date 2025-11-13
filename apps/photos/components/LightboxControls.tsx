'use client'

import { cn } from '@duyet/libs/utils'
import * as Dialog from '@radix-ui/react-dialog'
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Expand,
  ExternalLink,
  Info,
  Shrink,
  X,
} from 'lucide-react'

interface LightboxControlsProps {
  currentIndex: number
  totalCount: number
  isFullscreen: boolean
  showInfo: boolean
  onClose: () => void
  onToggleFullscreen: () => void
  onToggleInfo: () => void
  onNext?: () => void
  onPrevious?: () => void
  className?: string
}

export function LightboxTopControls({
  currentIndex,
  totalCount,
  isFullscreen,
  showInfo,
  onToggleFullscreen,
  onToggleInfo,
  onClose,
  className,
}: Omit<LightboxControlsProps, 'onNext' | 'onPrevious'>) {
  return (
    <div
      className={cn(
        'absolute left-4 right-4 top-4 z-10 flex items-center justify-between',
        className,
      )}
    >
      {/* Counter with professional styling */}
      <div className="rounded-full bg-black/60 px-4 py-2 text-sm font-medium text-white backdrop-blur-md">
        {currentIndex + 1} of {totalCount}
      </div>

      {/* Control buttons with enhanced styling */}
      <div className="flex gap-2">
        {/* Info toggle */}
        <button
          onClick={onToggleInfo}
          className={cn(
            'rounded-full p-2.5 text-white transition-all duration-200',
            'backdrop-blur-md hover:scale-105 focus:outline-none focus:ring-2 focus:ring-white/50',
            showInfo
              ? 'bg-white/30 hover:bg-white/40'
              : 'bg-black/50 hover:bg-black/70',
          )}
          aria-label="Toggle photo information"
          title="Toggle photo info (I)"
        >
          <Info className="h-5 w-5" />
        </button>

        {/* Fullscreen toggle */}
        <button
          onClick={onToggleFullscreen}
          className="rounded-full bg-black/50 p-2.5 text-white backdrop-blur-md transition-all duration-200 hover:scale-105 hover:bg-black/70 focus:outline-none focus:ring-2 focus:ring-white/50"
          aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
          title={isFullscreen ? 'Exit fullscreen (F)' : 'Enter fullscreen (F)'}
        >
          {isFullscreen ? (
            <Shrink className="h-5 w-5" />
          ) : (
            <Expand className="h-5 w-5" />
          )}
        </button>

        {/* Close button */}
        <Dialog.Close asChild>
          <button
            className="rounded-full bg-black/50 p-2.5 text-white backdrop-blur-md transition-all duration-200 hover:scale-105 hover:bg-red-500/80 focus:outline-none focus:ring-2 focus:ring-white/50"
            aria-label="Close lightbox"
            title="Close (Escape)"
          >
            <X className="h-6 w-6" />
          </button>
        </Dialog.Close>
      </div>
    </div>
  )
}

interface NavigationButtonProps {
  direction: 'previous' | 'next'
  onClick: () => void
  isFullscreen: boolean
  className?: string
}

export function NavigationButton({
  direction,
  onClick,
  isFullscreen,
  className,
}: NavigationButtonProps) {
  const isPrevious = direction === 'previous'
  const Icon = isPrevious ? ChevronLeft : ChevronRight

  return (
    <button
      onClick={onClick}
      className={cn(
        'absolute top-1/2 z-10 -translate-y-1/2 rounded-full p-3',
        'bg-black/60 text-white backdrop-blur-md',
        'transition-all duration-200 hover:scale-110 hover:bg-black/80',
        'shadow-xl hover:shadow-2xl focus:outline-none focus:ring-2 focus:ring-white/50',
        isFullscreen
          ? isPrevious
            ? 'left-4'
            : 'right-4'
          : isPrevious
            ? 'left-6'
            : 'right-6',
        className,
      )}
      aria-label={`${isPrevious ? 'Previous' : 'Next'} photo (${isPrevious ? '←' : '→'})`}
      title={`${isPrevious ? 'Previous' : 'Next'} photo (${isPrevious ? '←' : '→'})`}
    >
      <Icon className="h-6 w-6 sm:h-8 sm:w-8" />
    </button>
  )
}

interface InfoPanelProps {
  photo: {
    description?: string | null
    created_at: string
    width: number
    height: number
    stats?: {
      views?: number
      downloads?: number
    }
    location?: {
      city?: string | null
      country?: string | null
    }
    exif?: {
      make?: string | null
      model?: string | null
      aperture?: string | null
      exposure_time?: string | null
      iso?: number | null
      focal_length?: string | null
    }
    links?: {
      html?: string
    }
    urls: {
      full: string
    }
  }
  metadata: {
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
  }
  isFullscreen: boolean
  className?: string
}

export function InfoPanel({
  photo,
  metadata,
  isFullscreen,
  className,
}: InfoPanelProps) {
  if (isFullscreen) {
    return (
      <div
        className={cn(
          'absolute bottom-4 left-4 right-4 z-10 rounded-xl bg-black/85 p-6 text-white backdrop-blur-md',
          className,
        )}
      >
        <div className="space-y-4">
          {photo.description && (
            <h3 className="text-xl font-semibold leading-tight">
              {photo.description}
            </h3>
          )}

          <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
            {/* Technical Information */}
            <div className="space-y-2">
              <h4 className="font-medium text-gray-200">Technical Details</h4>
              <div className="space-y-1 text-gray-300">
                <p>📅 {metadata.dateFormatted}</p>
                <p>📐 {metadata.dimensions}</p>
                {metadata.stats && (
                  <p>
                    👁 {metadata.stats.views} views • ⬇{' '}
                    {metadata.stats.downloads} downloads
                  </p>
                )}
              </div>
            </div>

            {/* Creative Information */}
            <div className="space-y-2">
              <h4 className="font-medium text-gray-200">Capture Details</h4>
              <div className="space-y-1 text-gray-300">
                {metadata.location && <p>📍 {metadata.location}</p>}
                {metadata.exif && (
                  <>
                    <p>📷 {metadata.exif.camera}</p>
                    {metadata.exif.settings && (
                      <p>⚙️ {metadata.exif.settings}</p>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4 border-t border-gray-600 pt-3">
            {photo.links?.html && (
              <a
                href={photo.links.html}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm font-medium text-blue-300 transition-colors hover:text-blue-200"
              >
                <ExternalLink className="h-4 w-4" />
                View Source
              </a>
            )}
            <a
              href={photo.urls.full}
              target="_blank"
              rel="noopener noreferrer"
              download
              className="flex items-center gap-2 text-sm font-medium text-green-300 transition-colors hover:text-green-200"
            >
              <Download className="h-4 w-4" />
              Download
            </a>
          </div>
        </div>
      </div>
    )
  }

  // Compact info bar for normal mode
  return (
    <div className="bg-black/70 px-4 py-3 backdrop-blur-sm">
      <div className="flex items-center justify-between text-sm">
        {/* Actions */}
        <div className="flex items-center gap-4">
          {photo.links?.html && (
            <a
              href={photo.links.html}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-gray-300 transition-colors hover:text-white"
              title="View source"
            >
              <ExternalLink className="h-4 w-4" />
              <span className="hidden sm:inline">View</span>
            </a>
          )}
          <a
            href={photo.urls.full}
            target="_blank"
            rel="noopener noreferrer"
            download
            className="flex items-center gap-2 text-gray-300 transition-colors hover:text-white"
            title="Download photo"
          >
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Download</span>
          </a>
        </div>

        {/* Compact info */}
        <div className="flex items-center gap-3 text-xs text-gray-400">
          {metadata.stats && (
            <>
              <span>👁 {metadata.stats.views}</span>
              <span>⬇ {metadata.stats.downloads}</span>
            </>
          )}
          <span>{metadata.dateFormatted}</span>
        </div>
      </div>
    </div>
  )
}

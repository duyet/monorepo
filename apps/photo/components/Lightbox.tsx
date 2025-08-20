'use client'

import type { UnsplashPhoto } from '@/lib/types'
import { formatPhotoDate } from '@/lib/unsplash'
import { cn } from '@duyet/libs/utils'
import * as Dialog from '@radix-ui/react-dialog'
import {
  ChevronLeft,
  ChevronRight,
  Download,
  ExternalLink,
  Expand,
  Shrink,
  X,
} from 'lucide-react'
import Image from 'next/image'
import { useEffect, useState } from 'react'

interface LightboxProps {
  photo: UnsplashPhoto
  isOpen: boolean
  onClose: () => void
  onNext?: () => void
  onPrevious?: () => void
  currentIndex: number
  totalCount: number
}

export default function Lightbox({
  photo,
  isOpen,
  onClose,
  onNext,
  onPrevious,
  currentIndex,
  totalCount,
}: LightboxProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen) return

      switch (event.key) {
        case 'Escape':
          onClose()
          break
        case 'ArrowLeft':
          onPrevious?.()
          break
        case 'ArrowRight':
          onNext?.()
          break
        case 'f':
        case 'F':
          setIsFullscreen(!isFullscreen)
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose, onNext, onPrevious, isFullscreen])

  // Reset loading state when photo changes
  useEffect(() => {
    setIsLoading(true)
  }, [photo.id])

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm" />
        <Dialog.Content className={cn(
          "fixed inset-0 z-50",
          isFullscreen 
            ? "overflow-auto p-0" 
            : "flex items-center justify-center p-4"
        )}>
          {/* Hidden title for accessibility */}
          <Dialog.Title className="sr-only">
            {photo.description ||
              photo.alt_description ||
              `Photo by ${photo.user.name}`}
          </Dialog.Title>
          <div className={cn(
            "relative w-full",
            isFullscreen 
              ? "min-h-full max-w-none" 
              : "h-full max-w-7xl"
          )}>
            {/* Top controls */}
            <div className="absolute right-4 top-4 z-10 flex gap-2">
              {/* Fullscreen toggle */}
              <button
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="rounded-full bg-black/50 p-2 text-white transition-colors hover:bg-black/70"
                aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
                title={isFullscreen ? "Exit fullscreen (F)" : "Enter fullscreen (F)"}
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
                  className="rounded-full bg-black/50 p-2 text-white transition-colors hover:bg-black/70"
                  aria-label="Close"
                >
                  <X className="h-6 w-6" />
                </button>
              </Dialog.Close>
            </div>

            {/* Navigation buttons */}
            {onPrevious && (
              <button
                onClick={onPrevious}
                className={cn(
                  "absolute top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white transition-colors hover:bg-black/70",
                  isFullscreen ? "left-2" : "left-4"
                )}
                aria-label="Previous photo"
              >
                <ChevronLeft className="h-8 w-8" />
              </button>
            )}

            {onNext && (
              <button
                onClick={onNext}
                className={cn(
                  "absolute top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white transition-colors hover:bg-black/70",
                  isFullscreen ? "right-2" : "right-4"
                )}
                aria-label="Next photo"
              >
                <ChevronRight className="h-8 w-8" />
              </button>
            )}

            {/* Main image container */}
            {isFullscreen ? (
              // Fullscreen mode: maximize width, allow scrolling for tall images
              <div className="w-full">
                <div 
                  className="relative w-full cursor-pointer" 
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  title="Click to exit fullscreen"
                  style={{
                    aspectRatio: `${photo.width} / ${photo.height}`,
                  }}
                >
                  <Image
                    src={photo.urls.raw}
                    alt={
                      photo.alt_description ||
                      photo.description ||
                      'Photo by Duyệt'
                    }
                    width={photo.width}
                    height={photo.height}
                    className={cn(
                      'h-auto w-full transition-opacity duration-500',
                      isLoading ? 'opacity-0' : 'opacity-100',
                    )}
                    onLoad={() => setIsLoading(false)}
                    priority
                    sizes="100vw"
                  />
                </div>

                {/* Loading indicator */}
                {isLoading && (
                  <div className="fixed inset-0 flex items-center justify-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  </div>
                )}
              </div>
            ) : (
              // Normal mode: contained layout
              <div className="flex h-full flex-col">
                <div className="relative flex-1">
                  <div 
                    className="relative h-full w-full cursor-pointer" 
                    onClick={() => setIsFullscreen(!isFullscreen)}
                    title="Click to enter fullscreen"
                  >
                    <Image
                      src={photo.urls.raw}
                      alt={
                        photo.alt_description ||
                        photo.description ||
                        'Photo by Duyệt'
                      }
                      fill
                      className={cn(
                        'object-contain transition-opacity duration-500',
                        isLoading ? 'opacity-0' : 'opacity-100',
                      )}
                      onLoad={() => setIsLoading(false)}
                      priority
                      sizes="(max-width: 1792px) 100vw, 1792px"
                    />
                  </div>

                  {/* Loading indicator */}
                  {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="h-8 w-8 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    </div>
                  )}
                </div>

                {/* Photo info panel - shown in normal mode only */}
                <div className="bg-black/80 p-4 text-white">
                  <div className="mx-auto flex max-w-4xl items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-4">
                        <div className="flex-1">
                          {photo.description && (
                            <h2 className="text-lg font-semibold leading-tight">
                              {photo.description}
                            </h2>
                          )}
                          <div className="mt-1 flex items-center gap-4 text-sm text-gray-300">
                            <span>{formatPhotoDate(photo.created_at)}</span>
                            <span>•</span>
                            {photo.stats && (
                              <>
                                <span className="flex items-center gap-1">
                                  👁 {photo.stats.views.toLocaleString()}
                                </span>
                                <span>•</span>
                                <span className="flex items-center gap-1">
                                  ⬇ {photo.stats.downloads.toLocaleString()}
                                </span>
                                <span>•</span>
                              </>
                            )}
                            <span>
                              {photo.width} × {photo.height}
                            </span>
                            {photo.location &&
                              (photo.location.city || photo.location.country) && (
                                <>
                                  <span>•</span>
                                  <span>
                                    📍{' '}
                                    {[photo.location.city, photo.location.country]
                                      .filter(Boolean)
                                      .join(', ')}
                                  </span>
                                </>
                              )}
                          </div>
                          {(photo.exif?.make ||
                            photo.exif?.model ||
                            photo.exif?.aperture ||
                            photo.exif?.exposure_time ||
                            photo.exif?.focal_length ||
                            photo.exif?.iso) && (
                            <div className="mt-2 text-xs text-gray-400">
                              <div className="flex flex-wrap items-center gap-4">
                                {photo.exif.make && photo.exif.model && (
                                  <span>
                                    📷 {photo.exif.make} {photo.exif.model}
                                  </span>
                                )}
                                {photo.exif.focal_length && (
                                  <span>🔍 {photo.exif.focal_length}mm</span>
                                )}
                                {photo.exif.aperture && (
                                  <span>⚪ f/{photo.exif.aperture}</span>
                                )}
                                {photo.exif.exposure_time && (
                                  <span>⏱ {photo.exif.exposure_time}s</span>
                                )}
                                {photo.exif.iso && (
                                  <span>🎞 ISO {photo.exif.iso}</span>
                                )}
                              </div>
                            </div>
                          )}
                      </div>
                    </div>
                  </div>

                  {/* Compact action bar */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <a
                        href={photo.links.html}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-xs text-gray-400 transition-colors hover:text-white"
                        title="View original"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        View
                      </a>
                      <a
                        href={photo.urls.full}
                        target="_blank"
                        rel="noopener noreferrer"
                        download
                        className="flex items-center gap-1.5 text-xs text-gray-400 transition-colors hover:text-white"
                        title="Download photo"
                      >
                        <Download className="h-3.5 w-3.5" />
                        Download
                      </a>
                    </div>
                    
                    {/* Stats */}
                    {photo.stats && (
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <span className="text-gray-400">👁</span>
                          {photo.stats.views.toLocaleString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="text-gray-400">⬇</span>
                          {photo.stats.downloads.toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

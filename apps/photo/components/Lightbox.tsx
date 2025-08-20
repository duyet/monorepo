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
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose, onNext, onPrevious])

  // Reset loading state when photo changes
  useEffect(() => {
    setIsLoading(true)
  }, [photo.id])

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm" />
        <Dialog.Content className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Hidden title for accessibility */}
          <Dialog.Title className="sr-only">
            {photo.description ||
              photo.alt_description ||
              `Photo by ${photo.user.name}`}
          </Dialog.Title>
          <div className="relative h-full w-full max-w-7xl">
            {/* Close button */}
            <Dialog.Close asChild>
              <button
                className="absolute right-4 top-4 z-10 rounded-full bg-black/50 p-2 text-white transition-colors hover:bg-black/70"
                aria-label="Close"
              >
                <X className="h-6 w-6" />
              </button>
            </Dialog.Close>

            {/* Navigation buttons */}
            {onPrevious && (
              <button
                onClick={onPrevious}
                className="absolute left-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white transition-colors hover:bg-black/70"
                aria-label="Previous photo"
              >
                <ChevronLeft className="h-8 w-8" />
              </button>
            )}

            {onNext && (
              <button
                onClick={onNext}
                className="absolute right-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white transition-colors hover:bg-black/70"
                aria-label="Next photo"
              >
                <ChevronRight className="h-8 w-8" />
              </button>
            )}

            {/* Main image container */}
            <div className="flex h-full flex-col">
              <div className="relative flex-1">
                <Image
                  src={photo.urls.full}
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
                  sizes="100vw"
                />

                {/* Loading indicator */}
                {isLoading && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  </div>
                )}
              </div>

              {/* Photo info panel */}
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
                          {/* Hide username _duyet as requested */}
                          {photo.user.username !== '_duyet' && (
                            <>
                              <span>•</span>
                              <a
                                href={photo.user.links.html}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:underline"
                              >
                                @{photo.user.username}
                              </a>
                            </>
                          )}
                          <span>•</span>
                          <span>
                            {currentIndex + 1} of {totalCount}
                          </span>
                        </div>

                        {/* Camera/EXIF info */}
                        {photo.exif &&
                          (photo.exif.make ||
                            photo.exif.model ||
                            photo.exif.aperture ||
                            photo.exif.exposure_time ||
                            photo.exif.focal_length ||
                            photo.exif.iso) && (
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

                  {/* Action buttons */}
                  <div className="flex items-center gap-2">
                    <a
                      href={photo.links.html}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-lg bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
                      title="View on Unsplash"
                    >
                      <ExternalLink className="h-5 w-5" />
                    </a>
                    <a
                      href={photo.urls.full}
                      target="_blank"
                      rel="noopener noreferrer"
                      download
                      className="rounded-lg bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
                      title="Download photo"
                    >
                      <Download className="h-5 w-5" />
                    </a>
                  </div>
                </div>

                {/* Compact Unsplash attribution */}
                <div className="border-t border-white/10 px-4 py-1 text-center text-xs text-gray-500">
                  <a
                    href="https://unsplash.com/?utm_source=duyet_photo_gallery&utm_medium=referral"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-gray-300"
                  >
                    Unsplash
                  </a>
                </div>
              </div>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

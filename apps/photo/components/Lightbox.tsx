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
  const [isFullscreen, setIsFullscreen] = useState(true)

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

  // Reset to fullscreen when lightbox opens
  useEffect(() => {
    if (isOpen) {
      setIsFullscreen(true)
    }
  }, [isOpen])

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

                {/* Minimal info bar - shown in normal mode only */}
                <div className="bg-black/60 px-3 py-1">
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    {/* Left side - actions */}
                    <div className="flex items-center gap-3">
                      <a
                        href={photo.links.html}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 transition-colors hover:text-white"
                        title="View original"
                      >
                        <ExternalLink className="h-3 w-3" />
                        View
                      </a>
                      <a
                        href={photo.urls.full}
                        target="_blank"
                        rel="noopener noreferrer"
                        download
                        className="flex items-center gap-1 transition-colors hover:text-white"
                        title="Download photo"
                      >
                        <Download className="h-3 w-3" />
                        Download
                      </a>
                    </div>
                    
                    {/* Right side - compact info */}
                    <div className="flex items-center gap-2">
                      {photo.stats && (
                        <>
                          <span>👁 {photo.stats.views.toLocaleString()}</span>
                          <span>⬇ {photo.stats.downloads.toLocaleString()}</span>
                        </>
                      )}
                      <span>{formatPhotoDate(photo.created_at)}</span>
                    </div>
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
'use client'

import type { UnsplashPhoto } from '@/lib/types'
import { getOptimalImageSrc, getResponsiveSizes } from '@/lib/ImageOptimization'
import { formatPhotoMetadata, formatPhotoDescription } from '@/lib/MetadataFormatters'
import { useLightboxNavigation } from '../hooks/UseKeyboardNavigation'
import { cn } from '@duyet/libs/utils'
import * as Dialog from '@radix-ui/react-dialog'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { LightboxLoading } from './LoadingStates'
import { LightboxTopControls, NavigationButton, InfoPanel } from './LightboxControls'

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
  onNext,
  onPrevious,
  currentIndex,
  totalCount,
  onClose,
}: LightboxProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(true)
  const [showInfo, setShowInfo] = useState(false)

  // Get formatted metadata and description
  const metadata = formatPhotoMetadata(photo)
  const description = formatPhotoDescription(photo)

  // Setup navigation hooks
  const touchHandlers = useLightboxNavigation({
    isOpen,
    canGoNext: !!onNext,
    canGoPrevious: !!onPrevious,
    onClose,
    onNext,
    onPrevious,
    onToggleFullscreen: () => setIsFullscreen(!isFullscreen),
    onToggleInfo: () => setShowInfo(!showInfo),
  })

  // Reset states when photo changes or lightbox opens
  useEffect(() => {
    setIsLoading(true)
  }, [photo.id])

  useEffect(() => {
    if (isOpen) {
      setIsFullscreen(true)
      setShowInfo(false)
    }
  }, [isOpen])

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm" />
        <Dialog.Content 
          className={cn(
            'fixed inset-0 z-50',
            isFullscreen 
              ? 'overflow-hidden p-0' 
              : 'flex items-center justify-center p-4'
          )}
        >
          {/* Accessibility title */}
          <Dialog.Title className="sr-only">
            {description}
          </Dialog.Title>

          <div className={cn(
            'relative w-full',
            isFullscreen 
              ? 'h-full max-w-none' 
              : 'h-full max-w-7xl'
          )}>
            
            {/* Top Controls */}
            <LightboxTopControls
              currentIndex={currentIndex}
              totalCount={totalCount}
              isFullscreen={isFullscreen}
              showInfo={showInfo}
              onClose={onClose}
              onToggleFullscreen={() => setIsFullscreen(!isFullscreen)}
              onToggleInfo={() => setShowInfo(!showInfo)}
            />

            {/* Navigation Buttons */}
            {onPrevious && (
              <NavigationButton
                direction="previous"
                onClick={onPrevious}
                isFullscreen={isFullscreen}
              />
            )}

            {onNext && (
              <NavigationButton
                direction="next"
                onClick={onNext}
                isFullscreen={isFullscreen}
              />
            )}

            {/* Main Image Container */}
            <div 
              className={cn(
                'relative',
                isFullscreen 
                  ? 'h-full w-full flex items-center justify-center'
                  : 'h-full flex flex-col'
              )}
              {...touchHandlers}
            >
              {isFullscreen ? (
                // Fullscreen Image
                <div 
                  className="relative h-full w-full cursor-pointer" 
                  onClick={() => setIsFullscreen(false)}
                  title="Click to exit fullscreen"
                >
                  <Image
                    src={getOptimalImageSrc(photo, { context: 'lightbox' })}
                    alt={description}
                    fill
                    className={cn(
                      'object-contain transition-opacity duration-700',
                      isLoading ? 'opacity-0' : 'opacity-100',
                    )}
                    onLoad={() => setIsLoading(false)}
                    priority
                    sizes={getResponsiveSizes('lightbox')}
                    quality={95}
                  />
                </div>
              ) : (
                // Contained Layout
                <>
                  <div className="relative flex-1">
                    <div 
                      className="relative h-full w-full cursor-pointer" 
                      onClick={() => setIsFullscreen(true)}
                      title="Click to enter fullscreen"
                    >
                      <Image
                        src={getOptimalImageSrc(photo, { context: 'lightbox' })}
                        alt={description}
                        fill
                        className={cn(
                          'object-contain transition-opacity duration-700',
                          isLoading ? 'opacity-0' : 'opacity-100',
                        )}
                        onLoad={() => setIsLoading(false)}
                        priority
                        sizes="(max-width: 1792px) 100vw, 1792px"
                        quality={95}
                      />
                    </div>
                  </div>

                  {/* Info Panel for contained mode */}
                  <InfoPanel
                    photo={photo}
                    metadata={metadata}
                    isFullscreen={false}
                  />
                </>
              )}

              {/* Loading State */}
              {isLoading && (
                <LightboxLoading 
                  message="Loading high-resolution image..." 
                />
              )}

              {/* Info Panel for fullscreen mode */}
              {isFullscreen && showInfo && (
                <InfoPanel
                  photo={photo}
                  metadata={metadata}
                  isFullscreen={true}
                />
              )}
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
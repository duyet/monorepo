'use client'

import {
  generateBlurDataURL,
  getOptimalImageSrc,
  getResponsiveSizes,
  shouldPrioritizeLoading,
} from '@/lib/ImageOptimization'
import {
  formatCompactMetadata,
  formatPhotoDescription,
} from '@/lib/MetadataFormatters'
import type { UnsplashPhoto } from '@/lib/types'
import { cn } from '@duyet/libs/utils'
import { useCallback } from 'react'
import LazyImage from './LazyImage'

interface PhotoCardProps {
  photo: UnsplashPhoto
  index: number
  onClick: () => void
  className?: string
}

export default function PhotoCard({
  photo,
  index,
  onClick,
  className,
}: PhotoCardProps) {
  // Get optimized metadata for card display
  const metadata = formatCompactMetadata(photo)
  const description = formatPhotoDescription(photo)

  // Get optimized image configuration
  const imageSrc = useCallback(
    () => getOptimalImageSrc(photo, { context: 'grid' }),
    [photo],
  )

  return (
    <div
      className={cn(
        'group relative cursor-pointer overflow-hidden',
        'transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md',
        'break-inside-avoid mb-2 md:mb-3', // Prevents breaking in masonry layout + minimal spacing
        className,
      )}
      onClick={onClick}
      role="button"
      tabIndex={0}
      aria-label={`View ${description}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onClick()
        }
      }}
    >
      {/* Image Container */}
      <div className="relative">
        <LazyImage
          src={imageSrc()}
          alt={description}
          width={photo.width}
          height={photo.height}
          priority={shouldPrioritizeLoading(index)}
          blurDataURL={generateBlurDataURL(photo)}
          sizes={getResponsiveSizes('grid')}
          className="transition-opacity duration-300"
        />

        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-black bg-opacity-0 transition-opacity duration-200 group-hover:bg-opacity-20">
          <div className="absolute bottom-0 left-0 right-0 p-3 text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100">
            {photo.description && (
              <h3 className="mb-2 line-clamp-2 text-sm font-medium leading-snug sm:text-base">
                {photo.description}
              </h3>
            )}

            {/* Enhanced metadata display */}
            <div className="space-y-1.5 text-xs sm:text-sm">
              {/* Primary metadata */}
              {metadata.primary.length > 0 && (
                <div className="flex items-center gap-3 text-white/90">
                  {metadata.primary.map((item, idx) => (
                    <span key={idx}>{item}</span>
                  ))}
                </div>
              )}

              {/* Secondary metadata */}
              {metadata.secondary.length > 0 && (
                <div className="flex items-center gap-3 text-xs text-white/75">
                  {metadata.secondary.map((item, idx) => (
                    <span key={idx}>{item}</span>
                  ))}
                </div>
              )}

              {/* Attribution (excluding _duyet as specified) */}
              {photo.user.username !== '_duyet' && (
                <div className="border-t border-white/20 pt-1">
                  <a
                    href={photo.user.links.html}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-xs text-white/90 transition-colors hover:text-white"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <span>by</span>
                    <span className="ml-1 font-medium">
                      @{photo.user.username}
                    </span>
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Subtle loading indicator */}
        <div className="absolute right-3 top-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <div className="h-2 w-2 animate-pulse rounded-full bg-white/40" />
        </div>
      </div>
    </div>
  )
}

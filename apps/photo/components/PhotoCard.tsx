'use client'

import type { UnsplashPhoto } from '@/lib/types'
import { 
  getOptimalImageSrc, 
  generateBlurDataURL, 
  getResponsiveSizes,
  shouldPrioritizeLoading,
} from '@/lib/ImageOptimization'
import { formatCompactMetadata, formatPhotoDescription } from '@/lib/MetadataFormatters'
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
  const imageSrc = useCallback(() => 
    getOptimalImageSrc(photo, { context: 'grid' }), [photo]
  )

  return (
    <div
      className={cn(
        // Base card styling with professional aesthetics
        'group relative cursor-pointer overflow-hidden',
        'rounded-xl bg-white shadow-sm ring-1 ring-gray-200/50',
        'dark:bg-gray-900 dark:ring-gray-800/50',
        
        // Enhanced hover effects for portfolio feel
        'transition-all duration-300 ease-out',
        'hover:scale-[1.02] hover:shadow-xl hover:shadow-gray-900/10',
        'dark:hover:shadow-gray-900/30',
        'hover:ring-gray-300/50 dark:hover:ring-gray-700/50',
        
        // Masonry layout optimization
        'break-inside-avoid mb-6 lg:mb-8',
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
          className="transition-transform duration-500 group-hover:scale-105"
        />

        {/* Professional overlay with enhanced typography */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 transition-all duration-500 group-hover:opacity-100">
          <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
            
            {/* Primary description */}
            {photo.description && (
              <h3 className="font-medium leading-snug text-sm sm:text-base line-clamp-2 mb-2">
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
                <div className="flex items-center gap-3 text-white/75 text-xs">
                  {metadata.secondary.map((item, idx) => (
                    <span key={idx}>{item}</span>
                  ))}
                </div>
              )}

              {/* Attribution (excluding _duyet as specified) */}
              {photo.user.username !== '_duyet' && (
                <div className="pt-1 border-t border-white/20">
                  <a
                    href={photo.user.links.html}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-xs text-white/90 hover:text-white transition-colors"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <span>by</span>
                    <span className="ml-1 font-medium">@{photo.user.username}</span>
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Subtle loading indicator */}
        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="w-2 h-2 bg-white/40 rounded-full animate-pulse" />
        </div>
      </div>
    </div>
  )
}
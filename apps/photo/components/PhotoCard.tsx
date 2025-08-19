'use client'

import type { UnsplashPhoto } from '@/lib/types'
import { formatPhotoDate } from '@/lib/unsplash'
import { cn } from '@duyet/libs/utils'
import Image from 'next/image'
import { useState } from 'react'

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
  const [isLoading, setIsLoading] = useState(true)

  // Calculate aspect ratio for better layout
  const aspectRatio = photo.width / photo.height
  const isPortrait = aspectRatio < 1
  const isLandscape = aspectRatio > 1.5

  // Determine image size based on aspect ratio and screen size
  const getImageSrc = () => {
    // Use higher quality images for better display
    if (isPortrait) {
      return photo.urls.regular // Higher quality for portrait images
    } else if (isLandscape) {
      return photo.urls.regular // Regular size for landscape
    }
    return photo.urls.regular // Default to regular quality
  }

  return (
    <div
      className={cn(
        'group relative cursor-pointer overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800',
        'transition-all duration-300 hover:scale-[1.02] hover:shadow-xl',
        'break-inside-avoid', // Prevents breaking in masonry layout
        className,
      )}
      onClick={() => {
        console.log('PhotoCard clicked:', photo.id) // Debug log
        onClick()
      }}
    >
      <div className="relative">
        <Image
          src={getImageSrc()}
          alt={photo.alt_description || photo.description || 'Photo by Duyệt'}
          width={photo.width}
          height={photo.height}
          className={cn(
            'h-auto w-full object-cover transition-opacity duration-500',
            isLoading ? 'opacity-0' : 'opacity-100',
          )}
          onLoad={() => setIsLoading(false)}
          loading={index < 6 ? 'eager' : 'lazy'} // Load first 6 images eagerly, rest lazily
          placeholder="blur"
          blurDataURL={`data:image/svg+xml;base64,${Buffer.from(
            `<svg width="${photo.width}" height="${photo.height}" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="${photo.color || '#f3f4f6'}"/></svg>`,
          ).toString('base64')}`}
          sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />

        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-black bg-opacity-0 transition-all duration-300 group-hover:bg-opacity-30">
          <div className="absolute bottom-0 left-0 right-0 p-4 text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            {photo.description && (
              <p className="text-sm font-medium leading-tight">
                {photo.description}
              </p>
            )}
            <p className="text-xs opacity-75">
              {formatPhotoDate(photo.created_at)}
            </p>
            <div className="mt-1 flex items-center gap-2 text-xs opacity-75">
              {photo.stats && (
                <>
                  <span>👁 {photo.stats.views.toLocaleString()}</span>
                  <span>•</span>
                  <span>⬇ {photo.stats.downloads.toLocaleString()}</span>
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
                    onClick={(e) => e.stopPropagation()}
                  >
                    @{photo.user.username}
                  </a>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Loading skeleton */}
        {isLoading && (
          <div className="absolute inset-0 animate-pulse bg-gray-200 dark:bg-gray-700" />
        )}
      </div>
    </div>
  )
}

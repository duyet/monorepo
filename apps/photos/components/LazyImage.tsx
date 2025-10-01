'use client'

import { cn } from '@duyet/libs/utils'
import { AlertCircle } from 'lucide-react'
import Image from 'next/image'
import { useCallback, useEffect, useRef, useState } from 'react'
import { ImageSkeleton } from './LoadingStates'

interface LazyImageProps {
  src: string
  alt: string
  width: number
  height: number
  className?: string
  sizes?: string
  priority?: boolean
  blurDataURL?: string
  onLoad?: () => void
  onError?: () => void
}

export default function LazyImage({
  src,
  alt,
  width,
  height,
  className,
  sizes,
  priority = false,
  blurDataURL,
  onLoad,
  onError,
}: LazyImageProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [isInView, setIsInView] = useState(priority) // Load immediately if priority
  const imgRef = useRef<HTMLDivElement>(null)

  const handleImageLoad = useCallback(() => {
    setIsLoading(false)
    setHasError(false)
    onLoad?.()
  }, [onLoad])

  const handleImageError = useCallback(() => {
    setIsLoading(false)
    setHasError(true)
    onError?.()
  }, [onError])

  const handleRetry = useCallback(() => {
    setIsLoading(true)
    setHasError(false)
  }, [])

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (priority || isInView) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true)
          observer.disconnect()
        }
      },
      {
        // Load images when they're 200px away from entering viewport
        rootMargin: '200px',
        threshold: 0.01,
      },
    )

    const currentRef = imgRef.current
    if (currentRef) {
      observer.observe(currentRef)
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef)
      }
      observer.disconnect()
    }
  }, [priority, isInView])

  return (
    <div ref={imgRef} className="relative w-full">
      {hasError ? (
        <div
          className="flex items-center justify-center bg-gray-100 dark:bg-gray-800"
          style={{ aspectRatio: `${width}/${height}` }}
        >
          <div className="text-center">
            <AlertCircle className="mx-auto h-8 w-8 text-gray-400" />
            <p className="mt-2 text-sm text-gray-500">Failed to load image</p>
            <button
              onClick={handleRetry}
              className="mt-2 rounded bg-gray-200 px-3 py-1 text-xs text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
            >
              Retry
            </button>
          </div>
        </div>
      ) : isInView ? (
        <div className="relative w-full">
          <Image
            src={src}
            alt={alt}
            width={width}
            height={height}
            className={cn(
              'h-auto w-full object-cover transition-opacity duration-500',
              isLoading ? 'opacity-0' : 'opacity-100',
              className,
            )}
            onLoad={handleImageLoad}
            onError={handleImageError}
            loading={priority ? 'eager' : 'lazy'}
            placeholder={blurDataURL ? 'blur' : 'empty'}
            blurDataURL={blurDataURL}
            sizes={sizes}
            quality={85}
          />

          {/* Enhanced loading skeleton */}
          {isLoading && (
            <ImageSkeleton
              aspectRatio={`${width}/${height}`}
              className="absolute inset-0"
            />
          )}
        </div>
      ) : (
        // Enhanced placeholder while not in view
        <ImageSkeleton aspectRatio={`${width}/${height}`} />
      )}
    </div>
  )
}

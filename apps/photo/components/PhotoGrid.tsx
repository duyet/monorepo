'use client'

import type { UnsplashPhoto } from '@/lib/types'
import { cn } from '@duyet/libs/utils'
import { useCallback, useState } from 'react'
import Masonry from 'react-masonry-css'
import Lightbox from './Lightbox'
import PhotoCard from './PhotoCard'

interface PhotoGridProps {
  photos: UnsplashPhoto[]
  className?: string
}

export default function PhotoGrid({ photos, className }: PhotoGridProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<UnsplashPhoto | null>(null)
  const [selectedIndex, setSelectedIndex] = useState<number>(-1)

  const handlePhotoClick = useCallback(
    (photo: UnsplashPhoto, index: number) => {
      console.log('Photo clicked:', photo.id, index) // Debug log
      setSelectedPhoto(photo)
      setSelectedIndex(index)
    },
    [],
  )

  const handleNext = useCallback(() => {
    if (selectedIndex < photos.length - 1) {
      const nextIndex = selectedIndex + 1
      setSelectedIndex(nextIndex)
      setSelectedPhoto(photos[nextIndex])
    }
  }, [selectedIndex, photos])

  const handlePrevious = useCallback(() => {
    if (selectedIndex > 0) {
      const prevIndex = selectedIndex - 1
      setSelectedIndex(prevIndex)
      setSelectedPhoto(photos[prevIndex])
    }
  }, [selectedIndex, photos])

  const handleClose = useCallback(() => {
    console.log('Closing lightbox') // Debug log
    setSelectedPhoto(null)
    setSelectedIndex(-1)
  }, [])

  // Masonry breakpoint configuration
  const breakpointColumns = {
    default: 3,
    1024: 3,
    768: 2,
    640: 1,
  }

  if (!photos.length) {
    return (
      <div className="flex min-h-[400px] items-center justify-center text-gray-500 dark:text-gray-400">
        <p>No photos found.</p>
      </div>
    )
  }

  console.log('Selected photo:', selectedPhoto?.id) // Debug log

  return (
    <>
      <Masonry
        breakpointCols={breakpointColumns}
        className={cn('flex w-full -ml-4', className)}
        columnClassName="pl-4 bg-clip-padding"
      >
        {photos.map((photo, index) => (
          <PhotoCard
            key={photo.id}
            photo={photo}
            index={index}
            onClick={() => handlePhotoClick(photo, index)}
          />
        ))}
      </Masonry>

      {/* Lightbox */}
      {selectedPhoto && (
        <Lightbox
          photo={selectedPhoto}
          isOpen={!!selectedPhoto}
          onClose={handleClose}
          onNext={selectedIndex < photos.length - 1 ? handleNext : undefined}
          onPrevious={selectedIndex > 0 ? handlePrevious : undefined}
          currentIndex={selectedIndex}
          totalCount={photos.length}
        />
      )}
    </>
  )
}

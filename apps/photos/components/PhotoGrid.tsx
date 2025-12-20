"use client";

import { MASONRY_CONFIG, getMasonryClasses } from "@/lib/GridUtilities";
import type { Photo } from "@/lib/photo-provider";
import { cn } from "@duyet/libs/utils";
import { Images } from "lucide-react";
import { useCallback, useState } from "react";
import Masonry from "react-masonry-css";
import ErrorBoundary from "./ErrorBoundary";
import Lightbox from "./Lightbox";
import { EmptyState } from "./LoadingStates";
import PhotoCard from "./PhotoCard";

interface PhotoGridProps {
  photos: Photo[];
  className?: string;
}

export default function PhotoGrid({ photos, className }: PhotoGridProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);

  // Grid navigation handlers with enhanced performance
  const handlePhotoClick = useCallback((photo: Photo, index: number) => {
    setSelectedPhoto(photo);
    setSelectedIndex(index);
  }, []);

  const handleNext = useCallback(() => {
    if (selectedIndex < photos.length - 1) {
      const nextIndex = selectedIndex + 1;
      setSelectedIndex(nextIndex);
      setSelectedPhoto(photos[nextIndex]);
    }
  }, [selectedIndex, photos]);

  const handlePrevious = useCallback(() => {
    if (selectedIndex > 0) {
      const prevIndex = selectedIndex - 1;
      setSelectedIndex(prevIndex);
      setSelectedPhoto(photos[prevIndex]);
    }
  }, [selectedIndex, photos]);

  const handleClose = useCallback(() => {
    setSelectedPhoto(null);
    setSelectedIndex(-1);
  }, []);

  // Get masonry styling
  const masonryClasses = getMasonryClasses();

  // Empty state handling
  if (!photos.length) {
    return (
      <EmptyState
        title="No photos found"
        description="There are no photos to display at the moment. Try adjusting your filters or check back later."
        icon={<Images className="h-16 w-16" />}
        className={className}
      />
    );
  }

  return (
    <ErrorBoundary>
      <div className={cn("w-full px-4", className)}>
        <Masonry
          breakpointCols={MASONRY_CONFIG.breakpoints}
          className={masonryClasses.container}
          columnClassName={masonryClasses.column}
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

        {/* Enhanced lightbox with modular architecture */}
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
      </div>
    </ErrorBoundary>
  );
}

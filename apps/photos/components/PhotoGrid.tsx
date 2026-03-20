import { cn } from "@duyet/libs/utils";
import { Images } from "lucide-react";
import { useCallback, useState } from "react";
import Masonry from "react-masonry-css";
import { getMasonryClasses, MASONRY_CONFIG } from "@/lib/GridUtilities";
import type { Photo } from "@/lib/photo-provider";
import ErrorBoundary from "./ErrorBoundary";
import Lightbox from "./Lightbox";
import { EmptyState } from "./LoadingStates";
import PhotoCard from "./PhotoCard";

// Hoisted to module level — getMasonryClasses() returns static class strings that never change
const MASONRY_CLASSES = getMasonryClasses();

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
  }, [photos, selectedIndex]);

  const handlePrevious = useCallback(() => {
    if (selectedIndex > 0) {
      const prevIndex = selectedIndex - 1;
      setSelectedIndex(prevIndex);
      setSelectedPhoto(photos[prevIndex]);
    }
  }, [photos, selectedIndex]);

  const handleClose = useCallback(() => {
    setSelectedPhoto(null);
    setSelectedIndex(-1);
  }, []);

  // Empty state handling
  if (!photos.length) {
    return (
      <EmptyState
        title="No photos found"
        description="There are no photos to display at the moment."
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
          className={MASONRY_CLASSES.container}
          columnClassName={MASONRY_CLASSES.column}
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

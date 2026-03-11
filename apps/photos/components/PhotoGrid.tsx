"use client";

import { cn } from "@duyet/libs/utils";
import { Images } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import Masonry from "react-masonry-css";
import { getMasonryClasses, MASONRY_CONFIG } from "@/lib/GridUtilities";
import type { Photo } from "@/lib/photo-provider";
import ErrorBoundary from "./ErrorBoundary";
import EXIFFilters, { FilterCount } from "./EXIFFilters";
import Lightbox from "./Lightbox";
import { EmptyState } from "./LoadingStates";
import PhotoCard from "./PhotoCard";

interface PhotoGridProps {
  photos: Photo[];
  className?: string;
  showFilters?: boolean;
}

export default function PhotoGrid({
  photos,
  className,
  showFilters = true,
}: PhotoGridProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const [filteredPhotos, setFilteredPhotos] = useState<Photo[]>(photos);

  // Update filtered photos when source photos change
  useEffect(() => {
    setFilteredPhotos(photos);
  }, [photos]);

  // Grid navigation handlers with enhanced performance
  const handlePhotoClick = useCallback((photo: Photo, index: number) => {
    setSelectedPhoto(photo);
    setSelectedIndex(index);
  }, []);

  const handleNext = useCallback(() => {
    if (selectedIndex < filteredPhotos.length - 1) {
      const nextIndex = selectedIndex + 1;
      setSelectedIndex(nextIndex);
      setSelectedPhoto(filteredPhotos[nextIndex]);
    }
  }, [selectedIndex, filteredPhotos]);

  const handlePrevious = useCallback(() => {
    if (selectedIndex > 0) {
      const prevIndex = selectedIndex - 1;
      setSelectedIndex(prevIndex);
      setSelectedPhoto(filteredPhotos[prevIndex]);
    }
  }, [selectedIndex, filteredPhotos]);

  const handleClose = useCallback(() => {
    setSelectedPhoto(null);
    setSelectedIndex(-1);
  }, []);

  const handleFilterChange = useCallback((filtered: Photo[]) => {
    setFilteredPhotos(filtered);
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
        {/* EXIF Filters */}
        {showFilters && photos.length > 0 && (
          <EXIFFilters
            photos={photos}
            onFilterChange={handleFilterChange}
          />
        )}

        {/* Filter count */}
        <FilterCount filtered={filteredPhotos.length} total={photos.length} />

        {/* Empty state for filtered results */}
        {filteredPhotos.length === 0 && photos.length > 0 ? (
          <EmptyState
            title="No photos match your filters"
            description="Try adjusting your EXIF filter criteria to see more photos."
            icon={<Images className="h-16 w-16" />}
          />
        ) : (
          <Masonry
            breakpointCols={MASONRY_CONFIG.breakpoints}
            className={masonryClasses.container}
            columnClassName={masonryClasses.column}
          >
            {filteredPhotos.map((photo, index) => (
              <PhotoCard
                key={photo.id}
                photo={photo}
                index={index}
                onClick={() => handlePhotoClick(photo, index)}
              />
            ))}
          </Masonry>
        )}

        {/* Enhanced lightbox with modular architecture */}
        {selectedPhoto && (
          <Lightbox
            photo={selectedPhoto}
            isOpen={!!selectedPhoto}
            onClose={handleClose}
            onNext={selectedIndex < filteredPhotos.length - 1 ? handleNext : undefined}
            onPrevious={selectedIndex > 0 ? handlePrevious : undefined}
            currentIndex={selectedIndex}
            totalCount={filteredPhotos.length}
          />
        )}
      </div>
    </ErrorBoundary>
  );
}

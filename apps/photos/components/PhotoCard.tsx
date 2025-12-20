"use client";

import {
  generateBlurDataURL,
  getOptimalImageSrc,
  getResponsiveSizes,
  shouldPrioritizeLoading,
} from "@/lib/ImageOptimization";
import {
  formatCompactMetadata,
  formatPhotoDescription,
} from "@/lib/MetadataFormatters";
import type { Photo } from "@/lib/photo-provider";
import { OWNER_USERNAME } from "@/lib/config";
import { cn } from "@duyet/libs/utils";
import { useCallback } from "react";
import LazyImage from "./LazyImage";

interface PhotoCardProps {
  photo: Photo;
  index: number;
  onClick: () => void;
  className?: string;
}

export default function PhotoCard({
  photo,
  index,
  onClick,
  className,
}: PhotoCardProps) {
  // Get optimized metadata for card display
  const metadata = formatCompactMetadata(photo);
  const description = formatPhotoDescription(photo);

  // Get optimized image configuration
  const imageSrc = useCallback(
    () => getOptimalImageSrc(photo, { context: "grid" }),
    [photo]
  );

  // Extract location for display
  const location =
    photo.location && (photo.location.city || photo.location.country)
      ? [photo.location.city, photo.location.country].filter(Boolean).join(", ")
      : null;

  return (
    <div
      className={cn(
        "group relative cursor-pointer overflow-hidden transition-all duration-300 hover:-translate-y-1",
        "break-inside-avoid", // Prevents breaking in masonry layout + proper spacing
        className
      )}
      onClick={onClick}
      role="button"
      tabIndex={0}
      aria-label={`View ${description}`}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
    >
      {/* Image Container */}
      <div className="relative overflow-hidden">
        <LazyImage
          src={imageSrc()}
          alt={description}
          width={photo.width}
          height={photo.height}
          priority={shouldPrioritizeLoading(index)}
          blurDataURL={generateBlurDataURL(photo)}
          sizes={getResponsiveSizes("grid")}
          className="transition-transform duration-300 group-hover:scale-105"
        />

        {/* Hover overlay with additional metadata */}
        <div className="absolute inset-0 transition-opacity duration-200 group-hover:bg-opacity-20">
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
            {/* Enhanced metadata display */}
            <div className="space-y-1.5 text-xs text-white sm:text-sm">
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

              {/* Provider Attribution */}
              <div className="border-t border-white/20 pt-1">
                {photo.provider === "cloudinary" ? (
                  <span className="inline-flex items-center text-xs text-white/90">
                    CDN: cloudinary
                  </span>
                ) : photo.provider === "unsplash" ? (
                  <span className="inline-flex items-center text-xs text-white/90">
                    Unsplash
                  </span>
                ) : photo.user && photo.user.username !== OWNER_USERNAME ? (
                  <a
                    href={photo.user.links?.html}
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
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Always visible caption and location */}
      <div className="p-3">
        {photo.description && (
          <h3 className="mb-1.5 line-clamp-5 text-sm font-medium leading-snug text-neutral-900 dark:text-neutral-100">
            {photo.description}
          </h3>
        )}
        {location && (
          <p className="flex items-center gap-1.5 text-xs text-neutral-600 dark:text-neutral-400">
            <span className="text-sm">📍</span>
            <span className="line-clamp-1">{location}</span>
          </p>
        )}
      </div>
    </div>
  );
}

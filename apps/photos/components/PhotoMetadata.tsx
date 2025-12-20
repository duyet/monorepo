"use client";

import { useState } from "react";
import type { Photo } from "@/lib/photo-provider";
import {
  formatExifSettings,
  formatCameraName,
  formatPhotoDate,
} from "@/lib/MetadataFormatters";
import { Info, X } from "lucide-react";

interface PhotoMetadataProps {
  photo: Photo;
  className?: string;
}

/**
 * PhotoMetadata: Expandable metadata display component
 * Shows detailed info about photo: stats, EXIF, location when expanded
 */
export default function PhotoMetadata({
  photo,
  className = "",
}: PhotoMetadataProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const cameraName = formatCameraName(photo);
  const exifSettings = formatExifSettings(photo);
  const hasLocation =
    photo.location && (photo.location.city || photo.location.country);
  const location = hasLocation
    ? [photo.location?.city, photo.location?.country].filter(Boolean).join(", ")
    : null;

  // Format file size
  const formatFileSize = (bytes?: number) => {
    if (!bytes) return null;
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };
  const fileSize = formatFileSize(photo.bytes);

  // Don't show button if there's no metadata to display
  const hasMetadata =
    photo.stats ||
    cameraName ||
    exifSettings ||
    hasLocation ||
    fileSize ||
    photo.format ||
    photo.tags?.length;

  if (!hasMetadata) return null;

  return (
    <div className={`relative inline-flex items-center ${className}`}>
      {/* Info Toggle Icon */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="group inline-flex items-center justify-center rounded-full p-1 text-neutral-600 transition-all hover:bg-neutral-200 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-700 dark:hover:text-neutral-100"
        aria-label={isExpanded ? "Hide photo details" : "Show photo details"}
        aria-expanded={isExpanded}
      >
        {isExpanded ? <X className="h-4 w-4" /> : <Info className="h-4 w-4" />}
      </button>

      {/* Expandable Metadata Panel */}
      {isExpanded && (
        <div className="absolute left-0 top-full z-10 mt-2 min-w-64 max-w-xs rounded border border-neutral-200 bg-white px-3 py-2 text-left shadow-lg dark:border-neutral-700 dark:bg-neutral-800">
          <div className="space-y-1 text-[11px] text-neutral-700 dark:text-neutral-200">
            {/* Provider */}
            <div className="font-medium">
              {photo.provider === "cloudinary" ? "CDN: cloudinary" : "Unsplash"}
            </div>

            {/* Date */}
            <div>{formatPhotoDate(photo.created_at)}</div>

            {/* File Info (Cloudinary) */}
            {(fileSize || photo.format) && (
              <div>
                {photo.format?.toUpperCase()}
                {fileSize && ` • ${fileSize}`}
              </div>
            )}

            {/* Stats */}
            {photo.stats &&
              (photo.stats.views !== undefined ||
                photo.stats.downloads !== undefined) && (
                <>
                  {photo.stats.views !== undefined && (
                    <div>{photo.stats.views.toLocaleString()} views</div>
                  )}
                  {photo.stats.downloads !== undefined && (
                    <div>
                      {photo.stats.downloads.toLocaleString()} downloads
                    </div>
                  )}
                </>
              )}

            {/* Camera & EXIF */}
            {cameraName && (
              <div>
                {cameraName}
                {exifSettings && ` • ${exifSettings}`}
              </div>
            )}

            {/* Location */}
            {location && <div>{location}</div>}

            {/* Tags (Cloudinary) */}
            {photo.tags && photo.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 pt-1">
                {photo.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="rounded bg-neutral-200 px-1.5 py-0.5 text-[10px] dark:bg-neutral-700"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

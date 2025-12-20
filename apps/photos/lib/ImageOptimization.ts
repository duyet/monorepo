import type { Photo } from "./photo-provider";

/**
 * Image optimization utilities for the photo app
 */

/**
 * Calculate aspect ratio classification for optimal layout
 */
export interface AspectRatioInfo {
  ratio: number;
  isPortrait: boolean;
  isLandscape: boolean;
  isSquare: boolean;
  classification: "portrait" | "landscape" | "square";
}

export function getAspectRatioInfo(photo: Photo): AspectRatioInfo {
  const ratio = photo.width / photo.height;
  const isPortrait = ratio < 0.8;
  const isLandscape = ratio > 1.5;
  const isSquare = ratio >= 0.8 && ratio <= 1.2;

  let classification: "portrait" | "landscape" | "square";
  if (isPortrait) classification = "portrait";
  else if (isLandscape) classification = "landscape";
  else classification = "square";

  return { ratio, isPortrait, isLandscape, isSquare, classification };
}

/**
 * Get optimal image source URL based on context and aspect ratio
 */
export interface ImageSourceOptions {
  context: "grid" | "lightbox" | "preview";
  devicePixelRatio?: number;
  viewportWidth?: number;
}

export function getOptimalImageSrc(
  photo: Photo,
  options: ImageSourceOptions
): string {
  const { context, devicePixelRatio = 1 } = options;
  const aspectInfo = getAspectRatioInfo(photo);

  switch (context) {
    case "lightbox":
      // Always use raw/full for lightbox for maximum quality
      return photo.urls.raw || photo.urls.full;

    case "preview":
      // Use small for quick previews
      return photo.urls.small;
    default: {
      // Optimize based on aspect ratio and device capabilities
      if (devicePixelRatio > 2 || aspectInfo.isPortrait) {
        return photo.urls.regular;
      }

      if (aspectInfo.isLandscape) {
        return photo.urls.regular;
      }

      return photo.urls.regular;
    }
  }
}

/**
 * Generate optimized blur data URL for smoother loading
 */
export function generateBlurDataURL(photo: Photo): string {
  const color = photo.color || "#f3f4f6";

  return `data:image/svg+xml;base64,${Buffer.from(
    `<svg width="${photo.width}" height="${photo.height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="${color}"/>
    </svg>`
  ).toString("base64")}`;
}

/**
 * Calculate responsive image sizes based on breakpoints
 */
export function getResponsiveSizes(
  context: "grid" | "lightbox" = "grid"
): string {
  if (context === "lightbox") {
    return "100vw";
  }

  // Grid context with masonry layout considerations
  return "(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw";
}

/**
 * Determine loading priority based on index and viewport
 */
export function shouldPrioritizeLoading(
  index: number,
  context: "grid" | "lightbox" = "grid"
): boolean {
  if (context === "lightbox") return true;

  // Prioritize first 6 images in grid for above-the-fold content
  return index < 6;
}

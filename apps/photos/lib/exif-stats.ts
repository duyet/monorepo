import type { Photo } from "./photo-provider";

export interface CameraStats {
  camera: string;
  count: number;
  percentage: number;
}

export interface EXIFStatistics {
  totalPhotos: number;
  photosWithEXIF: number;
  photosWithoutEXIF: number;
  topCameras: CameraStats[];
  uniqueCameras: number;
}

/**
 * Aggregate EXIF statistics from photos
 */
export function aggregateEXIFStats(photos: Photo[]): EXIFStatistics {
  const totalPhotos = photos.length;
  const photosWithEXIF = photos.filter((p) => p.exif?.name).length;
  const photosWithoutEXIF = totalPhotos - photosWithEXIF;

  // Count cameras
  const cameraCounts = new Map<string, number>();
  for (const photo of photos) {
    if (photo.exif?.name) {
      const camera = photo.exif.name;
      cameraCounts.set(camera, (cameraCounts.get(camera) || 0) + 1);
    }
  }

  // Convert to array and sort by count descending
  const sortedCameras = Array.from(cameraCounts.entries())
    .map(([camera, count]) => ({
      camera,
      count,
      percentage: (count / photosWithEXIF) * 100,
    }))
    .sort((a, b) => b.count - a.count);

  return {
    totalPhotos,
    photosWithEXIF,
    photosWithoutEXIF,
    topCameras: sortedCameras.slice(0, 10), // Top 10 cameras
    uniqueCameras: cameraCounts.size,
  };
}

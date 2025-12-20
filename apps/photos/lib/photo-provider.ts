import type { Photo } from "./types";
import { getAllUnsplashPhotos } from "./unsplash-provider";
import { getAllCloudinaryPhotos } from "./cloudinary-provider";

// Re-export Photo type for convenience
export type { Photo } from "./types";

/**
 * Get all photos from all enabled providers (Unsplash + Cloudinary)
 * Photos are merged and sorted by creation date (newest first)
 * Fetches from all providers in parallel for better performance
 */
export async function getAllPhotos(): Promise<Photo[]> {
  console.log("📸 Fetching photos from all providers...");
  console.log("");

  const allPhotos: Photo[] = [];

  // Fetch from all providers in parallel
  const [unsplashResult, cloudinaryResult] = await Promise.allSettled([
    getAllUnsplashPhotos(),
    getAllCloudinaryPhotos(),
  ]);

  // Handle Unsplash result
  if (unsplashResult.status === "fulfilled") {
    allPhotos.push(...unsplashResult.value);
    console.log(`✅ Unsplash: ${unsplashResult.value.length} photos`);
  } else {
    console.error("❌ Error fetching Unsplash photos:", unsplashResult.reason);
  }

  // Handle Cloudinary result
  if (cloudinaryResult.status === "fulfilled") {
    allPhotos.push(...cloudinaryResult.value);
    console.log(`✅ Cloudinary: ${cloudinaryResult.value.length} photos`);
  } else {
    console.error(
      "❌ Error fetching Cloudinary photos:",
      cloudinaryResult.reason
    );
  }

  // Sort all photos by creation date (newest first)
  allPhotos.sort((a, b) => {
    const dateA = new Date(a.created_at).getTime();
    const dateB = new Date(b.created_at).getTime();
    return dateB - dateA;
  });

  console.log("");
  console.log(`📊 Total photos from all providers: ${allPhotos.length}`);
  console.log("");

  return allPhotos;
}

/**
 * Group photos by year
 */
export function groupPhotosByYear(photos: Photo[]): {
  [year: string]: Photo[];
} {
  return photos.reduce((acc: { [year: string]: Photo[] }, photo) => {
    const year = new Date(photo.created_at).getFullYear().toString();

    if (!acc[year]) {
      acc[year] = [];
    }

    acc[year].push(photo);
    return acc;
  }, {});
}

/**
 * Get photos by year
 */
export function getPhotosByYear(photos: Photo[], year: string): Photo[] {
  return photos.filter((photo) => {
    const photoYear = new Date(photo.created_at).getFullYear().toString();
    return photoYear === year;
  });
}

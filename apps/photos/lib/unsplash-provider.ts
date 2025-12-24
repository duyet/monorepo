import type { UnsplashPhoto, Photo } from "./types";
import { getAllUserPhotos as getUnsplashPhotos } from "./unsplash";
import type { PhotoFetchError } from "./errors";
import { UnknownPhotoError } from "./errors";

/**
 * Result type for getAllUnsplashPhotos
 * Returns either photos or an error
 */
export type UnsplashFetchResult =
  | { success: true; photos: Photo[]; error: null }
  | { success: false; photos: []; error: PhotoFetchError };

/**
 * Convert Unsplash photo to generic Photo format
 */
export function unsplashToPhoto(unsplashPhoto: UnsplashPhoto): Photo {
  return {
    id: unsplashPhoto.id,
    provider: "unsplash",
    created_at: unsplashPhoto.created_at,
    updated_at: unsplashPhoto.updated_at,
    width: unsplashPhoto.width,
    height: unsplashPhoto.height,
    color: unsplashPhoto.color,
    blur_hash: unsplashPhoto.blur_hash,
    description: unsplashPhoto.description,
    alt_description: unsplashPhoto.alt_description,
    urls: {
      raw: unsplashPhoto.urls.raw,
      full: unsplashPhoto.urls.full,
      regular: unsplashPhoto.urls.regular,
      small: unsplashPhoto.urls.small,
      thumb: unsplashPhoto.urls.thumb,
    },
    links: {
      self: unsplashPhoto.links.self,
      html: unsplashPhoto.links.html,
      download: unsplashPhoto.links.download,
      download_location: unsplashPhoto.links.download_location,
    },
    likes: unsplashPhoto.likes,
    stats: unsplashPhoto.stats,
    location: unsplashPhoto.location,
    exif: unsplashPhoto.exif,
    user: {
      id: unsplashPhoto.user.id,
      username: unsplashPhoto.user.username,
      name: unsplashPhoto.user.name,
      profile_image: unsplashPhoto.user.profile_image,
    },
    originalData: unsplashPhoto,
  };
}

/**
 * Get all photos from Unsplash in generic Photo format
 * Returns a result object containing either photos or an error
 */
export async function getAllUnsplashPhotos(): Promise<UnsplashFetchResult> {
  try {
    const unsplashPhotos = await getUnsplashPhotos();
    return {
      success: true,
      photos: unsplashPhotos.map(unsplashToPhoto),
      error: null,
    };
  } catch (error) {
    // Return error in result format
    const photoFetchError =
      error && typeof error === "object" && "type" in error
        ? (error as PhotoFetchError)
        : new UnknownPhotoError(error);

    return {
      success: false,
      photos: [],
      error: photoFetchError,
    };
  }
}

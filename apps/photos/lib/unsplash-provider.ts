import type { UnsplashPhoto, Photo } from './types'
import { getAllUserPhotos as getUnsplashPhotos } from './unsplash'

/**
 * Convert Unsplash photo to generic Photo format
 */
export function unsplashToPhoto(unsplashPhoto: UnsplashPhoto): Photo {
  return {
    id: unsplashPhoto.id,
    provider: 'unsplash',
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
  }
}

/**
 * Get all photos from Unsplash in generic Photo format
 */
export async function getAllUnsplashPhotos(): Promise<Photo[]> {
  const unsplashPhotos = await getUnsplashPhotos()
  return unsplashPhotos.map(unsplashToPhoto)
}

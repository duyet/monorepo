import type { AdminAndResourceOptions } from "cloudinary";
import cloudinary from "./cloudinary";
import type { CloudinaryPhoto, Photo } from "./types";

const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_FOLDER = process.env.CLOUDINARY_FOLDER || ""; // Optional folder to filter photos

/**
 * Convert Cloudinary photo to generic Photo format
 */
export function cloudinaryToPhoto(cloudinaryPhoto: CloudinaryPhoto): Photo {
  const publicId = cloudinaryPhoto.public_id;
  const cloudName = CLOUDINARY_CLOUD_NAME;

  // Generate URLs for different sizes
  const baseUrl = `https://res.cloudinary.com/${cloudName}/image/upload`;

  return {
    id: cloudinaryPhoto.asset_id || cloudinaryPhoto.public_id,
    provider: "cloudinary",
    created_at: cloudinaryPhoto.created_at,
    updated_at: cloudinaryPhoto.updated_at,
    width: cloudinaryPhoto.width,
    height: cloudinaryPhoto.height,
    color: cloudinaryPhoto.colors?.[0]?.[0] || null,
    blur_hash: null, // Cloudinary doesn't provide blur hash by default
    description: cloudinaryPhoto.context?.custom?.caption || null,
    alt_description: cloudinaryPhoto.context?.custom?.alt || null,
    format: cloudinaryPhoto.format,
    bytes: cloudinaryPhoto.bytes,
    tags: cloudinaryPhoto.tags,
    urls: {
      raw: `${baseUrl}/${publicId}`,
      full: `${baseUrl}/q_90/${publicId}`,
      regular: `${baseUrl}/w_1080,q_80/${publicId}`,
      small: `${baseUrl}/w_400,q_80/${publicId}`,
      thumb: `${baseUrl}/w_200,h_200,c_fill/${publicId}`,
    },
    links: {
      html: cloudinaryPhoto.secure_url,
      download: cloudinaryPhoto.secure_url,
    },
    likes: 0,
    location: cloudinaryPhoto.context?.custom?.location
      ? {
          name: cloudinaryPhoto.context.custom.location.name,
          city: cloudinaryPhoto.context.custom.location.city,
          country: cloudinaryPhoto.context.custom.location.country,
        }
      : undefined,
    exif: cloudinaryPhoto.image_metadata
      ? {
          make: cloudinaryPhoto.image_metadata.Make || null,
          model: cloudinaryPhoto.image_metadata.Model || null,
          name: null,
          exposure_time: cloudinaryPhoto.image_metadata.ExposureTime || null,
          aperture: cloudinaryPhoto.image_metadata.FNumber || null,
          focal_length: cloudinaryPhoto.image_metadata.FocalLength || null,
          iso: cloudinaryPhoto.image_metadata.ISO || null,
        }
      : undefined,
    user: {
      id: "cloudinary",
      username: "cloudinary",
      name: "Cloudinary",
    },
    originalData: cloudinaryPhoto as CloudinaryPhoto,
  };
}

/**
 * Get photos from Cloudinary
 */
export async function getCloudinaryPhotos(
  maxResults = 30,
  nextCursor?: string
): Promise<{ photos: Photo[]; nextCursor?: string }> {
  if (!CLOUDINARY_CLOUD_NAME) {
    console.warn(
      "CLOUDINARY_CLOUD_NAME not configured, skipping Cloudinary photos"
    );
    return { photos: [] };
  }

  try {
    const options: AdminAndResourceOptions = {
      resource_type: "image",
      type: "upload",
      max_results: maxResults,
      metadata: true,
      image_metadata: true,
      colors: true,
      context: true,
    };

    // Filter by folder if specified
    if (CLOUDINARY_FOLDER) {
      options.prefix = CLOUDINARY_FOLDER;
    }

    // Support pagination
    if (nextCursor) {
      options.next_cursor = nextCursor;
    }

    const result = await cloudinary.api.resources(options);

    const photos = (result.resources as CloudinaryPhoto[]).map(
      cloudinaryToPhoto
    );

    return {
      photos,
      nextCursor: result.next_cursor,
    };
  } catch (error) {
    console.error("Error fetching photos from Cloudinary:", error);
    throw error;
  }
}

/**
 * Get all photos from Cloudinary (with pagination)
 */
export async function getAllCloudinaryPhotos(): Promise<Photo[]> {
  const allPhotos: Photo[] = [];
  let nextCursor: string | undefined = undefined;
  const maxPages = 10; // Limit to avoid excessive API calls

  console.log("📸 Fetching photos from Cloudinary...");

  for (let page = 1; page <= maxPages; page++) {
    try {
      const result = await getCloudinaryPhotos(100, nextCursor);

      if (result.photos.length === 0) {
        break;
      }

      allPhotos.push(...result.photos);
      console.log(`   ✓ Fetched page ${page}: ${result.photos.length} photos`);

      nextCursor = result.nextCursor;
      if (!nextCursor) {
        break;
      }

      // Small delay to respect rate limits
      await new Promise((resolve) => setTimeout(resolve, 500));
    } catch (error) {
      console.error(`Error fetching Cloudinary page ${page}:`, error);
      break;
    }
  }

  console.log(`📊 Total Cloudinary photos fetched: ${allPhotos.length}`);

  return allPhotos;
}

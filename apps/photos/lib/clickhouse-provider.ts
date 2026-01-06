import type { Photo } from "./types";
import { executeQuery } from "./clickhouse";

/**
 * ClickHouse row type matching monorepo_unsplash_photos table schema.
 * This is what comes back from ClickHouse queries.
 */
interface ClickHousePhotoRow {
  photo_id: string;
  provider: string;
  created_at: string;
  updated_at: string;
  promoted_at: string | null;
  width: number;
  height: number;
  color: string | null;
  blur_hash: string | null;
  description: string | null;
  alt_description: string | null;
  url_raw: string;
  url_full: string;
  url_regular: string;
  url_small: string;
  url_thumb: string;
  link_self: string;
  link_html: string;
  link_download: string;
  link_download_location: string;
  likes: number;
  downloads: number;
  views: number;
  location_name: string | null;
  location_city: string | null;
  location_country: string | null;
  location_latitude: number | null;
  location_longitude: number | null;
  exif_make: string | null;
  exif_model: string | null;
  exif_exposure_time: string | null;
  exif_aperture: string | null;
  exif_focal_length: string | null;
  exif_iso: number | null;
  user_id: string;
  user_username: string;
  user_name: string;
  user_profile_image_small: string | null;
  user_profile_image_medium: string | null;
  user_profile_image_large: string | null;
  user_link_html: string | null;
}

/**
 * Convert ClickHouse row to Photo type.
 * Maps flattened ClickHouse columns to the Photo interface structure.
 */
function clickhouseToPhoto(row: ClickHousePhotoRow): Photo {
  return {
    id: row.photo_id,
    provider: "unsplash",
    created_at: row.created_at,
    updated_at: row.updated_at,
    width: row.width,
    height: row.height,
    color: row.color ?? undefined,
    blur_hash: row.blur_hash ?? undefined,
    description: row.description ?? undefined,
    alt_description: row.alt_description ?? undefined,
    urls: {
      raw: row.url_raw,
      full: row.url_full,
      regular: row.url_regular,
      small: row.url_small,
      thumb: row.url_thumb,
    },
    links: {
      self: row.link_self,
      html: row.link_html,
      download: row.link_download,
      download_location: row.link_download_location,
    },
    likes: row.likes,
    stats: {
      downloads: row.downloads,
      views: row.views,
    },
    location:
      row.location_name || row.location_city || row.location_country
        ? {
            name: row.location_name ?? undefined,
            city: row.location_city ?? undefined,
            country: row.location_country ?? undefined,
            position:
              row.location_latitude && row.location_longitude
                ? {
                    latitude: row.location_latitude,
                    longitude: row.location_longitude,
                  }
                : undefined,
          }
        : undefined,
    exif:
      row.exif_make || row.exif_model
        ? {
            make: row.exif_make ?? undefined,
            model: row.exif_model ?? undefined,
            exposure_time: row.exif_exposure_time ?? undefined,
            aperture: row.exif_aperture ?? undefined,
            focal_length: row.exif_focal_length ?? undefined,
            iso: row.exif_iso ?? undefined,
          }
        : undefined,
    user: {
      id: row.user_id,
      username: row.user_username,
      name: row.user_name,
      profile_image: {
        small: row.user_profile_image_small ?? undefined,
        medium: row.user_profile_image_medium ?? undefined,
        large: row.user_profile_image_large ?? undefined,
      },
      links: {
        html: row.user_link_html ?? undefined,
      },
    },
  };
}

/**
 * Get all photos from ClickHouse.
 * Queries monorepo_unsplash_photos table and transforms to Photo[].
 */
export async function getAllClickHousePhotos(): Promise<Photo[]> {
  console.log("📸 Fetching photos from ClickHouse...");

  const query = `
    SELECT *
    FROM monorepo_unsplash_photos FINAL
    WHERE is_deleted = 0
    ORDER BY created_at DESC
    LIMIT 500
  `;

  const rows = await executeQuery<ClickHousePhotoRow>(query);

  if (rows.length === 0) {
    console.log("   ⚠️  No photos found in ClickHouse");
    return [];
  }

  const photos = rows.map(clickhouseToPhoto);
  console.log(`   ✅ ClickHouse: ${photos.length} photos`);

  return photos;
}

/**
 * Check if ClickHouse has photos available.
 * Used to determine whether to use ClickHouse or fallback to API.
 */
export async function hasClickHousePhotos(): Promise<boolean> {
  const query = `
    SELECT count() as count
    FROM monorepo_unsplash_photos FINAL
    WHERE is_deleted = 0
  `;

  const result = await executeQuery<{ count: string }>(query);
  const count = result.length > 0 ? parseInt(result[0].count, 10) : 0;
  return count > 0;
}

import { existsSync } from "node:fs";
import { DuckDBInstance } from "@duckdb/node-api";
import { ANALYTICS_CACHE_PATH } from "../../insights/lib/analytics-cache-path";
import { UNSPLASH_USERNAME } from "./config";
import type { Photo } from "./types";

interface DuckDBPhotoRow {
  photo_id: string;
  created_at: string;
  updated_at: string;
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

function rowToPhoto(row: DuckDBPhotoRow): Photo {
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

export async function getAllDuckDBPhotos(): Promise<Photo[]> {
  if (!UNSPLASH_USERNAME) {
    console.warn("[Photos DuckDB] UNSPLASH_USERNAME is not configured");
    return [];
  }

  if (!existsSync(ANALYTICS_CACHE_PATH)) {
    return [];
  }

  let instance: DuckDBInstance | null = null;
  let connection: Awaited<ReturnType<DuckDBInstance["connect"]>> | null = null;

  try {
    instance = await DuckDBInstance.create(ANALYTICS_CACHE_PATH, {
      access_mode: "READ_ONLY",
    });
    connection = await instance.connect();
    const reader = await connection.runAndReadAll(
      `
        SELECT
          photo_id,
          CAST(created_at AS VARCHAR) as created_at,
          CAST(updated_at AS VARCHAR) as updated_at,
          width,
          height,
          color,
          blur_hash,
          description,
          alt_description,
          url_raw,
          url_full,
          url_regular,
          url_small,
          url_thumb,
          link_self,
          link_html,
          link_download,
          link_download_location,
          likes,
          downloads,
          views,
          location_name,
          location_city,
          location_country,
          location_latitude,
          location_longitude,
          exif_make,
          exif_model,
          exif_exposure_time,
          exif_aperture,
          exif_focal_length,
          exif_iso,
          user_id,
          user_username,
          user_name,
          user_profile_image_small,
          user_profile_image_medium,
          user_profile_image_large,
          user_link_html
        FROM monorepo_unsplash_photos
        WHERE user_username = $username
        ORDER BY created_at DESC
        LIMIT 500
      `,
      { username: UNSPLASH_USERNAME }
    );

    const rows = reader.getRowObjectsJson() as unknown as DuckDBPhotoRow[];
    const photos = rows.map(rowToPhoto);
    if (photos.length > 0) {
      console.log(`✅ DuckDB cache: ${photos.length} Unsplash photos`);
    }

    return photos;
  } catch (error) {
    console.warn(
      "[Photos DuckDB] Cache unavailable:",
      error instanceof Error ? error.message : error
    );
    return [];
  } finally {
    connection?.closeSync();
    instance?.closeSync();
  }
}

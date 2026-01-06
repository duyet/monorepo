import type { ClickHouseClient } from "@clickhouse/client";
import { BaseSyncer } from "../lib/base";
import type { SyncOptions } from "../lib/base/types";

/**
 * Full Unsplash API response types (complete photo metadata)
 */
interface UnsplashApiPhoto {
  id: string;
  created_at: string;
  updated_at: string;
  promoted_at: string | null;
  width: number;
  height: number;
  color: string | null;
  blur_hash: string | null;
  description: string | null;
  alt_description: string | null;
  urls: {
    raw: string;
    full: string;
    regular: string;
    small: string;
    thumb: string;
    small_s3?: string;
  };
  links: {
    self: string;
    html: string;
    download: string;
    download_location: string;
  };
  likes: number;
  statistics?: {
    downloads?: { total: number };
    views?: { total: number };
    likes?: { total: number };
  };
  location?: {
    name: string | null;
    city: string | null;
    country: string | null;
    position?: {
      latitude: number | null;
      longitude: number | null;
    };
  };
  exif?: {
    make: string | null;
    model: string | null;
    name: string | null;
    exposure_time: string | null;
    aperture: string | null;
    focal_length: string | null;
    iso: number | null;
  };
  user: {
    id: string;
    username: string;
    name: string;
    profile_image: {
      small: string;
      medium: string;
      large: string;
    };
    links: {
      html: string;
    };
  };
}

/**
 * ClickHouse record type (flattened schema)
 */
interface UnsplashPhotoRecord {
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
  raw_data: string;
}

const UNSPLASH_API_URL = "https://api.unsplash.com";

/**
 * Syncer for full Unsplash photo metadata including EXIF, location, and user data.
 * Stores complete photo information for apps/photos consumption.
 */
export class UnsplashPhotosSyncer extends BaseSyncer<
  UnsplashApiPhoto,
  UnsplashPhotoRecord
> {
  private username: string;

  constructor(client: ClickHouseClient, username?: string) {
    super(client, "unsplash-photos");
    this.username = username || process.env.UNSPLASH_USERNAME || "_duyet";
  }

  protected getTableName(): string {
    return "monorepo_unsplash_photos";
  }

  protected async fetchFromApi(
    _options: SyncOptions
  ): Promise<UnsplashApiPhoto[]> {
    const accessKey = process.env.UNSPLASH_ACCESS_KEY;
    if (!accessKey) {
      throw new Error("UNSPLASH_ACCESS_KEY environment variable not set");
    }

    this.logger.info(`Fetching photos for user: ${this.username}`);

    // Fetch all photos with pagination
    const allPhotos = await this.fetchAllPhotos(accessKey);

    // Enrich photos with detailed EXIF/location data
    this.logger.info("Enriching photos with detailed metadata...");
    const enrichedPhotos = await this.enrichPhotosWithDetails(
      allPhotos,
      accessKey
    );

    this.logger.info(
      `Total photos fetched and enriched: ${enrichedPhotos.length}`
    );
    return enrichedPhotos;
  }

  private async fetchAllPhotos(accessKey: string): Promise<UnsplashApiPhoto[]> {
    const allPhotos: UnsplashApiPhoto[] = [];
    let page = 1;
    const perPage = 30;
    let hasMore = true;

    // Fetch up to 10 pages (300 photos max)
    while (hasMore && page <= 10) {
      const photos = await this.withRetry(async () => {
        const res = await fetch(
          `${UNSPLASH_API_URL}/users/${this.username}/photos?page=${page}&per_page=${perPage}&stats=true`,
          {
            headers: {
              Authorization: `Client-ID ${accessKey}`,
              "Accept-Version": "v1",
            },
          }
        );

        if (!res.ok) {
          if (res.status === 429) {
            throw new Error("Rate limit exceeded - will retry");
          }
          if (res.status === 401) {
            throw new Error(
              "Unsplash API authentication failed: Invalid access key"
            );
          }
          if (res.status === 404) {
            throw new Error(`Unsplash user not found: ${this.username}`);
          }
          throw new Error(
            `Unsplash API error: ${res.status} ${res.statusText}`
          );
        }

        return res.json() as Promise<UnsplashApiPhoto[]>;
      });

      if (photos.length === 0) {
        hasMore = false;
      } else {
        allPhotos.push(...photos);
        this.logger.info(`Fetched page ${page}: ${photos.length} photos`);
        page++;

        // Rate limit delay between pages
        if (hasMore && page <= 10) {
          await this.sleep(500);
        }
      }
    }

    return allPhotos;
  }

  private async enrichPhotosWithDetails(
    photos: UnsplashApiPhoto[],
    accessKey: string
  ): Promise<UnsplashApiPhoto[]> {
    const enriched: UnsplashApiPhoto[] = [];
    let enrichedCount = 0;

    for (const photo of photos) {
      // Check if photo needs enrichment (missing EXIF or location)
      const hasExif = photo.exif && (photo.exif.make || photo.exif.model);
      const hasLocation =
        photo.location && (photo.location.city || photo.location.country);

      if (!hasExif || !hasLocation) {
        try {
          const details = await this.fetchPhotoDetails(photo.id, accessKey);
          if (details) {
            enriched.push({
              ...photo,
              exif: details.exif || photo.exif,
              location: details.location || photo.location,
              description: details.description || photo.description,
              alt_description:
                details.alt_description || photo.alt_description,
            });
            enrichedCount++;
            // Rate limit between detail requests
            await this.sleep(300);
            continue;
          }
        } catch (error) {
          this.logger.warn(`Failed to enrich photo ${photo.id}: ${error}`);
        }
      }

      enriched.push(photo);
    }

    this.logger.info(`Enriched ${enrichedCount} photos with detailed metadata`);
    return enriched;
  }

  private async fetchPhotoDetails(
    photoId: string,
    accessKey: string
  ): Promise<Partial<UnsplashApiPhoto> | null> {
    try {
      const res = await fetch(`${UNSPLASH_API_URL}/photos/${photoId}`, {
        headers: {
          Authorization: `Client-ID ${accessKey}`,
          "Accept-Version": "v1",
        },
      });

      if (!res.ok) {
        if (res.status === 429) {
          this.logger.warn("Rate limit hit during enrichment, skipping");
          return null;
        }
        return null;
      }

      return res.json();
    } catch {
      return null;
    }
  }

  protected async transform(
    data: UnsplashApiPhoto[]
  ): Promise<UnsplashPhotoRecord[]> {
    return data.map((photo) => ({
      photo_id: photo.id,
      provider: "unsplash",
      created_at: photo.created_at,
      updated_at: photo.updated_at,
      promoted_at: photo.promoted_at,
      width: photo.width,
      height: photo.height,
      color: photo.color,
      blur_hash: photo.blur_hash,
      description: photo.description,
      alt_description: photo.alt_description,
      url_raw: photo.urls.raw,
      url_full: photo.urls.full,
      url_regular: photo.urls.regular,
      url_small: photo.urls.small,
      url_thumb: photo.urls.thumb,
      link_self: photo.links.self,
      link_html: photo.links.html,
      link_download: photo.links.download,
      link_download_location: photo.links.download_location,
      likes: photo.likes || 0,
      downloads: photo.statistics?.downloads?.total || 0,
      views: photo.statistics?.views?.total || 0,
      location_name: photo.location?.name || null,
      location_city: photo.location?.city || null,
      location_country: photo.location?.country || null,
      location_latitude: photo.location?.position?.latitude || null,
      location_longitude: photo.location?.position?.longitude || null,
      exif_make: photo.exif?.make || null,
      exif_model: photo.exif?.model || null,
      exif_exposure_time: photo.exif?.exposure_time || null,
      exif_aperture: photo.exif?.aperture || null,
      exif_focal_length: photo.exif?.focal_length || null,
      exif_iso: photo.exif?.iso || null,
      user_id: photo.user.id,
      user_username: photo.user.username,
      user_name: photo.user.name,
      user_profile_image_small: photo.user.profile_image?.small || null,
      user_profile_image_medium: photo.user.profile_image?.medium || null,
      user_profile_image_large: photo.user.profile_image?.large || null,
      user_link_html: photo.user.links?.html || null,
      raw_data: JSON.stringify(photo),
    }));
  }
}

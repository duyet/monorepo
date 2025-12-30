import type { ClickHouseClient } from "@clickhouse/client";
import { BaseSyncer } from "../lib/base";
import type { SyncOptions } from "../lib/base/types";

interface UnsplashPhoto {
  id: string;
  width: number;
  height: number;
  color: string;
  description: string | null;
  alt_description: string | null;
  created_at: string;
  downloads: number;
  views: number;
  likes: number;
  urls: {
    raw: string;
    regular: string;
    thumb: string;
  };
}

interface UnsplashUser {
  username: string;
  total_photos: number;
  total_likes: number;
  total_collections: number;
  followers_count: number;
  following_count: number;
  downloads: number;
}

interface UnsplashResponse {
  photos: UnsplashPhoto[];
  user: UnsplashUser;
}

interface UnsplashPhotoRecord {
  snapshot_date: string;
  photo_id: string;
  width: number;
  height: number;
  color: string;
  description: string;
  alt_description: string;
  created_at: string;
  downloads: number;
  views: number;
  likes: number;
  url_raw: string;
  url_regular: string;
  url_thumb: string;
}

const UNSPLASH_API_URL = "https://api.unsplash.com";

export class UnsplashSyncer extends BaseSyncer<
  UnsplashResponse,
  UnsplashPhotoRecord
> {
  private username: string;

  constructor(client: ClickHouseClient, username?: string) {
    super(client, "unsplash");
    this.username = username || process.env.UNSPLASH_USERNAME || "duyet";
  }

  protected getTableName(): string {
    return "data_sync_unsplash";
  }

  protected async fetchFromApi(
    _options: SyncOptions
  ): Promise<UnsplashResponse[]> {
    const accessKey = process.env.UNSPLASH_ACCESS_KEY;
    if (!accessKey) {
      throw new Error("UNSPLASH_ACCESS_KEY environment variable not set");
    }

    this.logger.info(`Fetching Unsplash data for user: ${this.username}`);

    // Fetch user profile
    const user = await this.fetchUser(accessKey);

    // Fetch user photos (paginated)
    const photos = await this.fetchPhotos(accessKey);

    return [{ photos, user }];
  }

  private async fetchUser(accessKey: string): Promise<UnsplashUser> {
    const response = await this.withRetry(async () => {
      const res = await fetch(`${UNSPLASH_API_URL}/users/${this.username}`, {
        headers: {
          Authorization: `Client-ID ${accessKey}`,
          "Accept-Version": "v1",
        },
      });

      if (!res.ok) {
        if (res.status === 401) {
          throw new Error(
            "Unsplash API authentication failed: Invalid access key"
          );
        }
        if (res.status === 404) {
          throw new Error(`Unsplash user not found: ${this.username}`);
        }
        throw new Error(`Unsplash API error: ${res.status} ${res.statusText}`);
      }

      return res.json();
    });

    return response;
  }

  private async fetchPhotos(accessKey: string): Promise<UnsplashPhoto[]> {
    const allPhotos: UnsplashPhoto[] = [];
    let page = 1;
    const perPage = 30;
    let hasMore = true;

    while (hasMore && page <= 10) {
      // Max 10 pages (300 photos)
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
          throw new Error(
            `Unsplash API error: ${res.status} ${res.statusText}`
          );
        }

        return res.json();
      });

      if (photos.length === 0) {
        hasMore = false;
      } else {
        allPhotos.push(...photos);
        page++;

        // Rate limit: wait between requests
        if (hasMore && page <= 10) {
          await this.sleep(500);
        }
      }
    }

    this.logger.info(`Fetched ${allPhotos.length} photos from Unsplash`);
    return allPhotos;
  }

  protected async transform(
    data: UnsplashResponse[]
  ): Promise<UnsplashPhotoRecord[]> {
    const snapshotDate = new Date().toISOString().split("T")[0];
    const records: UnsplashPhotoRecord[] = [];

    for (const response of data) {
      for (const photo of response.photos) {
        records.push({
          snapshot_date: snapshotDate,
          photo_id: photo.id,
          width: photo.width,
          height: photo.height,
          color: photo.color || "",
          description: photo.description || "",
          alt_description: photo.alt_description || "",
          created_at: photo.created_at,
          downloads: photo.downloads || 0,
          views: photo.views || 0,
          likes: photo.likes || 0,
          url_raw: photo.urls.raw,
          url_regular: photo.urls.regular,
          url_thumb: photo.urls.thumb,
        });
      }
    }

    this.logger.info(`Transformed ${records.length} photo records`);
    return records;
  }
}

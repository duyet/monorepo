import type { Photo } from "./types";

/**
 * Fallback photos from @_duyet's Unsplash profile.
 * Displayed when all providers (ClickHouse, Unsplash API, Cloudinary) fail.
 * These are publicly accessible and don't require API authentication.
 */
const FALLBACK_PHOTOS: Omit<Photo, "provider">[] = [
  {
    id: "3tnmCJNxDeY",
    created_at: "2025-01-15T10:00:00Z",
    updated_at: "2025-01-15T10:00:00Z",
    width: 4000,
    height: 6000,
    color: "#738c9e",
    description: "Modern buildings with unique architectural designs",
    alt_description: "Modern buildings with unique architectural designs.",
    urls: {
      raw: "https://images.unsplash.com/photo-1764522319659-1ab9b3fdfa7b?w=4000",
      full: "https://images.unsplash.com/photo-1764522319659-1ab9b3fdfa7b?w=2400&q=90",
      regular:
        "https://images.unsplash.com/photo-1764522319659-1ab9b3fdfa7b?w=1080&q=80",
      small:
        "https://images.unsplash.com/photo-1764522319659-1ab9b3fdfa7b?w=400&q=80",
      thumb:
        "https://images.unsplash.com/photo-1764522319659-1ab9b3fdfa7b?w=200&q=80",
    },
    links: {
      self: "https://unsplash.com/photos/3tnmCJNxDeY",
      html: "https://unsplash.com/photos/3tnmCJNxDeY",
      download: "https://unsplash.com/photos/3tnmCJNxDeY/download",
    },
    likes: 0,
    stats: { downloads: 0, views: 0 },
    user: {
      id: "_duyet",
      username: "_duyet",
      name: "Duyet Le",
      profile_image: {},
      links: { html: "https://unsplash.com/@_duyet" },
    },
  },
  {
    id: "twrBkMVGG1s",
    created_at: "2025-01-14T14:30:00Z",
    updated_at: "2025-01-14T14:30:00Z",
    width: 5472,
    height: 3648,
    color: "#a0b8c8",
    description: "Modern skyscraper behind old building under clear sky",
    alt_description:
      "Modern skyscraper behind old building under clear sky",
    urls: {
      raw: "https://images.unsplash.com/photo-1764521879550-4a8945fe7a94?w=5472",
      full: "https://images.unsplash.com/photo-1764521879550-4a8945fe7a94?w=2400&q=90",
      regular:
        "https://images.unsplash.com/photo-1764521879550-4a8945fe7a94?w=1080&q=80",
      small:
        "https://images.unsplash.com/photo-1764521879550-4a8945fe7a94?w=400&q=80",
      thumb:
        "https://images.unsplash.com/photo-1764521879550-4a8945fe7a94?w=200&q=80",
    },
    links: {
      self: "https://unsplash.com/photos/twrBkMVGG1s",
      html: "https://unsplash.com/photos/twrBkMVGG1s",
      download: "https://unsplash.com/photos/twrBkMVGG1s/download",
    },
    likes: 0,
    stats: { downloads: 0, views: 0 },
    user: {
      id: "_duyet",
      username: "_duyet",
      name: "Duyet Le",
      profile_image: {},
      links: { html: "https://unsplash.com/@_duyet" },
    },
  },
  {
    id: "P-MSAyU0erY",
    created_at: "2025-01-10T08:15:00Z",
    updated_at: "2025-01-10T08:15:00Z",
    width: 4928,
    height: 3264,
    color: "#6b8e5c",
    description: "Hand holding a matcha bowl with whisk",
    alt_description: "Hand holding a matcha bowl with whisk",
    urls: {
      raw: "https://images.unsplash.com/photo-1763056518471-80fb54d43287?w=4928",
      full: "https://images.unsplash.com/photo-1763056518471-80fb54d43287?w=2400&q=90",
      regular:
        "https://images.unsplash.com/photo-1763056518471-80fb54d43287?w=1080&q=80",
      small:
        "https://images.unsplash.com/photo-1763056518471-80fb54d43287?w=400&q=80",
      thumb:
        "https://images.unsplash.com/photo-1763056518471-80fb54d43287?w=200&q=80",
    },
    links: {
      self: "https://unsplash.com/photos/P-MSAyU0erY",
      html: "https://unsplash.com/photos/P-MSAyU0erY",
      download: "https://unsplash.com/photos/P-MSAyU0erY/download",
    },
    likes: 0,
    stats: { downloads: 0, views: 0 },
    user: {
      id: "_duyet",
      username: "_duyet",
      name: "Duyet Le",
      profile_image: {},
      links: { html: "https://unsplash.com/@_duyet" },
    },
  },
  {
    id: "D9I82hISzJU",
    created_at: "2024-12-20T16:45:00Z",
    updated_at: "2024-12-20T16:45:00Z",
    width: 6000,
    height: 4000,
    color: "#4a6e7f",
    description: "Binoculars on mountain overlook with lake and hills",
    alt_description:
      "Binoculars on mountain overlook with lake and hills",
    urls: {
      raw: "https://images.unsplash.com/photo-1760810502641-7e3dd29e863a?w=6000",
      full: "https://images.unsplash.com/photo-1760810502641-7e3dd29e863a?w=2400&q=90",
      regular:
        "https://images.unsplash.com/photo-1760810502641-7e3dd29e863a?w=1080&q=80",
      small:
        "https://images.unsplash.com/photo-1760810502641-7e3dd29e863a?w=400&q=80",
      thumb:
        "https://images.unsplash.com/photo-1760810502641-7e3dd29e863a?w=200&q=80",
    },
    links: {
      self: "https://unsplash.com/photos/D9I82hISzJU",
      html: "https://unsplash.com/photos/D9I82hISzJU",
      download: "https://unsplash.com/photos/D9I82hISzJU/download",
    },
    likes: 0,
    stats: { downloads: 0, views: 0 },
    user: {
      id: "_duyet",
      username: "_duyet",
      name: "Duyet Le",
      profile_image: {},
      links: { html: "https://unsplash.com/@_duyet" },
    },
  },
  {
    id: "piub7bQncGk",
    created_at: "2024-12-12T12:00:00Z",
    updated_at: "2024-12-12T12:00:00Z",
    width: 5184,
    height: 3456,
    color: "#7ca3c0",
    description: "Stone building with arched windows against blue sky",
    alt_description:
      "Stone building with arched windows against blue sky",
    urls: {
      raw: "https://images.unsplash.com/photo-1763450549919-365299eb8573?w=5184",
      full: "https://images.unsplash.com/photo-1763450549919-365299eb8573?w=2400&q=90",
      regular:
        "https://images.unsplash.com/photo-1763450549919-365299eb8573?w=1080&q=80",
      small:
        "https://images.unsplash.com/photo-1763450549919-365299eb8573?w=400&q=80",
      thumb:
        "https://images.unsplash.com/photo-1763450549919-365299eb8573?w=200&q=80",
    },
    links: {
      self: "https://unsplash.com/photos/piub7bQncGk",
      html: "https://unsplash.com/photos/piub7bQncGk",
      download: "https://unsplash.com/photos/piub7bQncGk/download",
    },
    likes: 0,
    stats: { downloads: 0, views: 0 },
    user: {
      id: "_duyet",
      username: "_duyet",
      name: "Duyet Le",
      profile_image: {},
      links: { html: "https://unsplash.com/@_duyet" },
    },
  },
  {
    id: "V-_OfGj6QKM",
    created_at: "2024-11-18T19:30:00Z",
    updated_at: "2024-11-18T19:30:00Z",
    width: 4368,
    height: 2912,
    color: "#8bc34a",
    description: "A light green convertible car parked outdoors",
    alt_description: "A light green convertible car parked outdoors.",
    urls: {
      raw: "https://images.unsplash.com/photo-1760809448791-4cc77ae086f8?w=4368",
      full: "https://images.unsplash.com/photo-1760809448791-4cc77ae086f8?w=2400&q=90",
      regular:
        "https://images.unsplash.com/photo-1760809448791-4cc77ae086f8?w=1080&q=80",
      small:
        "https://images.unsplash.com/photo-1760809448791-4cc77ae086f8?w=400&q=80",
      thumb:
        "https://images.unsplash.com/photo-1760809448791-4cc77ae086f8?w=200&q=80",
    },
    links: {
      self: "https://unsplash.com/photos/V-_OfGj6QKM",
      html: "https://unsplash.com/photos/V-_OfGj6QKM",
      download: "https://unsplash.com/photos/V-_OfGj6QKM/download",
    },
    likes: 0,
    stats: { downloads: 0, views: 0 },
    user: {
      id: "_duyet",
      username: "_duyet",
      name: "Duyet Le",
      profile_image: {},
      links: { html: "https://unsplash.com/@_duyet" },
    },
  },
];

/**
 * Get fallback photos when all providers fail.
 * Returns @_duyet's actual Unsplash photos as static fallbacks.
 */
export async function getFallbackPhotos(): Promise<Photo[]> {
  console.log("📸 Using fallback photos - all providers unavailable");
  console.log(
    "   💡 To display your own photos, configure one of:",
  );
  console.log(
    "      • ClickHouse: CLICKHOUSE_HOST, CLICKHOUSE_PASSWORD, CLICKHOUSE_DATABASE",
  );
  console.log("      • Unsplash: UNSPLASH_ACCESS_KEY");
  console.log("      • Cloudinary: CLOUDINARY_CLOUD_NAME");
  console.log(
    "      • Local photos: Place images in public/photos/ directory",
  );

  return FALLBACK_PHOTOS.map((photo) => ({
    ...photo,
    provider: "unsplash" as const,
  }));
}

/**
 * Check if fallback photos should be enabled.
 * Enabled when no other providers are configured or available.
 */
export function isFallbackEnabled(): boolean {
  const hasClickHouse =
    process.env.CLICKHOUSE_HOST &&
    process.env.CLICKHOUSE_PASSWORD &&
    process.env.CLICKHOUSE_DATABASE;
  const hasUnsplash = process.env.UNSPLASH_ACCESS_KEY;
  const hasCloudinary = process.env.CLOUDINARY_CLOUD_NAME;

  // If no providers are configured, fallback is enabled
  return !hasClickHouse && !hasUnsplash && !hasCloudinary;
}

import type { Photo } from "./types";

/**
 * Fallback photos to display when all providers fail.
 * These are high-quality sample images from Unsplash that work without authentication.
 */
const FALLBACK_PHOTOS: Omit<Photo, "provider">[] = [
  {
    id: "fallback-1",
    created_at: "2024-01-15T10:00:00Z",
    updated_at: "2024-01-15T10:00:00Z",
    width: 4000,
    height: 6000,
    color: "#266594",
    blur_hash: "LJDeqX0J%1xu%6WBRO.8%#tRRjWB",
    description: "Mountain landscape at sunrise",
    alt_description: "mountain landscape photography",
    urls: {
      raw: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=4000",
      full: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=2400&q=90",
      regular: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1080&q=80",
      small: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400&q=80",
      thumb: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=200&q=80",
    },
    links: {
      self: "https://unsplash.com/photos/LF8gK8-HASg",
      html: "https://unsplash.com/photos/LF8gK8-HASg",
      download: "https://unsplash.com/photos/LF8gK8-HASg/download",
    },
    likes: 245,
    stats: {
      downloads: 1240,
      views: 45000,
    },
    location: {
      name: "Swiss Alps",
      country: "Switzerland",
    },
    user: {
      id: "zF5zDq0YAAA",
      username: "eberhardgross",
      name: "Eberhard Gross",
      profile_image: {
        small: "https://images.unsplash.com/profile-1502689235516-92cf7dc7a70c?ixlib=rb-1.2.1&auto=format&fit=crop&w=32&h=32",
        medium: "https://images.unsplash.com/profile-1502689235516-92cf7dc7a70c?ixlib=rb-1.2.1&auto=format&fit=crop&w=64&h=64",
        large: "https://images.unsplash.com/profile-1502689235516-92cf7dc7a70c?ixlib=rb-1.2.1&auto=format&fit=crop&w=128&h=128",
      },
      links: {
        html: "https://unsplash.com/@eberhardgross",
      },
    },
  },
  {
    id: "fallback-2",
    created_at: "2024-02-10T14:30:00Z",
    updated_at: "2024-02-10T14:30:00Z",
    width: 5472,
    height: 3648,
    color: "#d9d9d9",
    blur_hash: "L5Idq~V?vMV@of%MjZxZ?bO@oL",
    description: "Modern architecture building",
    alt_description: "modern architecture photography",
    urls: {
      raw: "https://images.unsplash.com/photo-1486325212027-8081e485255e?w=5472",
      full: "https://images.unsplash.com/photo-1486325212027-8081e485255e?w=2400&q=90",
      regular: "https://images.unsplash.com/photo-1486325212027-8081e485255e?w=1080&q=80",
      small: "https://images.unsplash.com/photo-1486325212027-8081e485255e?w=400&q=80",
      thumb: "https://images.unsplash.com/photo-1486325212027-8081e485255e?w=200&q=80",
    },
    links: {
      self: "https://unsplash.com/photos/_H6BGp1bPc",
      html: "https://unsplash.com/photos/_H6BGp1bPc",
      download: "https://unsplash.com/photos/_H6BGp1bPc/download",
    },
    likes: 892,
    stats: {
      downloads: 3400,
      views: 125000,
    },
    user: {
      id: "zF5zDq0YAAA",
      username: "vidarn",
      name: "Vidar Nordli-Mathisen",
      profile_image: {
        small: "https://images.unsplash.com/profile-1445374703941-ce9322065705?ixlib=rb-1.2.1&auto=format&fit=crop&w=32&h=32",
        medium: "https://images.unsplash.com/profile-1445374703941-ce9322065705?ixlib=rb-1.2.1&auto=format&fit=crop&w=64&h=64",
        large: "https://images.unsplash.com/profile-1445374703941-ce9322065705?ixlib=rb-1.2.1&auto=format&fit=crop&w=128&h=128",
      },
      links: {
        html: "https://unsplash.com/@vidarnm",
      },
    },
  },
  {
    id: "fallback-3",
    created_at: "2024-03-05T08:15:00Z",
    updated_at: "2024-03-05T08:15:00Z",
    width: 4928,
    height: 3264,
    color: "#a67c52",
    blur_hash: "LGFuP]xv%Mt6%gofj[r=tR#jbad",
    description: "Cozy coffee shop interior",
    alt_description: "coffee shop photography",
    urls: {
      raw: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=4928",
      full: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=2400&q=90",
      regular: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1080&q=80",
      small: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&q=80",
      thumb: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=200&q=80",
    },
    links: {
      self: "https://unsplash.com/photos/E8Ufcyxz514",
      html: "https://unsplash.com/photos/E8Ufcyxz514",
      download: "https://unsplash.com/photos/E8Ufcyxz514/download",
    },
    likes: 1234,
    stats: {
      downloads: 5600,
      views: 189000,
    },
    location: {
      name: "Portland",
      city: "Portland",
      country: "United States",
    },
    user: {
      id: "zF5zDq0YAAA",
      username: "nathan",
      name: "Nathan Dumlao",
      profile_image: {
        small: "https://images.unsplash.com/profile-1502689235516-92cf7dc7a70c?ixlib=rb-1.2.1&auto=format&fit=crop&w=32&h=32",
        medium: "https://images.unsplash.com/profile-1502689235516-92cf7dc7a70c?ixlib=rb-1.2.1&auto=format&fit=crop&w=64&h=64",
        large: "https://images.unsplash.com/profile-1502689235516-92cf7dc7a70c?ixlib=rb-1.2.1&auto=format&fit=crop&w=128&h=128",
      },
      links: {
        html: "https://unsplash.com/@nate_dumlao",
      },
    },
  },
  {
    id: "fallback-4",
    created_at: "2024-04-20T16:45:00Z",
    updated_at: "2024-04-20T16:45:00Z",
    width: 6000,
    height: 4000,
    color: "#1c3d5a",
    blur_hash: "L6Cflg00%M%M?bt7oLWB9tR*of",
    description: "Ocean waves at sunset",
    alt_description: "ocean photography",
    urls: {
      raw: "https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=6000",
      full: "https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=2400&q=90",
      regular: "https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=1080&q=80",
      small: "https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=400&q=80",
      thumb: "https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=200&q=80",
    },
    links: {
      self: "https://unsplash.com/photos/w_E89Xbu1kc",
      html: "https://unsplash.com/photos/w_E89Xbu1kc",
      download: "https://unsplash.com/photos/w_E89Xbu1kc/download",
    },
    likes: 3456,
    stats: {
      downloads: 8900,
      views: 234000,
    },
    user: {
      id: "zF5zDq0YAAA",
      username: "davidmarcu",
      name: "David Marcu",
      profile_image: {
        small: "https://images.unsplash.com/profile-1502689235516-92cf7dc7a70c?ixlib=rb-1.2.1&auto=format&fit=crop&w=32&h=32",
        medium: "https://images.unsplash.com/profile-1502689235516-92cf7dc7a70c?ixlib=rb-1.2.1&auto=format&fit=crop&w=64&h=64",
        large: "https://images.unsplash.com/profile-1502689235516-92cf7dc7a70c?ixlib=rb-1.2.1&auto=format&fit=crop&w=128&h=128",
      },
      links: {
        html: "https://unsplash.com/@davidmarcu",
      },
    },
  },
  {
    id: "fallback-5",
    created_at: "2024-05-12T12:00:00Z",
    updated_at: "2024-05-12T12:00:00Z",
    width: 5184,
    height: 3456,
    color: "#f5a623",
    blur_hash: "L95RJpxu009F0000~q%M.8^%2",
    description: "Urban street photography",
    alt_description: "street photography",
    urls: {
      raw: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=5184",
      full: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=2400&q=90",
      regular: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=1080&q=80",
      small: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&q=80",
      thumb: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=200&q=80",
    },
    links: {
      self: "https://unsplash.com/photos/NYrVsD4d0tA",
      html: "https://unsplash.com/photos/NYrVsD4d0tA",
      download: "https://unsplash.com/photos/NYrVsD4d0tA/download",
    },
    likes: 567,
    stats: {
      downloads: 2300,
      views: 78000,
    },
    location: {
      name: "New York City",
      city: "New York",
      country: "United States",
    },
    user: {
      id: "zF5zDq0YAAA",
      username: "pawel",
      name: "Pawel Kadysz",
      profile_image: {
        small: "https://images.unsplash.com/profile-1502689235516-92cf7dc7a70c?ixlib=rb-1.2.1&auto=format&fit=crop&w=32&h=32",
        medium: "https://images.unsplash.com/profile-1502689235516-92cf7dc7a70c?ixlib=rb-1.2.1&auto=format&fit=crop&w=64&h=64",
        large: "https://images.unsplash.com/profile-1502689235516-92cf7dc7a70c?ixlib=rb-1.2.1&auto=format&fit=crop&w=128&h=128",
      },
      links: {
        html: "https://unsplash.com/@pawel_kadysz",
      },
    },
  },
  {
    id: "fallback-6",
    created_at: "2024-06-18T19:30:00Z",
    updated_at: "2024-06-18T19:30:00Z",
    width: 4368,
    height: 2912,
    color: "#8bc34a",
    blur_hash: "L8PtZ;00R%ju-ofD%it7?HM{nN",
    description: "Forest path in autumn",
    alt_description: "nature photography",
    urls: {
      raw: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=4368",
      full: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=2400&q=90",
      regular: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1080&q=80",
      small: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&q=80",
      thumb: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=200&q=80",
    },
    links: {
      self: "https://unsplash.com/photos/e02Hhn3tN4Y",
      html: "https://unsplash.com/photos/e02Hhn3tN4Y",
      download: "https://unsplash.com/photos/e02Hhn3tN4Y/download",
    },
    likes: 1892,
    stats: {
      downloads: 7800,
      views: 167000,
    },
    user: {
      id: "zF5zDq0YAAA",
      username: "dumitriu",
      name: "Sergei Dmut",
      profile_image: {
        small: "https://images.unsplash.com/profile-1502689235516-92cf7dc7a70c?ixlib=rb-1.2.1&auto=format&fit=crop&w=32&h=32",
        medium: "https://images.unsplash.com/profile-1502689235516-92cf7dc7a70c?ixlib=rb-1.2.1&auto=format&fit=crop&w=64&h=64",
        large: "https://images.unsplash.com/profile-1502689235516-92cf7dc7a70c?ixlib=rb-1.2.1&auto=format&fit=crop&w=128&h=128",
      },
      links: {
        html: "https://unsplash.com/@sdumitriu",
      },
    },
  },
];

/**
 * Get fallback photos when all providers fail.
 * Returns a curated set of sample photos from Unsplash.
 * These photos are publicly accessible and don't require API authentication.
 */
export async function getFallbackPhotos(): Promise<Photo[]> {
  console.log("📸 Using fallback photos - all providers unavailable");
  console.log(
    "   💡 To display your own photos, configure one of:"
  );
  console.log(
    "      • ClickHouse: CLICKHOUSE_HOST, CLICKHOUSE_PASSWORD, CLICKHOUSE_DATABASE"
  );
  console.log(
    "      • Unsplash: UNSPLASH_ACCESS_KEY"
  );
  console.log(
    "      • Cloudinary: CLOUDINARY_CLOUD_NAME"
  );
  console.log(
    "      • Local photos: Place images in public/photos/ directory"
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
  const hasClickHouse = process.env.CLICKHOUSE_HOST &&
    process.env.CLICKHOUSE_PASSWORD &&
    process.env.CLICKHOUSE_DATABASE;
  const hasUnsplash = process.env.UNSPLASH_ACCESS_KEY;
  const hasCloudinary = process.env.CLOUDINARY_CLOUD_NAME;

  // If no providers are configured, fallback is enabled
  return !hasClickHouse && !hasUnsplash && !hasCloudinary;
}

export interface UnsplashPhoto {
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
  // Raw statistics from API (when stats=true)
  statistics?: {
    downloads?: {
      total: number;
    };
    views?: {
      total: number;
    };
    likes?: {
      total: number;
    };
  };
  // Enhanced fields for better display
  stats?: {
    downloads: number;
    views: number;
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
    first_name: string;
    last_name: string | null;
    twitter_username: string | null;
    portfolio_url: string | null;
    bio: string | null;
    location: string | null;
    links: {
      self: string;
      html: string;
      photos: string;
      likes: string;
      portfolio: string;
      following: string;
      followers: string;
    };
    profile_image: {
      small: string;
      medium: string;
      large: string;
    };
    instagram_username: string | null;
    total_collections: number;
    total_likes: number;
    total_photos: number;
    accepted_tos: boolean;
    for_hire: boolean;
    social: {
      instagram_username: string | null;
      portfolio_url: string | null;
      twitter_username: string | null;
      paypal_email: string | null;
    };
  };
}

export interface PhotosByYear {
  [year: string]: UnsplashPhoto[];
}

// Cloudinary Photo Interface
export interface CloudinaryPhoto {
  asset_id?: string;
  public_id: string;
  created_at: string;
  updated_at?: string;
  width: number;
  height: number;
  format?: string;
  resource_type?: string;
  type?: string;
  url?: string;
  secure_url: string;
  bytes?: number;
  tags?: string[];
  colors?: Array<[string, number]>;
  context?: {
    custom?: {
      caption?: string;
      alt?: string;
      location?: {
        name?: string;
        city?: string;
        country?: string;
      };
      [key: string]: any;
    };
  };
  metadata?: {
    [key: string]: any;
  };
  image_metadata?: {
    Make?: string;
    Model?: string;
    ExposureTime?: string;
    FNumber?: string;
    FocalLength?: string;
    ISO?: number;
    DateTimeOriginal?: string;
    Orientation?: number;
    ColorSpace?: string;
    [key: string]: any;
  };
  // Add any other Cloudinary-specific fields as needed
}

// Photo Provider Type
export type PhotoProvider = "unsplash" | "cloudinary";

// Generic Photo interface that works with both providers
export interface Photo {
  id: string;
  provider: PhotoProvider;
  created_at: string;
  updated_at?: string;
  width: number;
  height: number;
  color?: string | null;
  blur_hash?: string | null;
  description?: string | null;
  alt_description?: string | null;
  format?: string;
  bytes?: number;
  tags?: string[];
  urls: {
    raw?: string;
    full: string;
    regular: string;
    small: string;
    thumb: string;
  };
  links?: {
    self?: string;
    html?: string;
    download?: string;
    download_location?: string;
  };
  likes?: number;
  stats?: {
    downloads?: number;
    views?: number;
  };
  location?: {
    name?: string | null;
    city?: string | null;
    country?: string | null;
    position?: {
      latitude?: number | null;
      longitude?: number | null;
    };
  };
  exif?: {
    make?: string | null;
    model?: string | null;
    name?: string | null;
    exposure_time?: string | null;
    aperture?: string | null;
    focal_length?: string | null;
    iso?: number | null;
  };
  user?: {
    id?: string;
    username?: string;
    name?: string;
    profile_image?: {
      small?: string;
      medium?: string;
      large?: string;
    };
    links?: {
      self?: string;
      html?: string;
      photos?: string;
      likes?: string;
      portfolio?: string;
      following?: string;
      followers?: string;
    };
  };
  // Original data from the provider
  originalData?: UnsplashPhoto | CloudinaryPhoto;
}

// Extended EXIF metadata for local photos
export interface DetailedExif {
  // Camera information
  make?: string
  model?: string
  lensModel?: string

  // Shooting parameters
  exposureTime?: string
  fNumber?: string | number
  aperture?: string
  iso?: number
  focalLength?: string | number
  focalLengthIn35mm?: number

  // Date and time
  dateTime?: string
  dateTimeOriginal?: string
  dateTimeDigitized?: string

  // GPS location
  gps?: {
    latitude?: number
    longitude?: number
    altitude?: number
    latitudeRef?: string
    longitudeRef?: string
  }

  // Image properties
  orientation?: number
  width?: number
  height?: number
  colorSpace?: string
  whiteBalance?: string

  // Additional metadata
  software?: string
  artist?: string
  copyright?: string
  description?: string
  userComment?: string

  // Shooting modes
  exposureMode?: string
  exposureProgram?: string
  meteringMode?: string
  flash?: string
  sceneCaptureType?: string
}

// Local photo interface
export interface LocalPhoto {
  id: string
  source: 'local'
  filename: string
  originalName: string
  created_at: string
  updated_at: string
  width: number
  height: number
  size: number // file size in bytes
  mimeType: string

  // URLs for local photos
  urls: {
    raw: string
    full: string
    regular: string
    small: string
    thumb: string
  }

  // Metadata
  description?: string
  alt_description?: string
  tags?: string[]

  // EXIF data
  exif?: DetailedExif

  // Location from EXIF or manual entry
  location?: {
    name?: string
    city?: string
    country?: string
    position?: {
      latitude: number
      longitude: number
    }
  }

  // User info (for local photos, this is the uploader)
  user?: {
    name: string
    username: string
  }

  // Stats (for consistency with Unsplash)
  stats?: {
    views: number
    downloads: number
  }

  // Color information
  color?: string
  blur_hash?: string
}

// Unified photo type that can be either Unsplash or Local
export type Photo =
  | (UnsplashPhoto & { source: 'unsplash' })
  | LocalPhoto

// Type guard to check if a photo is from Unsplash
export function isUnsplashPhoto(photo: Photo): photo is UnsplashPhoto & { source: 'unsplash' } {
  return photo.source === 'unsplash' || 'user' in photo && 'links' in (photo as any).user
}

// Type guard to check if a photo is local
export function isLocalPhoto(photo: Photo): photo is LocalPhoto {
  return photo.source === 'local'
}

// Unified PhotosByYear that can contain both types
export interface UnifiedPhotosByYear {
  [year: string]: Photo[]
}

// Upload response from API
export interface UploadResponse {
  success: boolean
  photo?: LocalPhoto
  error?: string
}

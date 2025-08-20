export interface UnsplashPhoto {
  id: string
  created_at: string
  updated_at: string
  promoted_at: string | null
  width: number
  height: number
  color: string | null
  blur_hash: string | null
  description: string | null
  alt_description: string | null
  urls: {
    raw: string
    full: string
    regular: string
    small: string
    thumb: string
    small_s3?: string
  }
  links: {
    self: string
    html: string
    download: string
    download_location: string
  }
  likes: number
  // Raw statistics from API (when stats=true)
  statistics?: {
    downloads?: {
      total: number
    }
    views?: {
      total: number
    }
    likes?: {
      total: number
    }
  }
  // Enhanced fields for better display
  stats?: {
    downloads: number
    views: number
  }
  location?: {
    name: string | null
    city: string | null
    country: string | null
    position?: {
      latitude: number | null
      longitude: number | null
    }
  }
  exif?: {
    make: string | null
    model: string | null
    name: string | null
    exposure_time: string | null
    aperture: string | null
    focal_length: string | null
    iso: number | null
  }
  user: {
    id: string
    username: string
    name: string
    first_name: string
    last_name: string | null
    twitter_username: string | null
    portfolio_url: string | null
    bio: string | null
    location: string | null
    links: {
      self: string
      html: string
      photos: string
      likes: string
      portfolio: string
      following: string
      followers: string
    }
    profile_image: {
      small: string
      medium: string
      large: string
    }
    instagram_username: string | null
    total_collections: number
    total_likes: number
    total_photos: number
    accepted_tos: boolean
    for_hire: boolean
    social: {
      instagram_username: string | null
      portfolio_url: string | null
      twitter_username: string | null
      paypal_email: string | null
    }
  }
}

export interface PhotosByYear {
  [year: string]: UnsplashPhoto[]
}

import type { UnsplashPhoto } from '@/lib/types'
import {
  formatPhotoDate,
  getPhotosByYear,
  groupPhotosByYear,
} from '@/lib/unsplash'

// Mock photo data
const mockPhotos: UnsplashPhoto[] = [
  {
    id: '1',
    created_at: '2023-01-15T10:00:00Z',
    updated_at: '2023-01-15T10:00:00Z',
    promoted_at: null,
    width: 1920,
    height: 1080,
    color: '#f3f4f6',
    blur_hash: 'LEHV6nWB2yk8pyo0adR*.7kCMdnj',
    description: 'A beautiful sunset',
    alt_description: 'Sunset over mountains',
    urls: {
      raw: 'https://images.unsplash.com/photo-1/raw',
      full: 'https://images.unsplash.com/photo-1/full',
      regular: 'https://images.unsplash.com/photo-1/regular',
      small: 'https://images.unsplash.com/photo-1/small',
      thumb: 'https://images.unsplash.com/photo-1/thumb',
    },
    links: {
      self: 'https://api.unsplash.com/photos/1',
      html: 'https://unsplash.com/photos/1',
      download: 'https://unsplash.com/photos/1/download',
      download_location: 'https://api.unsplash.com/photos/1/download',
    },
    likes: 100,
    user: {
      id: 'user1',
      username: '_duyet',
      name: 'Duyet',
      first_name: 'Duyet',
      last_name: null,
      twitter_username: null,
      portfolio_url: null,
      bio: null,
      location: null,
      links: {
        self: 'https://api.unsplash.com/users/user1',
        html: 'https://unsplash.com/@_duyet',
        photos: 'https://api.unsplash.com/users/user1/photos',
        likes: 'https://api.unsplash.com/users/user1/likes',
        portfolio: 'https://api.unsplash.com/users/user1/portfolio',
        following: 'https://api.unsplash.com/users/user1/following',
        followers: 'https://api.unsplash.com/users/user1/followers',
      },
      profile_image: {
        small: 'https://images.unsplash.com/profile-1-small',
        medium: 'https://images.unsplash.com/profile-1-medium',
        large: 'https://images.unsplash.com/profile-1-large',
      },
      instagram_username: null,
      total_collections: 0,
      total_likes: 0,
      total_photos: 100,
      accepted_tos: true,
      for_hire: false,
      social: {
        instagram_username: null,
        portfolio_url: null,
        twitter_username: null,
        paypal_email: null,
      },
    },
  },
  {
    id: '2',
    created_at: '2024-03-20T14:30:00Z',
    updated_at: '2024-03-20T14:30:00Z',
    promoted_at: null,
    width: 1080,
    height: 1920,
    color: '#2d3748',
    blur_hash: 'L02Bg2WB2yk8pyo0adR*.7kCMdnj',
    description: 'City skyline at night',
    alt_description: 'Night cityscape with lights',
    urls: {
      raw: 'https://images.unsplash.com/photo-2/raw',
      full: 'https://images.unsplash.com/photo-2/full',
      regular: 'https://images.unsplash.com/photo-2/regular',
      small: 'https://images.unsplash.com/photo-2/small',
      thumb: 'https://images.unsplash.com/photo-2/thumb',
    },
    links: {
      self: 'https://api.unsplash.com/photos/2',
      html: 'https://unsplash.com/photos/2',
      download: 'https://unsplash.com/photos/2/download',
      download_location: 'https://api.unsplash.com/photos/2/download',
    },
    likes: 250,
    user: {
      id: 'user1',
      username: '_duyet',
      name: 'Duyet',
      first_name: 'Duyet',
      last_name: null,
      twitter_username: null,
      portfolio_url: null,
      bio: null,
      location: null,
      links: {
        self: 'https://api.unsplash.com/users/user1',
        html: 'https://unsplash.com/@_duyet',
        photos: 'https://api.unsplash.com/users/user1/photos',
        likes: 'https://api.unsplash.com/users/user1/likes',
        portfolio: 'https://api.unsplash.com/users/user1/portfolio',
        following: 'https://api.unsplash.com/users/user1/following',
        followers: 'https://api.unsplash.com/users/user1/followers',
      },
      profile_image: {
        small: 'https://images.unsplash.com/profile-1-small',
        medium: 'https://images.unsplash.com/profile-1-medium',
        large: 'https://images.unsplash.com/profile-1-large',
      },
      instagram_username: null,
      total_collections: 0,
      total_likes: 0,
      total_photos: 100,
      accepted_tos: true,
      for_hire: false,
      social: {
        instagram_username: null,
        portfolio_url: null,
        twitter_username: null,
        paypal_email: null,
      },
    },
  },
]

describe('Unsplash utility functions', () => {
  describe('groupPhotosByYear', () => {
    it('should group photos by year correctly', () => {
      const result = groupPhotosByYear(mockPhotos)

      expect(result).toEqual({
        '2023': [mockPhotos[0]],
        '2024': [mockPhotos[1]],
      })
    })

    it('should handle empty array', () => {
      const result = groupPhotosByYear([])
      expect(result).toEqual({})
    })

    it('should handle multiple photos in same year', () => {
      const sameYearPhotos = [
        { ...mockPhotos[0], id: '3' },
        { ...mockPhotos[0], id: '4' },
      ]
      const result = groupPhotosByYear(sameYearPhotos)

      expect(result['2023']).toHaveLength(2)
    })
  })

  describe('getPhotosByYear', () => {
    it('should return photos for specific year', () => {
      const result = getPhotosByYear(mockPhotos, '2023')
      expect(result).toEqual([mockPhotos[0]])
    })

    it('should return empty array for non-existent year', () => {
      const result = getPhotosByYear(mockPhotos, '2025')
      expect(result).toEqual([])
    })

    it('should handle string year parameter', () => {
      const result = getPhotosByYear(mockPhotos, '2024')
      expect(result).toEqual([mockPhotos[1]])
    })
  })

  describe('formatPhotoDate', () => {
    it('should format date correctly', () => {
      const result = formatPhotoDate('2023-01-15T10:00:00Z')
      expect(result).toBe('January 15, 2023')
    })

    it('should handle different date formats', () => {
      const result = formatPhotoDate('2024-12-25T00:00:00Z')
      expect(result).toBe('December 25, 2024')
    })
  })
})

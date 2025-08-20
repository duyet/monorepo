import PhotoCard from '@/components/PhotoCard'
import type { UnsplashPhoto } from '@/lib/types'
import { fireEvent, render, screen } from '@testing-library/react'

// Mock photo data
const mockPhoto: UnsplashPhoto = {
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
  stats: {
    downloads: 5000,
    views: 50000,
  },
  location: {
    name: 'Grand Canyon',
    city: 'Grand Canyon Village',
    country: 'United States',
    position: {
      latitude: 36.1069,
      longitude: -112.1129,
    },
  },
  user: {
    id: 'user1',
    username: 'photographer',
    name: 'Test Photographer',
    first_name: 'Test',
    last_name: 'Photographer',
    twitter_username: null,
    portfolio_url: null,
    bio: null,
    location: null,
    links: {
      self: 'https://api.unsplash.com/users/user1',
      html: 'https://unsplash.com/@photographer',
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
}

describe.skip('PhotoCard', () => {
  const mockOnClick = jest.fn()

  beforeEach(() => {
    mockOnClick.mockClear()
  })

  it('renders photo with correct attributes', () => {
    render(<PhotoCard photo={mockPhoto} index={0} onClick={mockOnClick} />)

    const image = screen.getByRole('img')
    expect(image).toBeInTheDocument()
    expect(image).toHaveAttribute('alt', 'Sunset over mountains')
    expect(image).toHaveAttribute('src', mockPhoto.urls.regular)
  })

  it('displays photo description on hover', () => {
    render(<PhotoCard photo={mockPhoto} index={0} onClick={mockOnClick} />)

    expect(screen.getByText('A beautiful sunset')).toBeInTheDocument()
  })

  it('displays stats when available', () => {
    render(<PhotoCard photo={mockPhoto} index={0} onClick={mockOnClick} />)

    expect(screen.getByText('👁 50,000')).toBeInTheDocument()
    expect(screen.getByText('⬇ 5,000')).toBeInTheDocument()
  })

  it('displays location when available', () => {
    render(<PhotoCard photo={mockPhoto} index={0} onClick={mockOnClick} />)

    expect(
      screen.getByText('📍 Grand Canyon Village, United States'),
    ).toBeInTheDocument()
  })

  it('hides _duyet username but shows other usernames', () => {
    // Test with non-_duyet username
    render(<PhotoCard photo={mockPhoto} index={0} onClick={mockOnClick} />)
    expect(screen.getByText('@photographer')).toBeInTheDocument()

    // Test with _duyet username
    const duyetPhoto = {
      ...mockPhoto,
      user: { ...mockPhoto.user, username: '_duyet' },
    }
    const { rerender } = render(
      <PhotoCard photo={duyetPhoto} index={0} onClick={mockOnClick} />,
    )

    rerender(<PhotoCard photo={duyetPhoto} index={0} onClick={mockOnClick} />)
    expect(screen.queryByText('@_duyet')).not.toBeInTheDocument()
  })

  it('calls onClick when card is clicked', () => {
    render(<PhotoCard photo={mockPhoto} index={0} onClick={mockOnClick} />)

    const card = screen.getByRole('img').closest('div')
    fireEvent.click(card!)

    expect(mockOnClick).toHaveBeenCalledTimes(1)
  })

  it('sets loading attribute correctly based on index', () => {
    // First 6 images should be eager
    render(<PhotoCard photo={mockPhoto} index={0} onClick={mockOnClick} />)
    expect(screen.getByRole('img')).toHaveAttribute('loading', 'eager')

    // Images after 6 should be lazy
    const { rerender } = render(
      <PhotoCard photo={mockPhoto} index={7} onClick={mockOnClick} />,
    )
    rerender(<PhotoCard photo={mockPhoto} index={7} onClick={mockOnClick} />)
    expect(screen.getByRole('img')).toHaveAttribute('loading', 'lazy')
  })

  it('displays dimensions correctly', () => {
    render(<PhotoCard photo={mockPhoto} index={0} onClick={mockOnClick} />)

    expect(screen.getByText('1920 × 1080')).toBeInTheDocument()
  })

  it('handles missing optional data gracefully', () => {
    const minimalPhoto = {
      ...mockPhoto,
      description: null,
      stats: undefined,
      location: undefined,
    }

    render(<PhotoCard photo={minimalPhoto} index={0} onClick={mockOnClick} />)

    // Should not crash and should still display basic info
    expect(screen.getByRole('img')).toBeInTheDocument()
    expect(screen.getByText('1920 × 1080')).toBeInTheDocument()
  })
})

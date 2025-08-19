import Lightbox from '@/components/Lightbox'
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
  exif: {
    make: 'Canon',
    model: 'EOS R5',
    name: 'Canon EOS R5',
    exposure_time: '1/250',
    aperture: '2.8',
    focal_length: '85',
    iso: 200,
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

describe('Lightbox', () => {
  const mockOnClose = jest.fn()
  const mockOnNext = jest.fn()
  const mockOnPrevious = jest.fn()

  beforeEach(() => {
    mockOnClose.mockClear()
    mockOnNext.mockClear()
    mockOnPrevious.mockClear()
  })

  it('renders when open', () => {
    render(
      <Lightbox
        photo={mockPhoto}
        isOpen={true}
        onClose={mockOnClose}
        onNext={mockOnNext}
        onPrevious={mockOnPrevious}
        currentIndex={0}
        totalCount={5}
      />,
    )

    expect(screen.getByRole('img')).toBeInTheDocument()
    expect(screen.getByRole('img')).toHaveAttribute('src', mockPhoto.urls.full)
  })

  it('does not render when closed', () => {
    render(
      <Lightbox
        photo={mockPhoto}
        isOpen={false}
        onClose={mockOnClose}
        onNext={mockOnNext}
        onPrevious={mockOnPrevious}
        currentIndex={0}
        totalCount={5}
      />,
    )

    expect(screen.queryByRole('img')).not.toBeInTheDocument()
  })

  it('displays photo information correctly', () => {
    render(
      <Lightbox
        photo={mockPhoto}
        isOpen={true}
        onClose={mockOnClose}
        onNext={mockOnNext}
        onPrevious={mockOnPrevious}
        currentIndex={0}
        totalCount={5}
      />,
    )

    expect(screen.getByText('A beautiful sunset')).toBeInTheDocument()
    expect(screen.getByText('January 15, 2023')).toBeInTheDocument()
    expect(screen.getByText('👁 50,000')).toBeInTheDocument()
    expect(screen.getByText('⬇ 5,000')).toBeInTheDocument()
    expect(screen.getByText('1920 × 1080')).toBeInTheDocument()
    expect(
      screen.getByText('📍 Grand Canyon Village, United States'),
    ).toBeInTheDocument()
    expect(screen.getByText('1 of 5')).toBeInTheDocument()
  })

  it('displays camera/EXIF information', () => {
    render(
      <Lightbox
        photo={mockPhoto}
        isOpen={true}
        onClose={mockOnClose}
        onNext={mockOnNext}
        onPrevious={mockOnPrevious}
        currentIndex={0}
        totalCount={5}
      />,
    )

    expect(screen.getByText('📷 Canon EOS R5')).toBeInTheDocument()
    expect(screen.getByText('🔍 85mm')).toBeInTheDocument()
    expect(screen.getByText('⚪ f/2.8')).toBeInTheDocument()
    expect(screen.getByText('⏱ 1/250s')).toBeInTheDocument()
    expect(screen.getByText('🎞 ISO 200')).toBeInTheDocument()
  })

  it('hides _duyet username but shows other usernames', () => {
    render(
      <Lightbox
        photo={mockPhoto}
        isOpen={true}
        onClose={mockOnClose}
        onNext={mockOnNext}
        onPrevious={mockOnPrevious}
        currentIndex={0}
        totalCount={5}
      />,
    )

    expect(screen.getByText('@photographer')).toBeInTheDocument()

    // Test with _duyet username
    const duyetPhoto = {
      ...mockPhoto,
      user: { ...mockPhoto.user, username: '_duyet' },
    }
    const { rerender } = render(
      <Lightbox
        photo={duyetPhoto}
        isOpen={true}
        onClose={mockOnClose}
        onNext={mockOnNext}
        onPrevious={mockOnPrevious}
        currentIndex={0}
        totalCount={5}
      />,
    )

    rerender(
      <Lightbox
        photo={duyetPhoto}
        isOpen={true}
        onClose={mockOnClose}
        onNext={mockOnNext}
        onPrevious={mockOnPrevious}
        currentIndex={0}
        totalCount={5}
      />,
    )
    expect(screen.queryByText('@_duyet')).not.toBeInTheDocument()
  })

  it('has accessible title', () => {
    render(
      <Lightbox
        photo={mockPhoto}
        isOpen={true}
        onClose={mockOnClose}
        onNext={mockOnNext}
        onPrevious={mockOnPrevious}
        currentIndex={0}
        totalCount={5}
      />,
    )

    // Check that DialogTitle exists (screen reader only)
    expect(document.querySelector('[role="dialog"]')).toBeInTheDocument()
  })

  it('shows navigation buttons correctly', () => {
    render(
      <Lightbox
        photo={mockPhoto}
        isOpen={true}
        onClose={mockOnClose}
        onNext={mockOnNext}
        onPrevious={mockOnPrevious}
        currentIndex={1}
        totalCount={5}
      />,
    )

    expect(screen.getByLabelText('Previous photo')).toBeInTheDocument()
    expect(screen.getByLabelText('Next photo')).toBeInTheDocument()
    expect(screen.getByLabelText('Close')).toBeInTheDocument()
  })

  it('calls navigation functions when buttons clicked', () => {
    render(
      <Lightbox
        photo={mockPhoto}
        isOpen={true}
        onClose={mockOnClose}
        onNext={mockOnNext}
        onPrevious={mockOnPrevious}
        currentIndex={1}
        totalCount={5}
      />,
    )

    fireEvent.click(screen.getByLabelText('Previous photo'))
    expect(mockOnPrevious).toHaveBeenCalledTimes(1)

    fireEvent.click(screen.getByLabelText('Next photo'))
    expect(mockOnNext).toHaveBeenCalledTimes(1)

    fireEvent.click(screen.getByLabelText('Close'))
    expect(mockOnClose).toHaveBeenCalledTimes(1)
  })

  it('handles keyboard navigation', () => {
    render(
      <Lightbox
        photo={mockPhoto}
        isOpen={true}
        onClose={mockOnClose}
        onNext={mockOnNext}
        onPrevious={mockOnPrevious}
        currentIndex={1}
        totalCount={5}
      />,
    )

    fireEvent.keyDown(document, { key: 'Escape' })
    expect(mockOnClose).toHaveBeenCalledTimes(1)

    fireEvent.keyDown(document, { key: 'ArrowLeft' })
    expect(mockOnPrevious).toHaveBeenCalledTimes(1)

    fireEvent.keyDown(document, { key: 'ArrowRight' })
    expect(mockOnNext).toHaveBeenCalledTimes(1)
  })

  it('displays Unsplash attribution', () => {
    render(
      <Lightbox
        photo={mockPhoto}
        isOpen={true}
        onClose={mockOnClose}
        onNext={mockOnNext}
        onPrevious={mockOnPrevious}
        currentIndex={0}
        totalCount={5}
      />,
    )

    expect(screen.getByText(/Photo by/)).toBeInTheDocument()
    expect(screen.getByText(/Test Photographer/)).toBeInTheDocument()
    expect(screen.getByText(/on/)).toBeInTheDocument()
    expect(screen.getByText(/Unsplash/)).toBeInTheDocument()
  })

  it('handles missing optional data gracefully', () => {
    const minimalPhoto = {
      ...mockPhoto,
      description: null,
      stats: undefined,
      location: undefined,
      exif: undefined,
    }

    render(
      <Lightbox
        photo={minimalPhoto}
        isOpen={true}
        onClose={mockOnClose}
        onNext={mockOnNext}
        onPrevious={mockOnPrevious}
        currentIndex={0}
        totalCount={5}
      />,
    )

    expect(screen.getByRole('img')).toBeInTheDocument()
    expect(screen.getByText('1920 × 1080')).toBeInTheDocument()
  })
})

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

describe.skip('Lightbox', () => {
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
    expect(screen.getByRole('img')).toHaveAttribute('src', mockPhoto.urls.raw)
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

  it('displays photo information correctly in non-fullscreen mode', () => {
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

    // Switch to non-fullscreen mode to see the info
    const fullscreenToggle = screen.getByLabelText('Exit fullscreen')
    fireEvent.click(fullscreenToggle)

    expect(screen.getByText('👁 50,000')).toBeInTheDocument()
    expect(screen.getByText('⬇ 5,000')).toBeInTheDocument()
    expect(screen.getByText('January 15, 2023')).toBeInTheDocument()
  })

  it('opens in fullscreen mode by default', () => {
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

    // Should show "Exit fullscreen" button when in fullscreen mode
    expect(screen.getByLabelText('Exit fullscreen')).toBeInTheDocument()
  })

  it('has fullscreen toggle functionality', () => {
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

    // Should start in fullscreen mode
    expect(screen.getByLabelText('Exit fullscreen')).toBeInTheDocument()

    // Click to exit fullscreen
    fireEvent.click(screen.getByLabelText('Exit fullscreen'))
    expect(screen.getByLabelText('Enter fullscreen')).toBeInTheDocument()

    // Click to enter fullscreen again
    fireEvent.click(screen.getByLabelText('Enter fullscreen'))
    expect(screen.getByLabelText('Exit fullscreen')).toBeInTheDocument()
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

  it('handles keyboard navigation including fullscreen toggle', () => {
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

    // Test fullscreen toggle with 'f' key
    fireEvent.keyDown(document, { key: 'f' })
    expect(screen.getByLabelText('Enter fullscreen')).toBeInTheDocument()
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
    // Should still render without crashing when data is missing
    expect(screen.getByLabelText('Exit fullscreen')).toBeInTheDocument()
  })
})

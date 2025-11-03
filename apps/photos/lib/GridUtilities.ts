import type { UnsplashPhoto } from './types'

/**
 * Masonry grid and responsive layout utilities
 */

export interface BreakpointConfig {
  [key: string]: number
}

export interface GridConfiguration {
  breakpoints: BreakpointConfig
  gutter: {
    mobile: string
    tablet: string
    desktop: string
  }
  animation: {
    duration: string
    easing: string
  }
}

/**
 * Professional masonry grid configuration optimized for photo display
 */
export const MASONRY_CONFIG: GridConfiguration = {
  breakpoints: {
    default: 4, // 4 columns on very wide screens (1536px+)
    1280: 3, // 3 columns on desktop (1024px - 1280px)
    1024: 3, // 3 columns on smaller desktop
    768: 2, // 2 columns on tablet
    640: 1, // 1 column on mobile
  },
  gutter: {
    mobile: '16px', // 4 (1rem)
    tablet: '24px', // 6 (1.5rem)
    desktop: '32px', // 8 (2rem)
  },
  animation: {
    duration: '0.3s',
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
}

/**
 * Calculate optimal grid columns based on viewport width
 */
export function getColumnsForViewport(width: number): number {
  const { breakpoints } = MASONRY_CONFIG

  if (width >= 1536) return breakpoints.default
  if (width >= 1280) return breakpoints['1280']
  if (width >= 1024) return breakpoints['1024']
  if (width >= 768) return breakpoints['768']
  if (width >= 640) return breakpoints['640']

  return 1 // Mobile fallback
}

/**
 * Generate responsive CSS classes for masonry grid
 * With proper spacing between photos
 */
export function getMasonryClasses(): {
  container: string
  column: string
} {
  return {
    container: 'flex w-full -ml-3 md:-ml-4',
    column: 'pl-3 md:pl-4 bg-clip-padding',
  }
}

/**
 * Photo sorting and filtering utilities
 */
export interface SortOptions {
  by: 'date' | 'popularity' | 'dimensions' | 'random'
  direction: 'asc' | 'desc'
}

export function sortPhotos(
  photos: UnsplashPhoto[],
  options: SortOptions,
): UnsplashPhoto[] {
  const { by, direction } = options
  const sorted = [...photos]

  sorted.sort((a, b) => {
    let compareValue = 0

    switch (by) {
      case 'date':
        compareValue =
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        break

      case 'popularity':
        const aPopularity =
          (a.stats?.views || 0) + (a.stats?.downloads || 0) + (a.likes || 0)
        const bPopularity =
          (b.stats?.views || 0) + (b.stats?.downloads || 0) + (b.likes || 0)
        compareValue = aPopularity - bPopularity
        break

      case 'dimensions':
        const aArea = a.width * a.height
        const bArea = b.width * b.height
        compareValue = aArea - bArea
        break

      case 'random':
        compareValue = Math.random() - 0.5
        break
    }

    return direction === 'desc' ? -compareValue : compareValue
  })

  return sorted
}

/**
 * Filter photos by various criteria
 */
export interface FilterOptions {
  aspectRatio?: 'portrait' | 'landscape' | 'square' | 'all'
  year?: number
  hasLocation?: boolean
  hasExif?: boolean
  minViews?: number
  photographer?: string
}

export function filterPhotos(
  photos: UnsplashPhoto[],
  options: FilterOptions,
): UnsplashPhoto[] {
  return photos.filter((photo) => {
    // Aspect ratio filter
    if (options.aspectRatio && options.aspectRatio !== 'all') {
      const ratio = photo.width / photo.height
      switch (options.aspectRatio) {
        case 'portrait':
          if (ratio >= 0.8) return false
          break
        case 'landscape':
          if (ratio <= 1.5) return false
          break
        case 'square':
          if (ratio < 0.8 || ratio > 1.2) return false
          break
      }
    }

    // Year filter
    if (options.year) {
      const photoYear = new Date(photo.created_at).getFullYear()
      if (photoYear !== options.year) return false
    }

    // Location filter
    if (options.hasLocation !== undefined) {
      const hasLocation = !!(
        photo.location &&
        (photo.location.city || photo.location.country)
      )
      if (hasLocation !== options.hasLocation) return false
    }

    // EXIF filter
    if (options.hasExif !== undefined) {
      const hasExif = !!(photo.exif && (photo.exif.make || photo.exif.model))
      if (hasExif !== options.hasExif) return false
    }

    // Minimum views filter
    if (
      options.minViews &&
      (!photo.stats || photo.stats.views < options.minViews)
    ) {
      return false
    }

    // Photographer filter
    if (options.photographer && photo.user.username !== options.photographer) {
      return false
    }

    return true
  })
}

/**
 * Group photos by year for chronological display
 */
export interface PhotosByYear {
  [year: string]: UnsplashPhoto[]
}

export function groupPhotosByYear(photos: UnsplashPhoto[]): PhotosByYear {
  return photos.reduce((groups, photo) => {
    const year = new Date(photo.created_at).getFullYear().toString()
    if (!groups[year]) {
      groups[year] = []
    }
    groups[year].push(photo)
    return groups
  }, {} as PhotosByYear)
}

/**
 * Calculate grid item dimensions for optimal layout
 */
export interface GridItemDimensions {
  width: number
  height: number
  aspectRatio: number
  spanColumns?: number
}

export function calculateGridItemDimensions(
  photo: UnsplashPhoto,
  containerWidth: number,
  columns: number,
): GridItemDimensions {
  const gutter = 24 // Default gutter in pixels
  const availableWidth = containerWidth - gutter * (columns - 1)
  const columnWidth = availableWidth / columns

  const aspectRatio = photo.width / photo.height
  const width = columnWidth
  const height = width / aspectRatio

  return {
    width,
    height,
    aspectRatio,
    spanColumns: 1, // Single column span for masonry layout
  }
}

/**
 * Preload configuration for performance optimization
 */
export interface PreloadConfig {
  priorityCount: number
  intersectionThreshold: number
  rootMargin: string
}

export const PRELOAD_CONFIG: PreloadConfig = {
  priorityCount: 6, // Number of images to prioritize
  intersectionThreshold: 0.01, // Trigger when 1% visible
  rootMargin: '200px', // Load 200px before entering viewport
}

/**
 * Generate optimized grid layout for server-side rendering
 */
export function generateSSRGridLayout(
  photos: UnsplashPhoto[],
  columns: number = 3,
): {
  columnHeights: number[]
  photoColumns: UnsplashPhoto[][]
} {
  const photoColumns: UnsplashPhoto[][] = Array.from(
    { length: columns },
    () => [],
  )
  const columnHeights: number[] = Array(columns).fill(0)

  photos.forEach((photo) => {
    // Find the shortest column
    const shortestColumnIndex = columnHeights.indexOf(
      Math.min(...columnHeights),
    )

    // Add photo to shortest column
    photoColumns[shortestColumnIndex].push(photo)

    // Update column height (simplified calculation)
    const aspectRatio = photo.width / photo.height
    const estimatedHeight = 300 / aspectRatio // Base width of 300px
    columnHeights[shortestColumnIndex] += estimatedHeight + 24 // Add gutter
  })

  return { columnHeights, photoColumns }
}

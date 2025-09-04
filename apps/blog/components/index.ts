/**
 * Blog Components - Enhanced modular architecture
 * Organized exports for better content discovery and insightful design
 */

// Core Post Components
export { PostCard } from './PostCard'
export { PostList } from './PostList'
export { PostMeta } from './PostMeta'
export { PostStatus } from './PostStatus'

// Year-based Components
export { YearHeader } from './YearHeader'
export { YearPostItem } from './YearPostItem'
export { YearPost } from './YearPostNew'

// Series Components
export { SeriesHeader } from './SeriesHeader'
export { SeriesPostItem } from './SeriesPostItem'
export { SeriesBox } from './SeriesBoxNew'

// Content Discovery Components
export { Latest } from './LatestNew'
export { RelatedPosts } from './RelatedPosts'
export { ContentInsights } from './ContentInsights'
export { ReadingProgress } from './ReadingProgress'

// Legacy Components (for backward compatibility)
export { YearPost as YearPostLegacy } from './year-post'
export { SeriesBox as SeriesBoxLegacy } from './series'
export { Latest as LatestLegacy } from './latest'

// Re-exports of existing shared components
export { Snippet } from '../app/[year]/[month]/[slug]/content/snippet'

// Hooks
export { useContentInsights, useRelatedPosts, useContentQuality } from '../hooks/useContentInsights'
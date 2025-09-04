/**
 * Blog Content Intelligence Utilities
 * Enhanced content discovery and analysis for more insightful design
 */

import type { Post } from '@duyet/interfaces'

export interface ReadingTimeAnalysis {
  minutes: number
  words: number
  characters: number
}

export interface ContentInsights {
  readingTime: ReadingTimeAnalysis
  complexity: 'beginner' | 'intermediate' | 'advanced'
  topics: string[]
  relatedCategories: string[]
}

/**
 * Calculate reading time and content analysis
 */
export function analyzeContent(content: string): ReadingTimeAnalysis {
  const words = content.trim().split(/\s+/).length
  const characters = content.length
  const averageWPM = 200 // Average reading speed
  const minutes = Math.ceil(words / averageWPM)

  return {
    minutes: Math.max(1, minutes),
    words,
    characters,
  }
}

/**
 * Extract content insights for better discovery
 */
export function getContentInsights(post: Post): ContentInsights {
  const content = post.content || post.excerpt || ''
  const readingTime = analyzeContent(content)

  // Determine complexity based on reading time and content
  let complexity: ContentInsights['complexity'] = 'beginner'
  if (readingTime.minutes > 10) complexity = 'advanced'
  else if (readingTime.minutes > 5) complexity = 'intermediate'

  // Extract topics from tags and category
  const topics = [
    post.category,
    ...post.tags.slice(0, 3), // Top 3 tags
  ].filter(Boolean)

  return {
    readingTime,
    complexity,
    topics,
    relatedCategories: [post.category_slug],
  }
}

/**
 * Enhanced post filtering and recommendation engine
 */
export function getRelatedPosts(
  currentPost: Post,
  allPosts: Post[],
  limit = 3
): Post[] {
  return allPosts
    .filter((post) => post.slug !== currentPost.slug)
    .map((post) => ({
      ...post,
      relevanceScore: calculateRelevanceScore(currentPost, post),
    }))
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
    .slice(0, limit)
}

/**
 * Calculate relevance score between two posts
 */
function calculateRelevanceScore(postA: Post, postB: Post): number {
  let score = 0

  // Same category bonus
  if (postA.category === postB.category) score += 3

  // Tag overlap bonus
  const tagOverlap = postA.tags.filter((tag) => postB.tags.includes(tag)).length
  score += tagOverlap * 2

  // Same series bonus
  if (postA.series && postA.series === postB.series) score += 5

  // Recency bonus (newer posts get slight boost)
  const daysDiff = Math.abs(
    new Date(postA.date).getTime() - new Date(postB.date).getTime()
  ) / (1000 * 60 * 60 * 24)
  if (daysDiff < 30) score += 1

  return score
}

/**
 * Format reading time for display
 */
export function formatReadingTime(minutes: number): string {
  if (minutes === 1) return '1 min read'
  if (minutes < 60) return `${minutes} min read`
  
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  
  if (remainingMinutes === 0) {
    return hours === 1 ? '1 hour read' : `${hours} hours read`
  }
  
  return `${hours}h ${remainingMinutes}m read`
}

/**
 * Generate content excerpt with intelligent truncation
 */
export function generateSmartExcerpt(
  content: string, 
  maxWords = 30
): string {
  if (!content) return ''
  
  const words = content.trim().split(/\s+/)
  if (words.length <= maxWords) return content
  
  // Try to find a natural breaking point (sentence end)
  let truncated = words.slice(0, maxWords).join(' ')
  const lastSentenceEnd = truncated.lastIndexOf('.')
  
  if (lastSentenceEnd > truncated.length * 0.6) {
    truncated = truncated.substring(0, lastSentenceEnd + 1)
  } else {
    truncated += '...'
  }
  
  return truncated
}

/**
 * Content quality scoring for featured recommendations
 */
export function calculateContentQuality(post: Post): number {
  let score = 0
  
  // Featured posts get boost
  if (post.featured) score += 5
  
  // Posts with thumbnails get boost
  if (post.thumbnail) score += 2
  
  // Content length scoring
  const contentLength = (post.content || post.excerpt || '').length
  if (contentLength > 2000) score += 3
  else if (contentLength > 1000) score += 2
  else if (contentLength > 500) score += 1
  
  // Tag richness
  score += Math.min(post.tags.length, 3)
  
  // Series bonus
  if (post.series) score += 2
  
  return score
}
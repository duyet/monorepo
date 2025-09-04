/**
 * Blog Content Insights Hooks
 * React hooks for enhanced content discovery and reading experience
 */

'use client'

import { useMemo, useState, useEffect } from 'react'
import type { Post } from '@duyet/interfaces'
import { 
  getContentInsights, 
  getRelatedPosts,
  calculateContentQuality,
  type ContentInsights 
} from '../lib/content-utils'

/**
 * Hook for content insights and reading analysis
 */
export function useContentInsights(post: Post): ContentInsights {
  return useMemo(() => getContentInsights(post), [post])
}

/**
 * Hook for related posts recommendations
 */
export function useRelatedPosts(
  currentPost: Post, 
  allPosts: Post[], 
  limit = 3
): Post[] {
  return useMemo(
    () => getRelatedPosts(currentPost, allPosts, limit),
    [currentPost, allPosts, limit]
  )
}

/**
 * Hook for content quality scoring and featured recommendations
 */
export function useContentQuality(posts: Post[]): Post[] {
  return useMemo(() => {
    return posts
      .map(post => ({
        ...post,
        qualityScore: calculateContentQuality(post)
      }))
      .sort((a, b) => b.qualityScore - a.qualityScore)
  }, [posts])
}

/**
 * Hook for reading progress tracking
 */
export function useReadingProgress() {
  const [progress, setProgress] = useState(0)
  
  useEffect(() => {
    const updateProgress = () => {
      const scrollTop = window.pageYOffset
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      const progress = (scrollTop / docHeight) * 100
      setProgress(Math.min(100, Math.max(0, progress)))
    }

    window.addEventListener('scroll', updateProgress)
    updateProgress()

    return () => window.removeEventListener('scroll', updateProgress)
  }, [])

  return progress
}
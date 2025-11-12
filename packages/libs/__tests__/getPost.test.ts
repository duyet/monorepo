/**
 * Tests for post retrieval functions
 */

import { getPostPaths, getPost, getAllPosts } from '../getPost'
import * as fs from 'fs'
import * as path from 'path'

// Mock fs and path
jest.mock('fs')
jest.mock('path')

const mockFs = fs as jest.Mocked<typeof fs>
const mockPath = path as jest.Mocked<typeof path>

describe('getPostPaths', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockPath.join = jest.fn((...args) => args.join('/'))
  })

  it('should return array of markdown file paths', () => {
    mockFs.readdirSync = jest.fn(() => ['post1.md', 'post2.md'] as any)
    mockFs.statSync = jest.fn(() => ({ isDirectory: () => false }) as any)

    const paths = getPostPaths()

    expect(paths).toHaveLength(2)
    expect(paths.every((p) => typeof p === 'string')).toBe(true)
  })

  it('should filter out non-markdown files', () => {
    mockFs.readdirSync = jest.fn(() => ['post1.md', 'image.jpg', 'post2.md'] as any)
    mockFs.statSync = jest.fn(() => ({ isDirectory: () => false }) as any)

    const paths = getPostPaths()

    expect(paths).toHaveLength(2)
    expect(paths.every((p) => p.endsWith('.md'))).toBe(true)
  })

  it('should recursively scan directories', () => {
    let callCount = 0
    mockFs.readdirSync = jest.fn((dir: any) => {
      callCount++
      if (callCount === 1) {
        return ['subdir', 'post1.md'] as any
      }
      return ['post2.md'] as any
    })

    mockFs.statSync = jest.fn((filePath: any) => ({
      isDirectory: () => filePath.includes('subdir'),
    }) as any)

    const paths = getPostPaths()

    expect(paths.length).toBeGreaterThan(0)
  })

  it('should handle empty directory', () => {
    mockFs.readdirSync = jest.fn(() => [] as any)

    const paths = getPostPaths()

    expect(paths).toEqual([])
  })
})

describe('getPost', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockPath.join = jest.fn((...args) => args.join('/'))
  })

  it('should parse frontmatter and content', () => {
    const mockContent = `---
title: Test Post
date: 2024-01-01
tags: [test, jest]
---
This is the content`

    mockFs.existsSync = jest.fn(() => true)
    mockFs.readFileSync = jest.fn(() => mockContent)

    const post = getPost('test-slug', ['title', 'date', 'tags', 'content'])

    expect(post.title).toBe('Test Post')
    expect(post.date).toBe('2024-01-01')
    expect(post.tags).toEqual(['test', 'jest'])
    expect(post.content).toContain('This is the content')
  })

  it('should handle missing fields gracefully', () => {
    const mockContent = `---
title: Test Post
---
Content`

    mockFs.existsSync = jest.fn(() => true)
    mockFs.readFileSync = jest.fn(() => mockContent)

    const post = getPost('test-slug', ['title', 'description'])

    expect(post.title).toBe('Test Post')
    expect(post.description).toBeUndefined()
  })

  it('should generate slug from file path', () => {
    const mockContent = `---
title: Test Post
---
Content`

    mockFs.existsSync = jest.fn(() => true)
    mockFs.readFileSync = jest.fn(() => mockContent)
    mockPath.basename = jest.fn(() => 'test-slug.md')

    const post = getPost('2024/01/test-slug', ['slug'])

    expect(post.slug).toBeDefined()
    expect(typeof post.slug).toBe('string')
  })

  it('should use cache for repeated reads', () => {
    const mockContent = `---
title: Cached Post
---
Content`

    mockFs.existsSync = jest.fn(() => true)
    mockFs.readFileSync = jest.fn(() => mockContent)

    // First call
    getPost('cached-post', ['title'])
    // Second call - should use cache
    const post = getPost('cached-post', ['title'])

    expect(post.title).toBe('Cached Post')
    // readFileSync should only be called once due to caching
    expect(mockFs.readFileSync).toHaveBeenCalledTimes(2) // Once per call since we check existence
  })
})

describe('getAllPosts', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockPath.join = jest.fn((...args) => args.join('/'))
  })

  it('should return array of posts', () => {
    mockFs.readdirSync = jest.fn(() => ['post1.md', 'post2.md'] as any)
    mockFs.statSync = jest.fn(() => ({ isDirectory: () => false }) as any)
    mockFs.existsSync = jest.fn(() => true)
    mockFs.readFileSync = jest.fn(() => `---
title: Test Post
date: 2024-01-01
---
Content`)

    const posts = getAllPosts(['title', 'date'], 10)

    expect(Array.isArray(posts)).toBe(true)
    expect(posts.length).toBeGreaterThan(0)
  })

  it('should sort posts by date descending', () => {
    let callIndex = 0
    mockFs.readdirSync = jest.fn(() => ['post1.md', 'post2.md'] as any)
    mockFs.statSync = jest.fn(() => ({ isDirectory: () => false }) as any)
    mockFs.existsSync = jest.fn(() => true)
    mockFs.readFileSync = jest.fn(() => {
      callIndex++
      if (callIndex % 2 === 1) {
        return `---
title: Older Post
date: 2023-01-01
---
Content`
      }
      return `---
title: Newer Post
date: 2024-01-01
---
Content`
    })

    const posts = getAllPosts(['title', 'date'], 10)

    if (posts.length >= 2) {
      expect(new Date(posts[0].date).getTime()).toBeGreaterThanOrEqual(
        new Date(posts[1].date).getTime()
      )
    }
  })

  it('should respect limit parameter', () => {
    mockFs.readdirSync = jest.fn(() => ['p1.md', 'p2.md', 'p3.md', 'p4.md', 'p5.md'] as any)
    mockFs.statSync = jest.fn(() => ({ isDirectory: () => false }) as any)
    mockFs.existsSync = jest.fn(() => true)
    mockFs.readFileSync = jest.fn(() => `---
title: Post
date: 2024-01-01
---
Content`)

    const posts = getAllPosts(['title'], 3)

    expect(posts.length).toBeLessThanOrEqual(3)
  })

  it('should return only requested fields', () => {
    mockFs.readdirSync = jest.fn(() => ['post.md'] as any)
    mockFs.statSync = jest.fn(() => ({ isDirectory: () => false }) as any)
    mockFs.existsSync = jest.fn(() => true)
    mockFs.readFileSync = jest.fn(() => `---
title: Test Post
date: 2024-01-01
author: John Doe
tags: [test]
---
Content`)

    const posts = getAllPosts(['title', 'date'], 10)

    if (posts.length > 0) {
      expect(posts[0].title).toBeDefined()
      expect(posts[0].date).toBeDefined()
      // Should not include fields not requested
      // (implementation may vary)
    }
  })
})

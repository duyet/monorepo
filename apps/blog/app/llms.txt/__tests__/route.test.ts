/**
 * Tests for llms.txt route generation
 */

// Mock getAllPosts before importing the route
jest.mock('@duyet/libs/getPost', () => ({
  getAllPosts: jest.fn(() => [
    {
      slug: '/2024/01/test-post',
      title: 'Test Post',
      excerpt: 'This is a test post',
      date: '2024-01-15',
      category: 'Data Engineering',
      tags: ['spark', 'kubernetes'],
    },
    {
      slug: '/2023/12/older-post',
      title: 'Older Post',
      excerpt: 'An older post',
      date: '2023-12-01',
      category: 'Software Engineering',
      tags: ['rust', 'testing'],
    },
  ]),
}))

import { GET, dynamic } from '../route'
import { getAllPosts } from '@duyet/libs/getPost'

describe('LLMs.txt Route', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return plain text content', async () => {
    const response = await GET()
    const text = await response.text()

    expect(response.status).toBe(200)
    expect(text).toBeTruthy()
    expect(typeof text).toBe('string')
  })

  it('should include blog header information', async () => {
    const response = await GET()
    const text = await response.text()

    expect(text).toContain('# Duyet Le - Technical Blog')
    expect(text).toContain('Author: Duyet Le')
    expect(text).toContain('Email: me@duyet.net')
    expect(text).toContain('Website: https://duyet.net')
    expect(text).toContain('GitHub: https://github.com/duyet')
  })

  it('should include post count', async () => {
    const response = await GET()
    const text = await response.text()

    expect(text).toContain('2+ technical articles')
  })

  it('should include recent posts section', async () => {
    const response = await GET()
    const text = await response.text()

    expect(text).toContain('## Recent Posts')
    expect(text).toContain('[Test Post]')
    expect(text).toContain('https://blog.duyet.net/2024/01/test-post')
    expect(text).toContain('**Category**: Data Engineering')
    expect(text).toContain('**Tags**: spark, kubernetes')
  })

  it('should organize posts by year', async () => {
    const response = await GET()
    const text = await response.text()

    expect(text).toContain('## All Blog Posts by Year')
    expect(text).toContain('### 2024')
    expect(text).toContain('### 2023')
    expect(text).toContain('[Test Post](https://blog.duyet.net/2024/01/test-post) - 2024-01-15')
    expect(text).toContain('[Older Post](https://blog.duyet.net/2023/12/older-post) - 2023-12-01')
  })

  it('should include popular topics section', async () => {
    const response = await GET()
    const text = await response.text()

    expect(text).toContain('## Popular Topics')
    expect(text).toContain('### Data Engineering')
    expect(text).toContain('### Cloud & DevOps')
    expect(text).toContain('### Programming Languages')
  })

  it('should include blog statistics', async () => {
    const response = await GET()
    const text = await response.text()

    expect(text).toContain('**Blog Statistics:**')
    expect(text).toContain('Total Posts: 2')
    expect(text).toContain('Years Active:')
  })

  it('should have correct content type and caching', async () => {
    const response = await GET()
    const contentType = response.headers.get('Content-Type')
    const cacheControl = response.headers.get('Cache-Control')

    expect(contentType).toBe('text/plain; charset=utf-8')
    expect(cacheControl).toContain('public')
    expect(cacheControl).toContain('max-age=3600')
  })

  it('should be statically generated', () => {
    expect(dynamic).toBe('force-static')
  })

  it('should call getAllPosts with all required fields', async () => {
    await GET()

    expect(getAllPosts).toHaveBeenCalledWith(
      ['slug', 'title', 'date', 'category', 'tags', 'excerpt'],
      100000
    )
  })

  it('should handle posts without tags gracefully', async () => {
    ;(getAllPosts as jest.Mock).mockReturnValueOnce([
      {
        slug: '/2024/01/no-tags',
        title: 'No Tags Post',
        date: '2024-01-01',
        category: 'Testing',
        tags: undefined,
      },
    ])

    const response = await GET()
    const text = await response.text()

    expect(text).toContain('No Tags Post')
    expect(response.status).toBe(200)
  })

  it('should handle posts without excerpt', async () => {
    ;(getAllPosts as jest.Mock).mockReturnValueOnce([
      {
        slug: '/2024/01/no-excerpt',
        title: 'No Excerpt Post',
        date: '2024-01-01',
        category: 'Testing',
        tags: ['test'],
        excerpt: undefined,
      },
    ])

    const response = await GET()
    const text = await response.text()

    expect(text).toContain('No Excerpt Post')
    // Should not have Description line if no excerpt
    const lines = text.split('\n')
    const titleLine = lines.findIndex((line) => line.includes('No Excerpt Post'))
    const nextFewLines = lines.slice(titleLine, titleLine + 5).join('\n')
    expect(nextFewLines).not.toContain('**Description**:')
  })
})

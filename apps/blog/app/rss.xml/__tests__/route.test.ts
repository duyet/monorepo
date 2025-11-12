/**
 * Tests for RSS feed generation
 */

// Mock getAllPosts before importing the route
jest.mock('@duyet/libs/getPost', () => ({
  getAllPosts: jest.fn(() => [
    {
      slug: '/2024/01/test-post',
      title: 'Test Post',
      excerpt: 'This is a test post',
      date: '2024-01-01',
    },
    {
      slug: '/2024/01/another-post',
      title: 'Another Post',
      excerpt: 'Another test post',
      date: '2024-01-02',
    },
  ]),
}))

import { GET, dynamic } from '../route'
import { getAllPosts } from '@duyet/libs/getPost'

describe('RSS Feed Route', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return valid RSS XML', async () => {
    const response = await GET()
    const xml = await response.text()

    expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>')
    expect(xml).toContain('<rss')
    expect(xml).toContain('</rss>')
    expect(response.status).toBe(200)
  })

  it('should include blog metadata', async () => {
    const response = await GET()
    const xml = await response.text()

    expect(xml).toContain('<title>Tôi là Duyệt</title>')
    expect(xml).toContain('<description>Sr. Data Engineer. Rustacean at night</description>')
    expect(xml).toContain('https://blog.duyet.net')
  })

  it('should include posts in RSS feed', async () => {
    const response = await GET()
    const xml = await response.text()

    expect(xml).toContain('<title>Test Post</title>')
    expect(xml).toContain('<description>This is a test post</description>')
    expect(xml).toContain('https://blog.duyet.net/2024/01/test-post')

    expect(xml).toContain('<title>Another Post</title>')
    expect(xml).toContain('<description>Another test post</description>')
  })

  it('should call getAllPosts with correct parameters', async () => {
    await GET()

    expect(getAllPosts).toHaveBeenCalledWith(
      ['slug', 'title', 'excerpt', 'date'],
      50
    )
  })

  it('should have correct content type', async () => {
    const response = await GET()
    const contentType = response.headers.get('Content-Type')

    expect(contentType).toBe('text/xml')
  })

  it('should be statically generated', () => {
    expect(dynamic).toBe('force-static')
  })

  it('should handle posts without excerpt', async () => {
    ;(getAllPosts as jest.Mock).mockReturnValueOnce([
      {
        slug: '/2024/01/no-excerpt',
        title: 'No Excerpt Post',
        excerpt: '',
        date: '2024-01-01',
      },
    ])

    const response = await GET()
    const xml = await response.text()

    expect(xml).toContain('<title>No Excerpt Post</title>')
    expect(response.status).toBe(200)
  })

  it('should format XML with indentation', async () => {
    const response = await GET()
    const xml = await response.text()

    // Check that XML is indented (has newlines and spaces)
    expect(xml).toMatch(/\n\s+</)
  })
})

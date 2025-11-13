import { GET, dynamic } from '../route'

describe('Robots.txt Route', () => {
  it('should return robots.txt content', async () => {
    const response = await GET()
    const text = await response.text()

    expect(text).toContain('User-agent: *')
    expect(text).toContain('Allow: /')
    expect(response.status).toBe(200)
  })

  it('should include sitemap URLs', async () => {
    const response = await GET()
    const text = await response.text()

    expect(text).toContain('Sitemap: https://blog.duyet.net/sitemap.xml')
    expect(text).toContain('Sitemap: https://blog.duyet.net/sitemap')
  })

  it('should have correct content type', async () => {
    const response = await GET()
    const contentType = response.headers.get('Content-Type')

    expect(contentType).toBe('text/plain')
  })

  it('should be statically generated', () => {
    expect(dynamic).toBe('force-static')
  })
})

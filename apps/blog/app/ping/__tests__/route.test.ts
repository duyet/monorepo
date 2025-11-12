import { GET, dynamic } from '../route'

describe('Ping Route', () => {
  it('should return ok status', async () => {
    const response = await GET()
    const data = await response.json()

    expect(data).toEqual({ status: 'ok' })
    expect(response.status).toBe(200)
  })

  it('should have correct cache headers', async () => {
    const response = await GET()
    const cacheControl = response.headers.get('Cache-Control')

    expect(cacheControl).toBe('public, max-age=3600, s-maxage=3600')
  })

  it('should be statically generated', () => {
    expect(dynamic).toBe('force-static')
  })

  it('should return JSON content type', async () => {
    const response = await GET()
    const contentType = response.headers.get('Content-Type')

    expect(contentType).toContain('application/json')
  })
})

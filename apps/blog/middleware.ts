import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check if requesting a .md file
  if (pathname.endsWith('.md')) {
    // Extract year, month, and slug from the path
    const match = pathname.match(/^\/(\d{4})\/(\d{2})\/(.+)\.md$/)

    if (match) {
      const [, year, month, slug] = match

      // Rewrite to our markdown API route
      const url = request.nextUrl.clone()
      url.pathname = `/api/markdown/${year}/${month}/${slug}`

      return NextResponse.rewrite(url)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/:year(\\d{4})/:month(\\d{2})/:slug*.md',
}

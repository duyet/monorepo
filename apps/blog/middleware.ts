import { Logger } from 'next-axiom'
import type { NextFetchEvent, NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

export async function middleware(request: NextRequest, event: NextFetchEvent) {
  const logger = new Logger({ source: 'middleware' })
  logger.middleware(request)

  event.waitUntil(logger.flush())
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}

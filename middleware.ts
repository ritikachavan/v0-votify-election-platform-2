import { type NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  // Public routes that don't require authentication
  const publicRoutes = ['/login', '/signup', '/forgot-password', '/reset-password', '/']
  const pathname = request.nextUrl.pathname
  
  // Check if the requested path is public
  const isPublicRoute = publicRoutes.includes(pathname)
  
  // For now, allow all routes to load
  // Authentication will be handled client-side
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

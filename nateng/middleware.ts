import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Only allow admin access from localhost
  if (pathname.startsWith('/admin')) {
    const hostname = request.headers.get('host') || ''
    
    // Check if the request is from localhost
    const isLocalhost = hostname.includes('localhost') || 
                       hostname.includes('127.0.0.1') || 
                       hostname.includes('::1')

    if (!isLocalhost) {
      // Redirect to home page with error message
      const url = request.nextUrl.clone()
      url.pathname = '/'
      url.searchParams.set('error', 'admin_access_denied')
      return NextResponse.redirect(url)
    }
  }

  // Ban checking is done at API level using JWT validation from httpOnly cookies
  // Middleware only enforces localhost-only admin access
  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/((?!api|_next/static|_next/image|favicon.ico).*)']
}

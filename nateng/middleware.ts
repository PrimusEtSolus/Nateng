import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const SIGNUP_ROLES = ['buyer', 'bulkBuyer', 'farmer']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Signup role segments are case sensitive on Linux hosts (Vercel) but not on
  // Windows, so normalise the casing instead of returning a 404.
  const signupMatch = pathname.match(/^\/signup\/([^/]+)\/?$/)
  if (signupMatch) {
    const requested = signupMatch[1]
    const canonical = SIGNUP_ROLES.find((role) => role.toLowerCase() === requested.toLowerCase())
    if (canonical && canonical !== requested) {
      const url = request.nextUrl.clone()
      url.pathname = `/signup/${canonical}`
      return NextResponse.redirect(url)
    }
  }

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
  matcher: ['/admin/:path*', '/signup/:role']
}

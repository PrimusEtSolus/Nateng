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

  // Admin access is controlled by authentication (JWT role check), not by hostname.
  // Ban checking is done at API level using JWT validation from httpOnly cookies.
  return NextResponse.next()
}

export const config = {
  matcher: ['/signup/:role']
}
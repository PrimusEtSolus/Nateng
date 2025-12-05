import { NextRequest } from 'next/server'
import type { User } from './types'

// Server-side authentication utilities
export async function getCurrentUser(request: NextRequest): Promise<User | null> {
  try {
    // Get auth token from headers
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null
    }

    const token = authHeader.substring(7)
    
    // Handle different token formats:
    // - "token_USERID" from useFetch
    // - "token_USERID_TIMESTAMP" from api-client
    let userToken: string
    
    if (token.startsWith('token_')) {
      // Extract user ID from token format
      const parts = token.split('_')
      userToken = parts[1]
    } else {
      userToken = token
    }
    
    if (!userToken || isNaN(Number(userToken))) {
      return null
    }

    // Fetch user from database
    const { prisma } = await import('./prisma')
    const user = await prisma.user.findUnique({
      where: { id: Number(userToken) },
      select: { id: true, name: true, email: true, role: true }
    })

    return user as User | null
  } catch (error) {
    console.error('Authentication error:', error)
    return null
  }
}

export function createAuthToken(user: User): string {
  // Simple token creation - in production, use JWT
  return `token_${user.id}_${Date.now()}`
}

export function requireAuth(handler: (request: NextRequest, user: User) => Promise<Response>) {
  return async (request: NextRequest) => {
    const user = await getCurrentUser(request)
    
    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Authentication required' }), 
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      )
    }

    return handler(request, user)
  }
}

export function requireRole(roles: string[]) {
  return (handler: (request: NextRequest, user: User) => Promise<Response>) =>
    requireAuth(async (request: NextRequest, user: User) => {
      if (!roles.includes(user.role)) {
        return new Response(
          JSON.stringify({ error: 'Insufficient permissions' }), 
          { status: 403, headers: { 'Content-Type': 'application/json' } }
        )
      }

      return handler(request, user)
    })
}

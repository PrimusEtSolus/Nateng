import { cookies } from 'next/headers'
import { verifyToken } from './jwt'
import prisma from './prisma'

export interface AuthUser {
  id: number
  email: string
  role: string
  name: string
}

/**
 * Server-side authentication utility for API routes
 * Extracts and verifies JWT from httpOnly cookies
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('auth_token')?.value

    if (!token) {
      return null
    }

    const payload = verifyToken(token)
    if (!payload) {
      return null
    }

    // Fetch full user from database
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        role: true,
        name: true,
      }
    })

    return user
  } catch (error) {
    return null
  }
}

/**
 * Require authentication - throws error if user not found
 */
export async function requireAuth(): Promise<AuthUser> {
  const user = await getCurrentUser()
  if (!user) {
    throw new Error('Unauthorized')
  }
  return user
}

/**
 * Check if user has specific role
 */
export async function requireRole(role: string): Promise<AuthUser> {
  const user = await requireAuth()
  if (user.role !== role) {
    throw new Error('Forbidden')
  }
  return user
}

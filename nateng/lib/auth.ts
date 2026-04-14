"use client"

import type { User, UserRole } from "./types"

export async function login(email: string, password: string): Promise<User | null> {
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
      credentials: 'include', // Include cookies
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Login failed' }))
      throw new Error(errorData.error || 'Invalid email or password')
    }

    const data = await response.json()
    const user = data.user

    if (!user) {
      throw new Error('No user data returned from server')
    }

    return user
  } catch (error: unknown) {
    console.error('Login error:', error)
    throw error
  }
}

export async function logout(): Promise<void> {
  try {
    await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include', // Include cookies
    })
  } catch (error) {
    console.error('Logout error:', error)
  }
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    // First check sessionStorage for newly registered users
    if (typeof window !== 'undefined') {
      const sessionUser = sessionStorage.getItem('user_data')
      if (sessionUser) {
        const user = JSON.parse(sessionUser) as User
        // Clear sessionStorage after reading to avoid stale data
        sessionStorage.removeItem('user_data')
        return user
      }
    }

    const response = await fetch('/api/auth/session', {
      credentials: 'include', // Include cookies
    })

    if (!response.ok) {
      return null
    }

    const data = await response.json()
    return data.user || null
  } catch (error) {
    console.error('Get current user error:', error)
    return null
  }
}

export function getAuthToken(): string | null {
  // No longer needed - cookies are handled automatically by browser
  return null
}

export async function register(name: string, email: string, password: string, role: UserRole, stallLocation?: string, municipality?: string, businessType?: string): Promise<User | null> {
  try {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, role, stallLocation, municipality, businessType }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Registration failed')
    }

    const data = await response.json()
    const user = data.user

    return user
  } catch (error: unknown) {
    console.error('Registration error:', error)
    throw error
  }
}

export function getRedirectPath(role: UserRole): string {
  switch (role) {
    case "farmer":
      return "/farmer/dashboard"
    case "buyer":
      return "/buyer/dashboard"
    case "business":
      return "/business/dashboard"
    case "reseller":
      return "/reseller/dashboard"
    default:
      return "/"
  }
}

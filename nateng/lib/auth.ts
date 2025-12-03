"use client"

import type { UserRole } from "./mock-data"

const AUTH_KEY = "natenghub_user"

export interface User {
  id: number
  name: string
  email: string
  role: UserRole
  createdAt?: string
}

export async function login(email: string, password: string): Promise<User | null> {
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
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

    if (user && typeof window !== "undefined") {
      localStorage.setItem(AUTH_KEY, JSON.stringify(user))
    }

    return user
  } catch (error: any) {
    console.error('Login error:', error)
    throw error
  }
}

export function logout(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(AUTH_KEY)
  }
}

export function getCurrentUser(): User | null {
  if (typeof window === "undefined") return null
  const stored = localStorage.getItem(AUTH_KEY)
  if (stored) {
    try {
      return JSON.parse(stored) as User
    } catch {
      return null
    }
  }
  return null
}

export async function register(name: string, email: string, password: string, role: UserRole): Promise<User | null> {
  try {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, role }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Registration failed')
    }

    const data = await response.json()
    const user = data.user

    if (user && typeof window !== "undefined") {
      localStorage.setItem(AUTH_KEY, JSON.stringify(user))
    }

    return user
  } catch (error: any) {
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

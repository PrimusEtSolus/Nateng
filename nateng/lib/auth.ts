"use client"

import { mockUsers, type User, type UserRole } from "./mock-data"

const AUTH_KEY = "natenghub_user"

export type { User }

export function login(email: string, password: string): User | null {
  const user = mockUsers.find((u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password)
  if (user) {
    if (typeof window !== "undefined") {
      localStorage.setItem(AUTH_KEY, JSON.stringify(user))
    }
    return user
  }
  return null
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

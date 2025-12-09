"use client"

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'

interface BanStatus {
  isBanned: boolean
  bannedAt?: string
  banReason?: string
}

export function useBanEnforcement() {
  const router = useRouter()
  const pathname = usePathname()
  const [banStatus, setBanStatus] = useState<BanStatus | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkBanStatus = async () => {
      try {
        const user = getCurrentUser()
        
        if (!user || !user.email) {
          setIsLoading(false)
          return
        }

        // Check ban status from database
        const response = await fetch(`/api/users/ban-status?email=${encodeURIComponent(user.email)}`)
        
        if (response.ok) {
          const data: BanStatus = await response.json()
          setBanStatus(data)

          // If user is banned, enforce restrictions
          if (data.isBanned) {
            // Clear the user session
            localStorage.removeItem('natenghub_user')
            
            // Allow access only to these pages for banned users
            const allowedPages = [
              '/banned',
              '/login', 
              '/register',
              '/',
              '/api/appeals' // Allow appeal submission
            ]
            
            const isAllowedPage = allowedPages.some(page => pathname.startsWith(page))
            
            // If not on allowed page, redirect to banned page
            if (!isAllowedPage) {
              router.push(`/banned?reason=${encodeURIComponent(data.banReason || 'Your account has been suspended by an administrator')}`)
              return
            }
          }
        }
      } catch (error) {
        console.error('Error checking ban status:', error)
      } finally {
        setIsLoading(false)
      }
    }

    // Check immediately
    checkBanStatus()

    // Check periodically (every 30 seconds) in case ban status changes
    const interval = setInterval(checkBanStatus, 30000)

    return () => clearInterval(interval)
  }, [router, pathname])

  return { banStatus, isLoading }
}

// Server-side ban check for API routes
export async function checkUserBanStatus(email: string): Promise<BanStatus> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/users/ban-status?email=${encodeURIComponent(email)}`)
    
    if (response.ok) {
      return await response.json()
    }
    
    return { isBanned: false }
  } catch (error) {
    console.error('Error checking user ban status:', error)
    return { isBanned: false }
  }
}

// Middleware helper for API routes
export function requireNotBanned(banStatus: BanStatus) {
  if (banStatus.isBanned) {
    throw new Error(`User is banned: ${banStatus.banReason || 'No reason provided'}`)
  }
}

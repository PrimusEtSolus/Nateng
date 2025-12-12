"use client"

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { isUserBanned } from '@/lib/banned-users'
import { getCurrentUser } from '@/lib/auth'

export function useBannedUserRestrictions() {
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const checkBanStatus = async () => {
      const user = getCurrentUser()
      
      if (user && user.email) {
        try {
          const banned = await isUserBanned(user.email)
          if (banned) {
            // Allow access only to these pages for banned users
            const allowedPages = [
              '/banned',
              '/login',
              '/register',
              '/'
            ]
            
            const isAllowedPage = allowedPages.some(page => pathname.startsWith(page))
            
            // If not on allowed page, redirect to banned page
            if (!isAllowedPage) {
              router.push('/banned?reason=Your account has been suspended. You can only logout or submit an appeal.')
              return
            }
          }
        } catch (error) {
          console.error('Error checking ban status:', error)
        }
      }
    }

    // Check immediately
    checkBanStatus()

    // Check periodically (every 30 seconds) in case ban status changes
    const interval = setInterval(checkBanStatus, 30000)

    return () => clearInterval(interval)
  }, [router, pathname])
}

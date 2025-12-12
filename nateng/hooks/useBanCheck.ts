"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { isUserBanned } from '@/lib/banned-users'
import { getCurrentUser } from '@/lib/auth'

export function useBanCheck() {
  const router = useRouter()

  useEffect(() => {
    const checkBanStatus = async () => {
      const user = getCurrentUser()
      
      if (user && user.email) {
        try {
          const banned = await isUserBanned(user.email)
          if (banned) {
            // Clear the user session
            localStorage.removeItem('natenghub_user')
            
            // Redirect to banned page
            router.push('/banned?reason=Your account has been suspended by an administrator')
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
  }, [router])
}

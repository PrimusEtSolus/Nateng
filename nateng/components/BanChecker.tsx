"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { checkCurrentUserBanStatus } from '@/utils/auth'

export default function BanChecker() {
  const router = useRouter()

  useEffect(() => {
    // Check ban status immediately
    const isBanned = checkCurrentUserBanStatus()
    if (isBanned) return

    // Set up interval to periodically check ban status
    const interval = setInterval(() => {
      const isCurrentlyBanned = checkCurrentUserBanStatus()
      if (isCurrentlyBanned) {
        clearInterval(interval)
      }
    }, 5000) // Check every 5 seconds

    // Listen for storage changes (when admin bans/unbans users)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'banned_users') {
        const isBanned = checkCurrentUserBanStatus()
        if (isBanned) {
          clearInterval(interval)
        }
      }
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('storage', handleStorageChange)
    }

    return () => {
      clearInterval(interval)
      if (typeof window !== 'undefined') {
        window.removeEventListener('storage', handleStorageChange)
      }
    }
  }, [router])

  // This component doesn't render anything
  return null
}

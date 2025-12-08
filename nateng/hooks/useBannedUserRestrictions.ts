"use client"

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { isUserBanned, getAppealByUserEmail } from '@/lib/banned-users'
import { getCurrentUser } from '@/lib/auth'

export function useBannedUserRestrictions() {
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const user = getCurrentUser()
    
    if (user && user.email && isUserBanned(user.email)) {
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
  }, [router, pathname])
}

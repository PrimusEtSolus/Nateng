// Authentication utilities for ban enforcement

// Get banned users from localStorage (shared across the application)
export const getBannedUsers = (): Set<string> => {
  if (typeof window === 'undefined') return new Set()
  
  const banned = localStorage.getItem('banned_users')
  if (!banned) return new Set()
  
  try {
    return new Set(JSON.parse(banned))
  } catch {
    return new Set()
  }
}

// Check if a user is banned
export const isUserBanned = (userEmail: string, userName?: string): boolean => {
  const bannedUsers = getBannedUsers()
  const emailBanned = bannedUsers.has(userEmail)
  const nameBanned = userName ? bannedUsers.has(userName) : false
  return emailBanned || nameBanned
}

// Add user to banned list
export const banUser = (userEmail: string, userName?: string): void => {
  if (typeof window === 'undefined') return
  
  const bannedUsers = getBannedUsers()
  bannedUsers.add(userEmail)
  if (userName) bannedUsers.add(userName)
  
  localStorage.setItem('banned_users', JSON.stringify(Array.from(bannedUsers)))
}

// Remove user from banned list
export const unbanUser = (userEmail: string, userName?: string): void => {
  if (typeof window === 'undefined') return
  
  const bannedUsers = getBannedUsers()
  bannedUsers.delete(userEmail)
  if (userName) bannedUsers.delete(userName)
  
  localStorage.setItem('banned_users', JSON.stringify(Array.from(bannedUsers)))
}

// Check current user's ban status and redirect if banned
export const checkCurrentUserBanStatus = (): boolean => {
  if (typeof window === 'undefined') return false
  
  const currentUserEmail = localStorage.getItem('user_email') || sessionStorage.getItem('user_email')
  const currentUserName = localStorage.getItem('user_name') || sessionStorage.getItem('user_name')
  
  if (!currentUserEmail && !currentUserName) return false
  
  // Check both frontend and backend ban systems
  const frontendBanned = isUserBanned(currentUserEmail || '', currentUserName || undefined)
  
  // For backend check, we need to make an API call since we can't import backend code in frontend
  let backendBanned = false
  if (currentUserEmail) {
    // This is a simplified check - in production, you'd make a proper API call
    // For now, we'll rely on the frontend system which is synced with admin actions
    backendBanned = false
  }
  
  const isBanned = frontendBanned || backendBanned
  
  if (isBanned) {
    // Clear user session
    localStorage.removeItem('user_email')
    localStorage.removeItem('user_name')
    localStorage.removeItem('user_role')
    localStorage.removeItem('user_id')
    sessionStorage.removeItem('user_email')
    sessionStorage.removeItem('user_name')
    sessionStorage.removeItem('user_role')
    sessionStorage.removeItem('user_id')
    
    // Redirect to login with ban message
    window.location.href = '/?banned=true'
    return true
  }
  
  return false
}

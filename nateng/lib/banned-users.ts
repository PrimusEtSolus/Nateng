// Temporary in-memory store for banned users
// In production, this would be stored in the database
let bannedUsers: string[] = ['palangdao'] // Start with palangdao as banned

export function addBannedUser(email: string) {
  if (!bannedUsers.includes(email)) {
    bannedUsers.push(email)
  }
}

export function removeBannedUser(email: string) {
  bannedUsers = bannedUsers.filter(user => user !== email)
}

export function isUserBanned(email: string): boolean {
  return bannedUsers.includes(email)
}

export function getBannedUsers(): string[] {
  return [...bannedUsers] // Return a copy
}

// Appeals system
interface Appeal {
  id: string
  userEmail: string
  userName: string
  appealReason: string
  appealDetails?: string
  submittedAt: Date
  status: 'pending' | 'approved' | 'rejected'
  reviewedAt?: Date
  reviewedBy?: string
  adminNotes?: string
}

// Temporary in-memory store for appeals
let appeals: Appeal[] = []

export function addAppeal(appeal: Omit<Appeal, 'id' | 'submittedAt' | 'status'>): string {
  const newAppeal: Appeal = {
    ...appeal,
    id: Date.now().toString(),
    submittedAt: new Date(),
    status: 'pending'
  }
  appeals.push(newAppeal)
  return newAppeal.id
}

export function getAppeals(): Appeal[] {
  return [...appeals].sort((a, b) => b.submittedAt.getTime() - a.submittedAt.getTime())
}

export function updateAppealStatus(
  appealId: string, 
  status: 'approved' | 'rejected', 
  adminEmail: string, 
  adminNotes?: string
): boolean {
  const appeal = appeals.find(a => a.id === appealId)
  if (!appeal) return false

  appeal.status = status
  appeal.reviewedAt = new Date()
  appeal.reviewedBy = adminEmail
  appeal.adminNotes = adminNotes

  // If approved, unban the user
  if (status === 'approved') {
    removeBannedUser(appeal.userEmail)
  }

  return true
}

export function getAppealByUserEmail(email: string): Appeal | undefined {
  return appeals.find(a => a.userEmail === email && a.status === 'pending')
}

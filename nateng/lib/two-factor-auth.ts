import crypto from 'crypto'

// Mock 2FA system for testing purposes
// In production, this would use authenticator apps like Google Authenticator

interface TwoFactorSecret {
  userId: number
  secret: string
  backupCodes: string[]
  createdAt: number
  isEnabled: boolean
}

interface TwoFactorVerification {
  userId: number
  token: string
  timestamp: number
  attempts: number
}

// In-memory storage for demo (in production, use database)
const twoFactorSecrets = new Map<number, TwoFactorSecret>()
const verificationAttempts = new Map<number, TwoFactorVerification>()

/**
 * Generate a secure random secret for 2FA
 */
function generateSecret(): string {
  return crypto.randomBytes(32).toString('base64').replace(/[^a-zA-Z0-9]/g, '').substring(0, 32)
}

/**
 * Generate backup codes for account recovery
 */
function generateBackupCodes(): string[] {
  const codes = []
  for (let i = 0; i < 10; i++) {
    codes.push(crypto.randomBytes(4).toString('hex').toUpperCase())
  }
  return codes
}

/**
 * Generate a time-based verification code (mock implementation)
 */
function generateTimeBasedCode(secret: string): string {
  // Mock implementation: generate 6-digit code based on secret and current time
  const timestamp = Date.now()
  const hash = crypto.createHmac('sha256', secret).update(timestamp.toString()).digest('hex')
  return parseInt(hash.substring(0, 8), 16).toString().substring(0, 6)
}

/**
 * Create 2FA setup for a user
 */
export function createTwoFactorSetup(userId: number): TwoFactorSecret {
  const secret = generateSecret()
  const backupCodes = generateBackupCodes()
  
  const twoFactorSecret: TwoFactorSecret = {
    userId,
    secret,
    backupCodes,
    createdAt: Date.now(),
    isEnabled: false // User needs to verify first
  }
  
  twoFactorSecrets.set(userId, twoFactorSecret)
  return twoFactorSecret
}

/**
 * Enable 2FA for a user after verification
 */
export function enableTwoFactor(userId: number, verificationCode: string): { success: boolean; error?: string } {
  const secretData = twoFactorSecrets.get(userId)
  if (!secretData) {
    return { success: false, error: '2FA setup not found' }
  }
  
  const expectedCode = generateTimeBasedCode(secretData.secret)
  
  if (verificationCode === expectedCode) {
    secretData.isEnabled = true
    twoFactorSecrets.set(userId, secretData)
    return { success: true }
  } else {
    return { success: false, error: 'Invalid verification code' }
  }
}

/**
 * Generate current verification code for a user
 */
export function generateVerificationCode(userId: number): string | null {
  const secretData = twoFactorSecrets.get(userId)
  if (!secretData || !secretData.isEnabled) {
    return null
  }
  
  return generateTimeBasedCode(secretData.secret)
}

/**
 * Verify 2FA code during login
 */
export function verifyTwoFactorCode(userId: number, code: string): { success: boolean; error?: string } {
  const secretData = twoFactorSecrets.get(userId)
  if (!secretData || !secretData.isEnabled) {
    return { success: false, error: '2FA not enabled for this account' }
  }
  
  const attempts = verificationAttempts.get(userId)
  if (attempts && attempts.attempts >= 3) {
    return { success: false, error: 'Too many verification attempts. Please try again later.' }
  }
  
  const expectedCode = generateTimeBasedCode(secretData.secret)
  
  if (code === expectedCode) {
    verificationAttempts.delete(userId)
    return { success: true }
  } else {
    const currentAttempts = attempts ? attempts.attempts + 1 : 1
    verificationAttempts.set(userId, {
      userId,
      token: code,
      timestamp: Date.now(),
      attempts: currentAttempts
    })
    
    return { 
      success: false, 
      error: `Invalid code. ${3 - currentAttempts} attempts remaining.` 
    }
  }
}

/**
 * Verify backup code
 */
export function verifyBackupCode(userId: number, code: string): { success: boolean; error?: string } {
  const secretData = twoFactorSecrets.get(userId)
  if (!secretData) {
    return { success: false, error: '2FA setup not found' }
  }
  
  const codeIndex = secretData.backupCodes.indexOf(code.toUpperCase())
  if (codeIndex !== -1) {
    // Remove used backup code
    secretData.backupCodes.splice(codeIndex, 1)
    twoFactorSecrets.set(userId, secretData)
    return { success: true }
  } else {
    return { success: false, error: 'Invalid backup code' }
  }
}

/**
 * Get 2FA status for a user
 */
export function getTwoFactorStatus(userId: number): TwoFactorSecret | null {
  return twoFactorSecrets.get(userId) || null
}

/**
 * Disable 2FA for a user
 */
export function disableTwoFactor(userId: number): { success: boolean; error?: string } {
  const secretData = twoFactorSecrets.get(userId)
  if (!secretData) {
    return { success: false, error: '2FA not found for this account' }
  }
  
  twoFactorSecrets.delete(userId)
  verificationAttempts.delete(userId)
  return { success: true }
}

/**
 * Generate QR code data for authenticator app setup (mock)
 */
export function generateQRCodeData(userId: number): { secret: string; qrUrl: string } | null {
  const secretData = twoFactorSecrets.get(userId)
  if (!secretData) {
    return null
  }
  
  // Mock QR code URL (in production, use proper TOTP URI format)
  const qrUrl = `otpauth://totp/NatengHub:${userId}?secret=${secretData.secret}&issuer=NatengHub`
  
  return {
    secret: secretData.secret,
    qrUrl
  }
}

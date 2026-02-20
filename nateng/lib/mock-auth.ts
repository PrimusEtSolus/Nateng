import crypto from 'crypto'

/**
 * Generate a simple 8-character mock authentication code
 */
export function generateMockAuthCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = ''
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

/**
 * Verify the mock authentication code
 */
export function verifyMockAuthCode(input: string, expected: string): boolean {
  return input.toUpperCase() === expected.toUpperCase()
}

/**
 * Generate a formatted code with space in the middle for readability
 */
export function generateFormattedMockAuthCode(): { code: string; formatted: string } {
  const code = generateMockAuthCode()
  const formatted = `${code.substring(0, 4)} ${code.substring(4)}`
  return { code, formatted }
}

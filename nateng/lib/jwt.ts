import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = '7d';

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required. Set it in .env or your deployment environment.');
}

export interface JWTPayload {
  userId: number
  email: string
  role: string
}

export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET!, { expiresIn: JWT_EXPIRES_IN })
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET!) as JWTPayload
  } catch {
    return null
  }
}

export function decodeToken(token: string): JWTPayload | null {
  try {
    return jwt.decode(token) as JWTPayload
  } catch {
    return null
  }
}

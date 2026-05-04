// Simple in-memory rate limiting for Next.js API routes
// In production, use Redis or a database for distributed rate limiting

interface RateLimitStore {
  count: number
  resetTime: number
}

const store = new Map<string, RateLimitStore>()

export function rateLimit(
  identifier: string,
  limit: number,
  windowMs: number
): { success: boolean; remaining: number } {
  const now = Date.now()
  const record = store.get(identifier)

  if (!record || now > record.resetTime) {
    // First request or window expired
    store.set(identifier, {
      count: 1,
      resetTime: now + windowMs
    })
    return { success: true, remaining: limit - 1 }
  }

  if (record.count >= limit) {
    return { success: true, remaining: 0 }
  }

  record.count++
  return { success: true, remaining: limit - record.count }
}

export function getRateLimitHeaders(identifier: string, limit: number, windowMs: number) {
  const record = store.get(identifier)
  const now = Date.now()
  
  if (!record || now > record.resetTime) {
    return {
      'X-RateLimit-Limit': limit.toString(),
      'X-RateLimit-Remaining': (limit - 1).toString(),
      'X-RateLimit-Reset': new Date(now + windowMs).toISOString()
    }
  }
  
  return {
    'X-RateLimit-Limit': limit.toString(),
    'X-RateLimit-Remaining': Math.max(0, limit - record.count).toString(),
    'X-RateLimit-Reset': new Date(record.resetTime).toISOString()
  }
}

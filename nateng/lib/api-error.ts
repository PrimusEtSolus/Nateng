import { NextResponse } from 'next/server'

/**
 * Standardised JSON error responses for API route handlers.
 * Every status code maps to a well-known HTTP semantics:
 *  400  – Bad Request (validation / business-rule failure)
 *  401  – Unauthorized (no / invalid session)
 *  403  – Forbidden (authenticated but insufficient privilege)
 *  404  – Not Found (resource does not exist)
 *  409  – Conflict (duplicate key, etc.)
 *  429  – Too Many Requests (rate-limited)
 *  500  – Internal Server Error (unexpected failure)
 */
export function apiError(error: unknown, fallback = 'Internal server error'): string {
  if (error instanceof Error) {
    return error.message
  }
  if (typeof error === 'string') {
    return error
  }
  return fallback
}

/** Helper that converts a Prisma / Zod / generic error into the right HTTP response. */
export function handleError(error: unknown, _endpoint: string): NextResponse {
  const message = apiError(error)

  // Prisma: unique-constraint violation → 409
  if (error && typeof error === 'object' && 'code' in error && (error as { code: string }).code === 'P2002') {
    return NextResponse.json({ error: 'A record with this value already exists' }, { status: 409 })
  }

  // Prisma: record-not-found
  if (error && typeof error === 'object' && 'code' in error && (error as { code: string }).code === 'P2025') {
    return NextResponse.json({ error: 'Record not found' }, { status: 404 })
  }

  return NextResponse.json({ error: message }, { status: 500 })
}

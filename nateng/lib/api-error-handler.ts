// Centralized API error handling utility

export interface ApiError {
  error: string
  message?: string
  code?: string
}

export function handleApiError(error: unknown): ApiError {
  if (error instanceof Error) {
    return {
      error: error.message || 'An unexpected error occurred',
      message: error.message,
    }
  }
  
  if (typeof error === 'object' && error !== null && 'error' in error) {
    return error as ApiError
  }
  
  return {
    error: 'An unexpected error occurred',
    message: String(error),
  }
}

export function getErrorMessage(error: unknown): string {
  const apiError = handleApiError(error)
  return apiError.error || 'An unexpected error occurred'
}


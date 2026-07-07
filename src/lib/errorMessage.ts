import { AxiosError, isAxiosError } from 'axios'

type ServerErrorBody = {
  message?: string
  success?: boolean
  errors?: unknown
}

const STATUS_FALLBACKS: Record<number, string> = {
  400: 'Invalid request. Please check your input and try again.',
  401: 'Your session has expired. Please sign in again.',
  403: "You don't have permission to perform this action.",
  404: 'The requested resource was not found.',
  409: 'This conflicts with an existing record.',
  413: 'The uploaded file is too large.',
  415: 'This file type is not supported.',
  422: 'The provided data is invalid.',
  429: 'Too many requests. Please slow down and try again shortly.',
  500: 'Something went wrong on our end. Please try again in a moment.',
  502: 'The server is temporarily unavailable. Please try again.',
  503: 'The service is temporarily unavailable. Please try again.',
  504: 'The server took too long to respond. Please try again.',
}

const NETWORK_ERROR = 'Network error. Please check your connection and try again.'
const UNKNOWN_ERROR = 'An unexpected error occurred. Please try again.'

/**
 * Returns a user-facing error message.
 *
 * Priority:
 *  1. The `fallback` argument, if provided.
 *  2. The backend's `message` field (for Axios errors with a response body).
 *  3. A status-code-based default.
 *  4. A generic "network" or "unexpected" fallback.
 */
export function extractErrorMessage(
  error: unknown,
  fallback?: string,
): string {
  if (!error) return fallback ?? UNKNOWN_ERROR

  if (typeof error === 'string') return error

  if (isAxiosError(error)) {
    const axiosError = error as AxiosError<ServerErrorBody>

    if (axiosError.response) {
      const message = axiosError.response.data?.message
      if (message && typeof message === 'string' && message.trim()) {
        return message
      }
      return (
        STATUS_FALLBACKS[axiosError.response.status] ??
        fallback ??
        UNKNOWN_ERROR
      )
    }

    if (axiosError.request) {
      return fallback ?? NETWORK_ERROR
    }
  }

  if (error instanceof Error && error.message) {
    // Don't surface noisy "AxiosError:" prefixes to the user.
    const cleaned = error.message.replace(/^AxiosError:\s*/i, '').trim()
    if (cleaned && cleaned.length < 200) return cleaned
  }

  return fallback ?? UNKNOWN_ERROR
}

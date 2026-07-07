import axios, {
  AxiosError,
  isAxiosError,
  type InternalAxiosRequestConfig,
} from 'axios'

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

export const CSRF_COOKIE_NAME = 'XSRF-TOKEN'
export const CSRF_HEADER_NAME = 'X-XSRF-TOKEN'

/**
 * Read a cookie value by name from `document.cookie`.
 *
 * Returns `null` if the cookie is not set or document is unavailable
 * (server-side render).
 */
function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null
  const cookies = document.cookie ? document.cookie.split('; ') : []
  for (const cookie of cookies) {
    const eq = cookie.indexOf('=')
    if (eq === -1) continue
    const key = cookie.slice(0, eq)
    if (key !== name) continue
    return decodeURIComponent(cookie.slice(eq + 1))
  }
  return null
}

// `withCredentials: true` is REQUIRED so the browser sends/receives the
// HTTP-only `accessToken` / `refreshToken` cookies. Tokens are NEVER
// stored in localStorage; the backend sets them as HttpOnly cookies.
export const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
})

// A separate axios instance for the refresh call. We deliberately avoid
// using the shared `api` instance here to prevent the response interceptor
// from recursing on a 401 from /auth/refresh itself.
const refreshClient = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
})

type RetryableRequest = InternalAxiosRequestConfig & { _retry?: boolean }

let isRefreshing = false
let refreshQueue: Array<{
  resolve: (value: unknown) => void
  reject: (reason?: unknown) => void
}> = []

const flushQueue = (error: unknown) => {
  refreshQueue.forEach(({ reject }) => reject(error))
  refreshQueue = []
}

const processQueue = () => {
  refreshQueue.forEach(({ resolve }) => resolve(undefined))
  refreshQueue = []
}

const performRefresh = async (): Promise<void> => {
  try {
    await refreshClient.post('/auth/refresh')
    processQueue()
  } catch (error) {
    flushQueue(error)
    throw error
  }
}

// Public helpers -----------------------------------------------------------

export function isUnauthorized(error: unknown): boolean {
  return isAxiosError(error) && error.response?.status === 401
}

export async function silentRefresh(): Promise<boolean> {
  if (isRefreshing) {
    return new Promise<boolean>((resolve) => {
      refreshQueue.push({
        resolve: () => resolve(true),
        // If the in-flight refresh ultimately fails, the queued promise
        // resolves with `false` so callers can decide how to react.
        reject: () => resolve(false),
      })
    })
  }
  isRefreshing = true
  try {
    await performRefresh()
    return true
  } catch {
    return false
  } finally {
    isRefreshing = false
  }
}

// Interceptors -------------------------------------------------------------

// Request interceptor: attach CSRF token to all mutating requests.
// The CSRF cookie is set by the backend on first response and is
// readable by JavaScript by design.
api.interceptors.request.use((config) => {
  const method = (config.method || '').toUpperCase()
  const UNSAFE =
    method === 'POST' ||
    method === 'PUT' ||
    method === 'PATCH' ||
    method === 'DELETE'
  if (UNSAFE) {
    const token = getCookie(CSRF_COOKIE_NAME)
    if (token) {
      // Express middleware looks for `x-xsrf-token` first.
      config.headers.set(CSRF_HEADER_NAME, token)
    }
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryableRequest | undefined
    const requestUrl = originalRequest?.url || ''

    // Don't ever try to "refresh" the refresh request itself, and never
    // bubble 401s from auth endpoints to the silent-refresh flow.
    const isAuthEndpoint =
      requestUrl.includes('/auth/refresh') ||
      requestUrl.includes('/auth/login') ||
      requestUrl.includes('/auth/register') ||
      requestUrl.includes('/auth/logout')

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !isAuthEndpoint
    ) {
      originalRequest._retry = true

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          refreshQueue.push({
            resolve: () => resolve(api(originalRequest)),
            reject: (err) => reject(err),
          })
        })
      }

      isRefreshing = true
      try {
        await performRefresh()
        return api(originalRequest)
      } catch (refreshError) {
        // Refresh failed. Broadcast a single session-lost event so every
        // subscriber can react. We DO NOT toast here, by design.
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('auth:session-lost'))
        }
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  },
)

export { extractErrorMessage } from './errorMessage'

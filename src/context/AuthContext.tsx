'use client'
import { api } from '@/lib/api'
import type { ApiResponse, User } from '@/types'
import { useRouter } from 'next/navigation'
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react'

interface AuthContextType {
  user: User | null
  isLoading: boolean
  // Backend already sets HTTP-only cookies; the frontend only stores the
  // user profile in memory.
  setUser: (user: User | null) => void
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const PUBLIC_ROUTE_PREFIXES = [
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
]

const isPublicPath = (path: string) =>
  PUBLIC_ROUTE_PREFIXES.some(
    (prefix) => path === prefix || path.startsWith(`${prefix}/`),
  )

/**
 * Cross-tab broadcast channel. When one tab logs out (or its session
 * expires) every other tab receives the same signal and clears its
 * state, so a user never sees stale auth data in a sibling tab.
 */
const CHANNEL_NAME = 'auth'
type AuthMessage =
  | { type: 'session-lost' }
  | { type: 'logged-out' }
  | { type: 'logged-in'; user: User }

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  // Guard against running the initial user fetch more than once
  // (e.g. in React strict mode dev).
  const didInitialFetch = useRef(false)

  const performLogout = useCallback(
    (reason: 'manual' | 'session-lost' = 'manual') => {
      setUser(null)
      const path =
        typeof window !== 'undefined' ? window.location.pathname : '/'
      // On a session loss we redirect to /login unless the user is
      // already on a public page. We never bounce users out of /login
      // or /register because the AuthGuard is responsible for that.
      if (reason === 'session-lost' && !isPublicPath(path)) {
        router.replace('/login')
      } else if (reason === 'manual') {
        router.replace('/login')
      }
    },
    [router],
  )

  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout')
    } catch (error) {
      // The user is being logged out regardless. We do not toast;
      // failure here is non-actionable.
      // eslint-disable-next-line no-console
    } finally {
      performLogout('manual')
    }
  }, [performLogout])

  // Cross-tab coordination + session-lost events from the API layer.
  useEffect(() => {
    if (typeof window === 'undefined') return

    const channel = new BroadcastChannel(CHANNEL_NAME)
    channel.onmessage = (event: MessageEvent<AuthMessage>) => {
      const message = event.data
      if (!message || typeof message !== 'object') return
      switch (message.type) {
        case 'session-lost':
        case 'logged-out':
          performLogout('session-lost')
          break
        case 'logged-in':
          setUser(message.user)
          break
      }
    }

    const onSessionLost = () => {
      // Notify other tabs once.
      channel.postMessage({ type: 'session-lost' })
      performLogout('session-lost')
    }
    window.addEventListener('auth:session-lost', onSessionLost)

    return () => {
      channel.close()
      window.removeEventListener('auth:session-lost', onSessionLost)
    }
  }, [performLogout])

  // Initial user fetch. Runs exactly once per mount. If the access
  // cookie is expired the request returns 401 and the response
  // interceptor will perform a silent refresh; on refresh success we
  // retry here, on refresh failure the auth:session-lost handler above
  // takes over.
  useEffect(() => {
    if (didInitialFetch.current) return
    didInitialFetch.current = true

    let cancelled = false

    const loadUser = async () => {
      try {
        const { data } = await api.get<ApiResponse<{ user: User }>>('/auth/me')
        if (!cancelled) setUser(data.data.user)
      } catch (error) {
        // Try a one-shot explicit refresh in case the access cookie
        // expired between the last visit and this tab being opened.
        try {
          await api.post('/auth/refresh')
          const { data } =
            await api.get<ApiResponse<{ user: User }>>('/auth/me')
          if (!cancelled) setUser(data.data.user)
        } catch {
          if (!cancelled) setUser(null)
        }
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    void loadUser()
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <AuthContext.Provider value={{ user, isLoading, setUser, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

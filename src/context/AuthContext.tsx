'use client'
import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { tokenStorage, api } from '@/lib/api'
import type { User } from '@/types'

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (accessToken: string, refreshToken: string, user: User) => void
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const USER_KEY = 'user'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const storedUser =
      typeof window !== 'undefined'
        ? localStorage.getItem(USER_KEY)
        : null
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser))
      } catch (e) {
        console.error('Failed to parse stored user', e)
      }
    }
    setIsLoading(false)
  }, [])

  const login = (accessToken: string, refreshToken: string, userData: User) => {
    tokenStorage.set(accessToken, refreshToken)
    localStorage.setItem(USER_KEY, JSON.stringify(userData))
    setUser(userData)
  }

  const logout = async () => {
    const refreshToken = tokenStorage.getRefresh()
    try {
      if (refreshToken) await api.post('/auth/logout', { refreshToken })
    } catch (e) {
      console.error('Logout request failed', e)
    } finally {
      tokenStorage.clear()
      localStorage.removeItem(USER_KEY)
      setUser(null)
    }
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
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

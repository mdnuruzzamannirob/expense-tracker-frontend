'use client'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useAuth } from '@/context/AuthContext'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, type ReactNode } from 'react'

interface AuthGuardProps {
  children: ReactNode
}

// Routes that don't require an authenticated user.
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

export function AuthGuard({ children }: AuthGuardProps) {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const pathname = usePathname() || '/'

  const isPublicRoute = isPublicPath(pathname)

  useEffect(() => {
    if (isLoading) return
    if (!user && !isPublicRoute) {
      router.replace('/login')
    }
    if (user && isPublicRoute) {
      router.replace('/')
    }
  }, [isLoading, user, isPublicRoute, router, pathname])

  // While we're determining the auth state, show a skeleton. This
  // prevents a flash of the login page and also prevents the protected
  // page from rendering before /auth/me resolves.
  if (isLoading) {
    return (
      <div className="p-6 max-w-2xl space-y-4">
        <Skeleton className="h-8 w-48" />
        <Card>
          <CardContent className="p-6 space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-10 w-32" />
          </CardContent>
        </Card>
      </div>
    )
  }

  // Unauthenticated on a protected page → AuthContext/AuthGuard's effect
  // will redirect to /login. Render nothing in the meantime.
  if (!user && !isPublicRoute) return null
  // Authenticated user on a public page → same: the effect will redirect
  // to the dashboard.
  if (user && isPublicRoute) return null

  return <>{children}</>
}

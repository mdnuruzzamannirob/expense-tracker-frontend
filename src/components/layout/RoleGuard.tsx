'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import type { Role } from '@/types'

export function RoleGuard({
  children,
  allowedRoles,
}: {
  children: React.ReactNode
  allowedRoles: Role[]
}) {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && user && !allowedRoles.includes(user.role)) {
      router.replace('/')
    }
  }, [isLoading, user, allowedRoles, router])

  if (isLoading || !user) return null
  if (!allowedRoles.includes(user.role)) return null

  return <>{children}</>
}

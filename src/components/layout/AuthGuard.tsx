'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { Skeleton } from '@/components/ui/skeleton'

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { user, isLoading } = useAuth()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted && !isLoading && !user) {
      router.replace('/login')
    }
  }, [isLoading, user, router, mounted])

  if (!mounted || isLoading) {
    return (
      <div className="min-h-screen">
        <Skeleton className="h-full w-full" />
      </div>
    )
  }

  if (!user) return null
  return <>{children}</>
}

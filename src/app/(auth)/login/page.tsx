'use client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/context/AuthContext'
import { api, extractErrorMessage } from '@/lib/api'
import { LoginFormValues, loginSchema } from '@/lib/schema'
import type { ApiResponse, User } from '@/types'
import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

export default function LoginPage() {
  const router = useRouter()
  const { setUser } = useAuth()
  const [submitError, setSubmitError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) })

  const onSubmit = async (values: LoginFormValues) => {
    setSubmitError(null)
    try {
      const { data } = await api.post<ApiResponse<{ user: User }>>(
        '/auth/login',
        values,
      )
      setUser(data.data.user)
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        const channel = new BroadcastChannel('auth')
        channel.postMessage({ type: 'logged-in', user: data.data.user })
        channel.close()
      }
      toast.success('Logged in successfully')
      router.push('/')
    } catch (error) {
      const message = extractErrorMessage(
        error,
        'Invalid email or password. Please try again.',
      )
      setSubmitError(message)
      toast.error(message)
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Sign in</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            aria-invalid={!!errors.email}
            {...register('email')}
          />
          {errors.email && (
            <p className="text-sm text-red-500">{errors.email.message}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            aria-invalid={!!errors.password}
            {...register('password')}
          />
          {errors.password && (
            <p className="text-sm text-red-500">{errors.password.message}</p>
          )}
        </div>
        {submitError && (
          <p
            role="alert"
            className="text-sm text-red-500 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-md p-2"
          >
            {submitError}
          </p>
        )}
        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? 'Signing in...' : 'Sign in'}
        </Button>
      </form>
      <div className="flex justify-between text-sm">
        <Link
          href="/forgot-password"
          className="text-muted-foreground hover:underline"
        >
          Forgot password?
        </Link>
        <Link href="/register" className="hover:underline">
          Create account
        </Link>
      </div>
    </div>
  )
}

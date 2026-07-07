'use client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { useAuth } from '@/context/AuthContext'
import { api, extractErrorMessage } from '@/lib/api'
import { Lock, Save, User } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

export default function SettingsPage() {
  const { user, isLoading } = useAuth()
  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    formState: { isSubmitting: isProfileSubmitting, errors: profileErrors },
  } = useForm<{ name: string; currency: string }>({
    values: user ? { name: user.name, currency: user.currency } : undefined,
  })

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    reset: resetPasswordForm,
    formState: { isSubmitting: isPasswordSubmitting, errors: passwordErrors },
  } = useForm<{ currentPassword: string; newPassword: string }>()

  const [profileError, setProfileError] = useState<string | null>(null)
  const [passwordError, setPasswordError] = useState<string | null>(null)

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold">Settings</h1>
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold">Settings</h1>

      <Card>
        <CardHeader className="border-b">
          <CardTitle className="font-medium flex items-center gap-2">
            <User className="size-5" />
            Profile
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleProfileSubmit(async (values) => {
              setProfileError(null)
              try {
                await api.patch('/users/me', values)
                toast.success('Profile updated')
              } catch (error) {
                const message = extractErrorMessage(
                  error,
                  'Could not update profile',
                )
                setProfileError(message)
                toast.error(message)
              }
            })}
            className="space-y-4"
          >
            <div className="space-y-1.5">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                aria-invalid={!!profileErrors.name}
                {...registerProfile('name', { required: 'Name is required' })}
              />
              {profileErrors.name && (
                <p className="text-sm text-red-500">
                  {profileErrors.name.message}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="currency">Currency</Label>
              <Input
                id="currency"
                aria-invalid={!!profileErrors.currency}
                {...registerProfile('currency', {
                  required: 'Currency is required',
                  minLength: 3,
                  maxLength: 3,
                })}
              />
              {profileErrors.currency && (
                <p className="text-sm text-red-500">
                  {profileErrors.currency.message}
                </p>
              )}
            </div>
            {profileError && (
              <p
                role="alert"
                className="text-sm text-red-500 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-md p-2"
              >
                {profileError}
              </p>
            )}
            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={isProfileSubmitting}
                className="gap-1.5"
              >
                <Save className="h-4 w-4" />
                {isProfileSubmitting ? 'Saving...' : 'Save Profile'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        {' '}
        <CardHeader className="border-b">
          <CardTitle className="font-medium flex items-center gap-2">
            <Lock className="size-5" />
            Change Password
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handlePasswordSubmit(async (values) => {
              setPasswordError(null)
              try {
                await api.patch('/users/me/password', values)
                toast.success('Password changed')
                resetPasswordForm()
              } catch (error) {
                const message = extractErrorMessage(
                  error,
                  'Could not change password',
                )
                setPasswordError(message)
                toast.error(message)
              }
            })}
            className="space-y-4"
          >
            <div className="space-y-1.5">
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input
                id="currentPassword"
                type="password"
                autoComplete="current-password"
                placeholder="Enter current password"
                aria-invalid={!!passwordErrors.currentPassword}
                {...registerPassword('currentPassword', {
                  required: 'Current password is required',
                })}
              />
              {passwordErrors.currentPassword && (
                <p className="text-sm text-red-500">
                  {passwordErrors.currentPassword.message}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                autoComplete="new-password"
                placeholder="Enter new password"
                aria-invalid={!!passwordErrors.newPassword}
                {...registerPassword('newPassword', {
                  required: 'New password is required',
                  minLength: { value: 8, message: 'At least 8 characters' },
                })}
              />
              {passwordErrors.newPassword && (
                <p className="text-sm text-red-500">
                  {passwordErrors.newPassword.message}
                </p>
              )}
            </div>
            {passwordError && (
              <p
                role="alert"
                className="text-sm text-red-500 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-md p-2"
              >
                {passwordError}
              </p>
            )}
            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={isPasswordSubmitting}
                className="gap-1.5"
              >
                <Lock className="h-4 w-4" />
                {isPasswordSubmitting ? 'Changing...' : 'Change Password'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

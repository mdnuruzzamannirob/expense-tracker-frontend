'use client'

import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import { useAuth } from '@/context/AuthContext'
import { api, extractErrorMessage } from '@/lib/api'
import { Lock, Save, ShieldCheck, User } from 'lucide-react'
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
        <PageHeader
          title="Settings"
          description="Manage your profile, currency preference, and account security."
        />
        <Skeleton className="h-11 w-full max-w-sm rounded-lg" />
        <Skeleton className="h-48 w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Settings"
        description="Manage your profile, currency preference, and account security."
      />

      <Tabs defaultValue="profile" className="gap-6">
        <TabsList className="!h-11 w-full max-w-sm grid-cols-2 overflow-hidden rounded-lg p-1 sm:grid">
          <TabsTrigger
            value="profile"
            className="h-9 px-4 data-active:bg-primary data-active:text-primary-foreground dark:data-active:border-transparent dark:data-active:bg-primary dark:data-active:text-primary-foreground"
          >
            <User className="size-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger
            value="security"
            className="h-9 px-4 data-active:bg-primary data-active:text-primary-foreground dark:data-active:border-transparent dark:data-active:bg-primary dark:data-active:text-primary-foreground"
          >
            <ShieldCheck className="size-4" />
            Security
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader className="border-b">
              <CardTitle className="flex items-center gap-2 font-medium">
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
                    {...registerProfile('name', {
                      required: 'Name is required',
                    })}
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
                    className="rounded-md border border-red-200 bg-red-50 p-2 text-sm text-red-500 dark:border-red-900 dark:bg-red-950/30"
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
                    <Save className="size-4" />
                    {isProfileSubmitting ? 'Saving...' : 'Save Profile'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader className="border-b">
              <CardTitle className="flex items-center gap-2 font-medium">
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
                      minLength: {
                        value: 8,
                        message: 'At least 8 characters',
                      },
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
                    className="rounded-md border border-red-200 bg-red-50 p-2 text-sm text-red-500 dark:border-red-900 dark:bg-red-950/30"
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
                    <Lock className="size-4" />
                    {isPasswordSubmitting ? 'Changing...' : 'Change Password'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

'use client'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/context/AuthContext'
import { LogOut } from 'lucide-react'

export function LogoutButton() {
  const { logout } = useAuth()
  // AuthContext.logout already handles API call + redirect + tab
  // broadcast. We just need to invoke it.
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={logout}
      aria-label="Sign out"
    >
      <LogOut className="h-4 w-4" />
    </Button>
  )
}

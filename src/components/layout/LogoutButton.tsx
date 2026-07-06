'use client'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'

export function LogoutButton() {
  const router = useRouter()
  const { logout } = useAuth()

  const handleLogout = async () => {
    await logout()
    router.push('/login')
  }

  return <Button variant="ghost" size="sm" onClick={handleLogout}>Logout</Button>
}

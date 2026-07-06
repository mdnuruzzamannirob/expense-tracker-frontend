'use client'
import Link from 'next/link'
import { useSidebar } from '@/context/SidebarContext'
import { useAuth } from '@/context/AuthContext'
import { cn } from '@/lib/utils'
import { LayoutDashboard, Receipt, Tags, Wallet, Target, FileBarChart, Settings, ShieldCheck } from 'lucide-react'

export function Sidebar() {
  const { isOpen } = useSidebar()
  const { user } = useAuth()

  const links = [
    { href: '/', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/transactions', label: 'Transactions', icon: Receipt },
    { href: '/categories', label: 'Categories', icon: Tags },
    { href: '/budgets', label: 'Budgets', icon: Wallet },
    { href: '/savings-goals', label: 'Savings Goals', icon: Target },
    { href: '/reports', label: 'Reports', icon: FileBarChart },
    { href: '/settings', label: 'Settings', icon: Settings },
    ...(user?.role === 'ADMIN' ? [{ href: '/admin', label: 'Admin', icon: ShieldCheck }] : []),
  ]

  return (
    <aside className={cn('h-screen border-r bg-background transition-all duration-200', isOpen ? 'w-64' : 'w-16')}>
      <div className="p-4 font-bold text-lg">{isOpen ? 'Expense Tracker' : 'ET'}</div>
      <nav className="flex flex-col gap-1 px-2">
        {links.map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href} className="flex items-center gap-3 rounded-md px-3 py-2 text-sm hover:bg-muted">
            <Icon className="h-4 w-4 shrink-0" />
            {isOpen && <span>{label}</span>}
          </Link>
        ))}
      </nav>
    </aside>
  )
}

'use client'
import { useAuth } from '@/context/AuthContext'
import { useSidebar } from '@/context/SidebarContext'
import { cn } from '@/lib/utils'
import {
  FileBarChart,
  LayoutDashboard,
  Receipt,
  Settings,
  ShieldCheck,
  Tags,
  Target,
  Wallet,
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface NavLink {
  href: string
  label: string
  icon: typeof LayoutDashboard
}

// Routes that should use an exact match (no children).
const EXACT_MATCH_ROUTES = new Set<string>(['/'])

// Returns true if `currentPath` should mark `link.href` as active.
const isActive = (linkHref: string, currentPath: string): boolean => {
  if (EXACT_MATCH_ROUTES.has(linkHref)) {
    return currentPath === linkHref
  }
  return currentPath === linkHref || currentPath.startsWith(`${linkHref}/`)
}

export function Sidebar() {
  const { isOpen } = useSidebar()
  const { user } = useAuth()
  const pathname = usePathname() || '/'

  const links: NavLink[] = [
    { href: '/', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/transactions', label: 'Transactions', icon: Receipt },
    { href: '/categories', label: 'Categories', icon: Tags },
    { href: '/budgets', label: 'Budgets', icon: Wallet },
    { href: '/savings-goals', label: 'Savings Goals', icon: Target },
    { href: '/reports', label: 'Reports', icon: FileBarChart },
    { href: '/settings', label: 'Settings', icon: Settings },
    ...(user?.role === 'ADMIN'
      ? [{ href: '/admin', label: 'Admin', icon: ShieldCheck }]
      : []),
  ]

  return (
    <aside
      aria-label="Primary navigation"
      className={cn(
        'h-screen border-r bg-background transition-all duration-200 flex flex-col',
        isOpen ? 'w-64' : 'w-16',
      )}
    >
      <div className="p-4 font-bold text-lg whitespace-nowrap overflow-hidden">
        {isOpen ? 'Expense Tracker' : 'ET'}
      </div>
      <nav className="flex flex-col gap-1 px-2">
        {links.map(({ href, label, icon: Icon }) => {
          const active = isActive(href, pathname)
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors',
                'hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                active && 'bg-accent text-accent-foreground',
              )}
            >
              <Icon
                className={cn(
                  'h-4 w-4 shrink-0 transition-colors',
                  active ? 'text-white' : '',
                )}
              />
              {isOpen && <span className="truncate">{label}</span>}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}

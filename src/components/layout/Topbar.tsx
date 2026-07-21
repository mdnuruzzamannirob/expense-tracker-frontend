'use client'

import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { useAuth } from '@/context/AuthContext'
import { cn } from '@/lib/utils'
import {
  Bell,
  FileBarChart,
  LayoutDashboard,
  LogOut,
  Menu,
  Receipt,
  Settings,
  ShieldCheck,
  Tags,
  Target,
  Wallet,
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { ThemeToggle } from './ThemeToggle'

type NavLink = {
  href: string
  label: string
  icon: typeof LayoutDashboard
}

const isActive = (href: string, pathname: string) =>
  href === '/'
    ? pathname === '/'
    : pathname === href || pathname.startsWith(`${href}/`)

export function Topbar() {
  const { logout, user } = useAuth()
  const pathname = usePathname() || '/'
  const [drawerOpen, setDrawerOpen] = useState(false)
  const links: NavLink[] = [
    { href: '/', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/transactions', label: 'Transactions', icon: Receipt },
    { href: '/categories', label: 'Categories', icon: Tags },
    { href: '/budgets', label: 'Budgets', icon: Wallet },
    { href: '/savings-goals', label: 'Goals', icon: Target },
    { href: '/reports', label: 'Reports', icon: FileBarChart },
    { href: '/settings', label: 'Settings', icon: Settings },
    ...(user?.role === 'ADMIN'
      ? [{ href: '/admin', label: 'Admin', icon: ShieldCheck }]
      : []),
  ]

  const initials =
    user?.name
      ?.split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((name) => name[0])
      .join('')
      .toUpperCase() || 'ET'

  return (
    <header className="fixed inset-x-0 bg-background top-0 z-50 px-3 py-3 sm:px-6 sm:py-4">
      <div className="flex items-center gap-3 xl:gap-4">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2.5"
          aria-label="Expense Tracker home"
        >
          <span className="grid size-8 place-items-center rounded-full bg-primary text-sm text-white shadow-sm">
            E
          </span>
          <span className="hidden text-base text-foreground sm:block">
            Expense Tracker
          </span>
        </Link>

        <nav
          aria-label="Primary navigation"
          className="hidden min-w-0 flex-1 items-center justify-center xl:flex"
        >
          <div className="flex items-center gap-1 whitespace-nowrap rounded-full bg-muted/60 p-1">
            {links.map(({ href, label, icon: Icon }) => {
              const active = isActive(href, pathname)
              return (
                <Link
                  key={href}
                  href={href}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-background hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                    active &&
                      'bg-primary text-white shadow-sm hover:bg-primary hover:text-white',
                  )}
                >
                  <Icon className="size-3.5" />
                  <span>{label}</span>
                </Link>
              )
            })}
          </div>
        </nav>

        <div className="ml-auto hidden shrink-0 items-center gap-1 xl:flex">
          <Button
            variant="ghost"
            size="icon"
            className=" rounded-full"
            aria-label="Notifications"
          >
            <Bell className="size-4" />
          </Button>
          <ThemeToggle />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className=" rounded-full"
            onClick={logout}
            aria-label="Sign out"
          >
            <LogOut className="size-4" />
          </Button>
          <div
            title={user?.name || 'Account'}
            className="ml-1 grid size-8 place-items-center rounded-full bg-[#ff7a2f] text-[10px] font-bold text-white"
          >
            {initials}
          </div>
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-1 xl:hidden">
          <ThemeToggle />
          <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
            <SheetTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full"
                  aria-label="Open navigation menu"
                />
              }
            >
              <Menu className="size-5" />
            </SheetTrigger>

            <SheetContent side="left" className="w-[85vw] max-w-xs">
              <SheetHeader className="border-b px-5 py-5">
                <div className="flex items-center gap-3 pr-10">
                  <div className="grid size-10 shrink-0 place-items-center rounded-full bg-[#ff7a2f] text-xs font-bold text-white">
                    {initials}
                  </div>
                  <div className="min-w-0">
                    <SheetTitle className="truncate">
                      {user?.name || 'Expense Tracker'}
                    </SheetTitle>
                    <SheetDescription className="truncate">
                      {user?.email || 'Navigation menu'}
                    </SheetDescription>
                  </div>
                </div>
              </SheetHeader>

              <nav
                aria-label="Mobile navigation"
                className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-2"
              >
                {links.map(({ href, label, icon: Icon }) => {
                  const active = isActive(href, pathname)
                  return (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => setDrawerOpen(false)}
                      aria-current={active ? 'page' : undefined}
                      className={cn(
                        'flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground',
                        active &&
                          'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground',
                      )}
                    >
                      <Icon className="size-4" />
                      <span>{label}</span>
                    </Link>
                  )
                })}
              </nav>

              <SheetFooter className="border-t p-3">
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-3"
                  onClick={() => {
                    setDrawerOpen(false)
                    void logout()
                  }}
                >
                  <LogOut className="size-4" />
                  Sign out
                </Button>
              </SheetFooter>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}

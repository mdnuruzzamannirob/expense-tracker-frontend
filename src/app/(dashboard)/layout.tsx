import { AuthGuard } from '@/components/layout/AuthGuard'
import { Topbar } from '@/components/layout/Topbar'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthGuard>
      <div className="min-h-dvh">
        <Topbar />
        <main className="px-4 pb-6 pt-24 sm:px-6">{children}</main>
      </div>
    </AuthGuard>
  )
}

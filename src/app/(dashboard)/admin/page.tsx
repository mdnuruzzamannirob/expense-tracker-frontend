'use client'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { RoleGuard } from '@/components/layout/RoleGuard'
import type { ApiResponse, AdminUser, AdminStats } from '@/types'

function AdminContent() {
  const qc = useQueryClient()
  const { data: users } = useQuery({
    queryKey: ['admin', 'users'],
    queryFn: async () => (await api.get<ApiResponse<AdminUser[]>>('/admin/users', { params: { limit: 100 } })).data.data,
  })
  const { data: stats } = useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: async () => (await api.get<ApiResponse<AdminStats>>('/admin/stats')).data.data,
  })

  const toggleMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) =>
      api.patch(`/admin/users/${id}/status`, { isActive: !isActive }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'users'] }),
  })

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Admin</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card><CardHeader><CardTitle className="text-sm text-muted-foreground">Total Users</CardTitle></CardHeader><CardContent className="text-2xl font-semibold">{stats?.totalUsers ?? 0}</CardContent></Card>
        <Card><CardHeader><CardTitle className="text-sm text-muted-foreground">Active Users</CardTitle></CardHeader><CardContent className="text-2xl font-semibold">{stats?.activeUsers ?? 0}</CardContent></Card>
        <Card><CardHeader><CardTitle className="text-sm text-muted-foreground">Total Transactions</CardTitle></CardHeader><CardContent className="text-2xl font-semibold">{stats?.totalTransactions ?? 0}</CardContent></Card>
      </div>
      <Table>
        <TableHeader>
          <TableRow><TableHead>Name</TableHead><TableHead>Email</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Action</TableHead></TableRow>
        </TableHeader>
        <TableBody>
          {(users ?? []).map((u) => (
            <TableRow key={u.id}>
              <TableCell>{u.name}</TableCell>
              <TableCell>{u.email}</TableCell>
              <TableCell>{u.isActive ? 'Active' : 'Inactive'}</TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="sm" onClick={() => toggleMutation.mutate({ id: u.id, isActive: u.isActive })}>
                  {u.isActive ? 'Deactivate' : 'Activate'}
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

export default function AdminPage() {
  return (
    <RoleGuard allowedRoles={['ADMIN']}>
      <AdminContent />
    </RoleGuard>
  )
}

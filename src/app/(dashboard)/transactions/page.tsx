'use client'

import { ImportCsvDialog } from '@/components/transactions/ImportCsvDialog'
import { TransactionForm } from '@/components/transactions/TransactionForm'
import { TransactionTable } from '@/components/transactions/TransactionTable'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import {
  useAddTransactionMutation,
  useDeleteTransactionMutation,
  useTransactionsQuery,
  useUpdateTransactionMutation,
} from '@/hooks/useTransactions'
import type { Transaction } from '@/types'
import { useState } from 'react'

export default function TransactionsPage() {
  const { data, isLoading } = useTransactionsQuery({
    page: 1,
    limit: 20,
    sortBy: 'date',
    sortOrder: 'desc',
  })
  const addMutation = useAddTransactionMutation()
  const updateMutation = useUpdateTransactionMutation()
  const deleteMutation = useDeleteTransactionMutation()
  const [editing, setEditing] = useState<Transaction | null>(null)
  const [open, setOpen] = useState(false)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Transactions</h1>
        <div className="flex gap-2">
          <ImportCsvDialog />
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger>
              <Button onClick={() => setEditing(null)}>Add Transaction</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editing ? 'Edit' : 'Add'} Transaction
                </DialogTitle>
              </DialogHeader>
              <TransactionForm
                defaultValues={editing ?? undefined}
                isSubmitting={addMutation.isPending || updateMutation.isPending}
                onSubmit={(values) => {
                  if (editing)
                    updateMutation.mutate({
                      id: editing.id,
                      payload: values as any,
                    })
                  else addMutation.mutate(values as any)
                  setOpen(false)
                }}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {isLoading ? (
        <Skeleton className="h-64 w-full" />
      ) : (
        <TransactionTable
          transactions={data?.data ?? []}
          onEdit={(t) => {
            setEditing(t)
            setOpen(true)
          }}
          onDelete={(id) => deleteMutation.mutate(id)}
        />
      )}
    </div>
  )
}

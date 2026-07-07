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
import { Card, CardContent } from '@/components/ui/card'
import {
  useAddTransactionMutation,
  useDeleteTransactionMutation,
  useTransactionsQuery,
  useUpdateTransactionMutation,
} from '@/hooks/useTransactions'
import { extractErrorMessage } from '@/lib/api'
import { toast } from 'sonner'
import type { Transaction } from '@/types'
import { Plus, Receipt } from 'lucide-react'
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

  const handleSubmit = (values: {
    type: 'INCOME' | 'EXPENSE'
    amount: number
    categoryId: string
    date: string
    note?: string
    tags?: string[]
    isRecurring?: boolean
    recurringRule?: 'DAILY' | 'WEEKLY' | 'MONTHLY'
  }) => {
    if (editing) {
      updateMutation.mutate(
        { id: editing.id, payload: values },
        {
          onSuccess: () => {
            toast.success('Transaction updated')
            setOpen(false)
            setEditing(null)
          },
          onError: (error) => {
            toast.error(extractErrorMessage(error, 'Could not update transaction'))
          },
        },
      )
    } else {
      addMutation.mutate(values, {
        onSuccess: () => {
          toast.success('Transaction added')
          setOpen(false)
        },
        onError: (error) => {
          toast.error(extractErrorMessage(error, 'Could not add transaction'))
        },
      })
    }
  }

  const handleDelete = (id: string) => {
    if (!confirm('Delete this transaction? This cannot be undone.')) return
    deleteMutation.mutate(id, {
      onSuccess: () => toast.success('Transaction deleted'),
      onError: (error) => {
        toast.error(extractErrorMessage(error, 'Could not delete transaction'))
      },
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Transactions</h1>
        <div className="flex gap-2">
          <ImportCsvDialog />
          <Dialog
            open={open}
            onOpenChange={(next) => {
              setOpen(next)
              if (!next) setEditing(null)
            }}
          >
            <DialogTrigger
              render={
                <Button
                  onClick={() => setEditing(null)}
                  className="gap-1.5"
                />
              }
            >
              <Plus className="h-4 w-4" />
              Add Transaction
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
                onSubmit={handleSubmit}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {isLoading ? (
        <Card>
          <CardContent className="p-0">
            <div className="space-y-2 p-4">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      ) : data && data.data.length > 0 ? (
        <Card>
          <CardContent className="p-0">
            <TransactionTable
              transactions={data.data}
              onEdit={(t) => {
                setEditing(t)
                setOpen(true)
              }}
              onDelete={handleDelete}
            />
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-12 flex flex-col items-center justify-center text-center text-muted-foreground">
            <Receipt className="h-10 w-10 mb-3" />
            <p className="font-medium">No transactions yet</p>
            <p className="text-sm">
              Click "Add Transaction" above to record your first one.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

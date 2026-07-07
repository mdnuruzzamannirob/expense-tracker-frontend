'use client'
import { BudgetCard } from '@/components/budgets/BudgetCard'
import { BudgetForm } from '@/components/budgets/BudgetForm'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { useBudgetsQuery, useSetBudgetMutation } from '@/hooks/useBudgets'
import { extractErrorMessage } from '@/lib/api'
import { Plus, Wallet } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

export default function BudgetsPage() {
  const now = new Date()
  const { data: budgets, isLoading } = useBudgetsQuery(
    now.getMonth() + 1,
    now.getFullYear(),
  )
  const setBudgetMutation = useSetBudgetMutation()
  const [open, setOpen] = useState(false)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Budgets</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger render={<Button className="gap-1.5" />}>
            <Plus className="h-4 w-4" />
            Set Budget
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Set Monthly Budget</DialogTitle>
            </DialogHeader>
            <BudgetForm
              isSubmitting={setBudgetMutation.isPending}
              onSubmit={(values) => {
                setBudgetMutation.mutate(values, {
                  onSuccess: () => {
                    toast.success('Budget saved')
                    setOpen(false)
                  },
                  onError: (error) => {
                    toast.error(
                      extractErrorMessage(error, 'Could not save budget'),
                    )
                  },
                })
              }}
            />
          </DialogContent>
        </Dialog>
      </div>
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4 space-y-3">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-8 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : budgets && budgets.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {budgets.map((b) => (
            <BudgetCard key={b.id} budget={b} />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-12 flex flex-col items-center justify-center text-center text-muted-foreground">
            <Wallet className="h-10 w-10 mb-3" />
            <p className="font-medium">No budgets set</p>
            <p className="text-sm">
              Set a monthly budget to track your spending in each category.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

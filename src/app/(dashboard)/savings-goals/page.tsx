'use client'
import { GoalCard } from '@/components/savings/GoalCard'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { DatePicker } from '@/components/ui/date-picker'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import {
  useContributeToGoalMutation,
  useCreateGoalMutation,
  useDeleteGoalMutation,
  useSavingsGoalsQuery,
} from '@/hooks/useSavingsGoals'
import { extractErrorMessage } from '@/lib/api'
import { SavingsGoalFormInput, SavingsGoalFormValues, savingsGoalSchema } from '@/lib/schema'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus, Target } from 'lucide-react'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { toast } from 'sonner'

export default function SavingsGoalsPage() {
  const { data: goals, isLoading } = useSavingsGoalsQuery()
  const contributeMutation = useContributeToGoalMutation()
  const deleteMutation = useDeleteGoalMutation()
  const createMutation = useCreateGoalMutation()
  const [open, setOpen] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState<{
    id: string
    title: string
  } | null>(null)

 const {
   register,
   handleSubmit,
   reset,
   control,
   formState: { errors },
 } = useForm<SavingsGoalFormInput, any, SavingsGoalFormValues>({
   resolver: zodResolver(savingsGoalSchema),
 })

  const onCreate = (values: SavingsGoalFormValues) => {
    createMutation.mutate(values, {
      onSuccess: () => {
        toast.success('Goal created')
        reset()
        setOpen(false)
      },
      onError: (error) => {
        toast.error(extractErrorMessage(error, 'Could not create goal'))
      },
    })
  }

  const handleConfirmDelete = () => {
    if (!confirmDelete) return
    deleteMutation.mutate(confirmDelete.id, {
      onSuccess: () => {
        toast.success('Goal deleted')
        setConfirmDelete(null)
      },
      onError: (error) => {
        toast.error(extractErrorMessage(error, 'Could not delete goal'))
      },
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Savings Goals</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger render={<Button className="gap-1.5" />}>
            <Plus className="h-4 w-4" />
            New Goal
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Savings Goal</DialogTitle>
            </DialogHeader>
            <form
              onSubmit={handleSubmit(onCreate)}
              className="space-y-4"
              noValidate
            >
              <div className="space-y-1.5">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  aria-invalid={!!errors.title}
                  {...register('title')}
                />
                {errors.title && (
                  <p className="text-sm text-red-500">{errors.title.message}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="targetAmount">Target Amount</Label>
                <Input
                  id="targetAmount"
                  type="number"
                  step="0.01"
                  inputMode="decimal"
                  aria-invalid={!!errors.targetAmount}
                  {...register('targetAmount')}
                />
                {errors.targetAmount && (
                  <p className="text-sm text-red-500">
                    {errors.targetAmount.message}
                  </p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="deadline">Deadline</Label>
                <Controller
                  control={control}
                  name="deadline"
                  render={({ field }) => (
                    <DatePicker
                      id="deadline"
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Pick a deadline"
                      outputFormat="yyyy-MM-dd'T'HH:mm:ss.SSSxxx"
                    />
                  )}
                />
                {errors.deadline && (
                  <p className="text-sm text-red-500">
                    {errors.deadline.message}
                  </p>
                )}
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={createMutation.isPending}
              >
                {createMutation.isPending ? 'Creating...' : 'Create Goal'}
              </Button>
            </form>
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
      ) : goals && goals.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {goals.map((g) => (
            <GoalCard
              key={g.id}
              goal={g}
              onContribute={(id, amount) =>
                contributeMutation.mutate(
                  { id, amount },
                  {
                    onError: (error) =>
                      toast.error(
                        extractErrorMessage(error, 'Could not add contribution'),
                      ),
                  },
                )
              }
              onDelete={(id, title) => setConfirmDelete({ id, title })}
              isDeleting={deleteMutation.isPending}
            />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-12 flex flex-col items-center justify-center text-center text-muted-foreground">
            <Target className="h-10 w-10 mb-3" />
            <p className="font-medium">No savings goals yet</p>
            <p className="text-sm">
              Create your first goal to start tracking your progress.
            </p>
          </CardContent>
        </Card>
      )}

      <ConfirmDialog
        open={!!confirmDelete}
        onOpenChange={(open) => !open && setConfirmDelete(null)}
        title="Delete savings goal?"
        description={
          confirmDelete
            ? `Are you sure you want to delete "${confirmDelete.title}"? This action cannot be undone.`
            : ''
        }
        confirmLabel="Delete"
        variant="destructive"
        isLoading={deleteMutation.isPending}
        onConfirm={handleConfirmDelete}
      />
    </div>
  )
}

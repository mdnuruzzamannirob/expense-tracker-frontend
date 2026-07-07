'use client'
import { ContributeDialog } from '@/components/savings/ContributeDialog'
import { GoalCard } from '@/components/savings/GoalCard'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
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
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  useContributeToGoalMutation,
  useCreateGoalMutation,
  useDeleteGoalMutation,
  useSavingsGoalsQuery,
} from '@/hooks/useSavingsGoals'
import { extractErrorMessage } from '@/lib/api'
import { Plus, Target, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { toast } from 'sonner'

interface GoalFormValues {
  title: string
  targetAmount: number
  deadline: string
}

export default function SavingsGoalsPage() {
  const { data: goals, isLoading } = useSavingsGoalsQuery()
  const contributeMutation = useContributeToGoalMutation()
  const deleteMutation = useDeleteGoalMutation()
  const createMutation = useCreateGoalMutation()
  const [open, setOpen] = useState(false)
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<GoalFormValues>()

  const onCreate = (values: GoalFormValues) => {
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

  const handleDelete = (id: string, title: string) => {
    if (!confirm(`Delete goal "${title}"? This cannot be undone.`)) return
    deleteMutation.mutate(id, {
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
                  {...register('title', { required: 'Title is required' })}
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
                  {...register('targetAmount', {
                    required: 'Target amount is required',
                    valueAsNumber: true,
                    min: { value: 1, message: 'Must be greater than 0' },
                  })}
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
                  rules={{ required: 'Deadline is required' }}
                  render={({ field }) => (
                    <DatePicker
                      id="deadline"
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Pick a deadline"
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
            <div key={g.id} className="space-y-2">
              <GoalCard goal={g} />
              <div className="flex gap-2">
                <ContributeDialog
                  goalId={g.id}
                  onContribute={(id, amount) =>
                    contributeMutation.mutate(
                      { id, amount },
                      {
                        onError: (error) =>
                          toast.error(
                            extractErrorMessage(
                              error,
                              'Could not add contribution',
                            ),
                          ),
                      },
                    )
                  }
                />
                <Tooltip>
                  <TooltipTrigger
                    render={
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(g.id, g.title)}
                        disabled={deleteMutation.isPending}
                        aria-label={`Delete ${g.title}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    }
                  />
                  <TooltipContent>Delete goal</TooltipContent>
                </Tooltip>
              </div>
            </div>
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
    </div>
  )
}

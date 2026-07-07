"use client"
import { CategorySelect } from "@/components/categories/CategorySelect"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { BudgetFormInput, BudgetFormValues, budgetSchema } from "@/lib/schema"



interface Props {
  onSubmit: (values: BudgetFormValues) => void
  defaultValues?: Partial<BudgetFormValues>
  isSubmitting?: boolean
}

export function BudgetForm({ onSubmit, defaultValues, isSubmitting }: Props) {
  const now = new Date()
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<BudgetFormInput, any, BudgetFormValues>({
    resolver: zodResolver(budgetSchema),
    defaultValues: {
      month: now.getMonth() + 1,
      year: now.getFullYear(),
      alertThreshold: 80,
      ...defaultValues,
    },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="categoryId">Category</Label>
        <Controller
          control={control}
          name="categoryId"
          render={({ field }) => (
            <CategorySelect
              id="categoryId"
              value={field.value}
              onValueChange={field.onChange}
              type="EXPENSE"
              invalid={!!errors.categoryId}
              placeholder="Select category"
              emptyMessage="No expense categories yet"
            />
          )}
        />
        {errors.categoryId && (
          <p className="text-sm text-red-500">{errors.categoryId.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="limit">Monthly Limit</Label>
        <Input
          id="limit"
          type="number"
          step="0.01"
          inputMode="decimal"
          aria-invalid={!!errors.limit}
          {...register('limit')}
        />
        {errors.limit && (
          <p className="text-sm text-red-500">{errors.limit.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="alertThreshold">Alert Threshold (%)</Label>
        <Input
          id="alertThreshold"
          type="number"
          min={0}
          max={100}
          aria-invalid={!!errors.alertThreshold}
          {...register('alertThreshold')}
        />
        {errors.alertThreshold && (
          <p className="text-sm text-red-500">
            {errors.alertThreshold.message}
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="month">Month</Label>
          <Input
            id="month"
            type="number"
            min={1}
            max={12}
            aria-invalid={!!errors.month}
            {...register('month')}
          />
          {errors.month && (
            <p className="text-sm text-red-500">{errors.month.message}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="year">Year</Label>
          <Input
            id="year"
            type="number"
            aria-invalid={!!errors.year}
            {...register('year')}
          />
          {errors.year && (
            <p className="text-sm text-red-500">{errors.year.message}</p>
          )}
        </div>
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? 'Saving...' : 'Save Budget'}
      </Button>
    </form>
  )
}

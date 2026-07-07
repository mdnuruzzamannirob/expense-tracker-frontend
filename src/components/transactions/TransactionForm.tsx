'use client'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { DatePicker } from '@/components/ui/date-picker'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useCategoriesQuery } from '@/hooks/useCategories'
import type { Transaction } from '@/types'
import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'

const schema = z.object({
  type: z.enum(['INCOME', 'EXPENSE']),
  amount: z.coerce.number().positive(),
  categoryId: z.string().min(1, 'Please select a category'),
  date: z.string().min(1, 'Please pick a date'),
  note: z.string().optional(),
  tags: z.string().optional(),
  isRecurring: z.boolean().optional(),
  recurringRule: z.enum(['DAILY', 'WEEKLY', 'MONTHLY']).optional(),
})

type FormValues = z.infer<typeof schema>

type FormSubmitValues = Omit<FormValues, 'tags'> & { tags: string[] }

interface Props {
  defaultValues?: Partial<Transaction>
  onSubmit: (values: FormSubmitValues) => void
  isSubmitting?: boolean
}

export function TransactionForm({
  defaultValues,
  onSubmit,
  isSubmitting,
}: Props) {
  const { data: categories } = useCategoriesQuery()
  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema) as any,
    defaultValues: {
      type: 'EXPENSE',
      date: new Date().toISOString().slice(0, 10),
      ...(defaultValues as FormValues | undefined),
    },
  })

  const isRecurring = watch('isRecurring')

  return (
    <form
      onSubmit={handleSubmit((values) => {
        const tags = values.tags
          ? values.tags
              .split(',')
              .map((t) => t.trim())
              .filter(Boolean)
          : []
        onSubmit({ ...values, tags })
      })}
      className="space-y-4"
    >
      <div className="space-y-1.5">
        <Label htmlFor="type">Type</Label>
        <Controller
          control={control}
          name="type"
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger id="type" className="w-full">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="INCOME">Income</SelectItem>
                <SelectItem value="EXPENSE">Expense</SelectItem>
              </SelectContent>
            </Select>
          )}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="amount">Amount</Label>
        <Input
          id="amount"
          type="number"
          step="0.01"
          inputMode="decimal"
          aria-invalid={!!errors.amount}
          {...register('amount')}
        />
        {errors.amount && (
          <p className="text-sm text-red-500">{errors.amount.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="categoryId">Category</Label>
        <Controller
          control={control}
          name="categoryId"
          render={({ field }) => (
            <Select value={field.value || ''} onValueChange={field.onChange}>
              <SelectTrigger id="categoryId" className="w-full">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {(categories ?? []).map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {errors.categoryId && (
          <p className="text-sm text-red-500">{errors.categoryId.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="date">Date</Label>
        <Controller
          control={control}
          name="date"
          render={({ field }) => (
            <DatePicker
              id="date"
              value={field.value}
              onChange={field.onChange}
              placeholder="Pick a date"
            />
          )}
        />
        {errors.date && (
          <p className="text-sm text-red-500">{errors.date.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="tags">Tags (comma separated)</Label>
        <Input
          id="tags"
          placeholder="e.g. groceries, weekly"
          {...register('tags')}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="note">Note</Label>
        <Input id="note" placeholder="Optional note" {...register('note')} />
      </div>

      <div className="flex items-center gap-2 pt-1">
        <Controller
          control={control}
          name="isRecurring"
          render={({ field }) => (
            <Checkbox
              id="isRecurring"
              checked={!!field.value}
              onCheckedChange={field.onChange}
            />
          )}
        />
        <Label htmlFor="isRecurring" className="cursor-pointer">
          Recurring
        </Label>
      </div>

      {isRecurring && (
        <div className="space-y-1.5">
          <Label htmlFor="recurringRule">Recurring Rule</Label>
          <Controller
            control={control}
            name="recurringRule"
            render={({ field }) => (
              <Select value={field.value || ''} onValueChange={field.onChange}>
                <SelectTrigger id="recurringRule" className="w-full">
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DAILY">Daily</SelectItem>
                  <SelectItem value="WEEKLY">Weekly</SelectItem>
                  <SelectItem value="MONTHLY">Monthly</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </div>
      )}

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? 'Saving...' : 'Save Transaction'}
      </Button>
    </form>
  )
}

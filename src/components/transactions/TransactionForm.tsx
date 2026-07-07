'use client'
import { CategorySelect } from '@/components/categories/CategorySelect'
import { CategoryAddModal } from '@/components/categories/CategoryAddModal'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
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
import { Switch } from '@/components/ui/switch'
import type { Transaction } from '@/types'
import { zodResolver } from '@hookform/resolvers/zod'
import { X } from 'lucide-react'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { TransactionFormInput, TransactionFormValues, transactionSchema } from '@/lib/schema'

interface Props {
  defaultValues?: Partial<Transaction>
  onSubmit: (values: TransactionFormValues) => void
  isSubmitting?: boolean
}

export function TransactionForm({
  defaultValues,
  onSubmit,
  isSubmitting,
}: Props) {
  const [tagInput, setTagInput] = useState('')

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    resetField,
    formState: { errors },
  } = useForm<TransactionFormInput, any, TransactionFormValues>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: 'EXPENSE',
      date: new Date().toISOString(),
      tags: [],
      isRecurring: false,
      recurringRule: undefined,
      ...(defaultValues as Partial<TransactionFormInput> | undefined),
    },
  })

  const watchedType = watch('type')
  const watchedTags = watch('tags') ?? []
  const isRecurring = watch('isRecurring')

  // type change হলে আগের categoryId reset হবে
  const handleTypeChange = (value: 'INCOME' | 'EXPENSE') => {
    setValue('type', value, { shouldValidate: true })
    resetField('categoryId')
  }

  const handleAddTag = (value: string) => {
    const trimmed = value.trim()
    if (trimmed && !watchedTags.includes(trimmed)) {
      setValue('tags', [...watchedTags, trimmed], { shouldValidate: true })
    }
    setTagInput('')
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setValue(
      'tags',
      watchedTags.filter((t) => t !== tagToRemove),
      { shouldValidate: true },
    )
  }

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      handleAddTag(tagInput)
    } else if (e.key === 'Backspace' && !tagInput && watchedTags.length > 0) {
      handleRemoveTag(watchedTags[watchedTags.length - 1])
    }
  }

  return (
    <form
      onSubmit={handleSubmit((values) => {
        onSubmit(values)
      })}
      className="space-y-4"
    >
      <div className="space-y-1.5">
        <Label htmlFor="type">Type</Label>
        <Controller
          control={control}
          name="type"
          render={({ field }) => (
            <Select
              value={field.value}
              onValueChange={(v) => handleTypeChange(v as 'INCOME' | 'EXPENSE')}
            >
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
        <div className="flex items-center justify-between">
          <Label htmlFor="categoryId">Category</Label>
          <CategoryAddModal />
        </div>
        <Controller
          control={control}
          name="categoryId"
          render={({ field }) => (
            <CategorySelect
              id="categoryId"
              value={field.value}
              onValueChange={field.onChange}
              type={watchedType}
              invalid={!!errors.categoryId}
              placeholder="Select category"
              emptyMessage={`No ${watchedType.toLowerCase()} categories yet`}
            />
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
              outputFormat="yyyy-MM-dd'T'HH:mm:ss.SSSxxx"
            />
          )}
        />
        {errors.date && (
          <p className="text-sm text-red-500">{errors.date.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="tags">Tags</Label>
        <div className="flex flex-wrap gap-1.5 p-2 min-h-[42px] border rounded-md bg-background">
          {watchedTags.map((tag) => (
            <Badge key={tag} variant="secondary" className="gap-1 pr-1">
              {tag}
              <button
                type="button"
                onClick={() => handleRemoveTag(tag)}
                className="ml-0.5 rounded-full hover:bg-muted p-0.5"
                aria-label={`Remove ${tag}`}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          <input
            id="tags"
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleTagKeyDown}
            onBlur={() => tagInput && handleAddTag(tagInput)}
            placeholder={watchedTags.length === 0 ? 'Add tags...' : ''}
            className="flex-1 min-w-[100px] bg-transparent outline-none text-sm placeholder:text-muted-foreground"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="note">Note</Label>
        <Input id="note" placeholder="Optional note" {...register('note')} />
      </div>

      {/* Recurring: text left, Switch right */}
      <div className="flex items-center justify-between rounded-md border bg-background px-3 py-2">
        <Label htmlFor="isRecurring" className="cursor-pointer">
          Recurring
        </Label>
        <Controller
          control={control}
          name="isRecurring"
          render={({ field }) => (
            <Switch
              id="isRecurring"
              checked={!!field.value}
              onCheckedChange={field.onChange}
            />
          )}
        />
      </div>

      {isRecurring && (
        <div className="rounded-lg bg-muted/50 p-3 space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="recurringRule">Recurring Rule</Label>
            <Controller
              control={control}
              name="recurringRule"
              render={({ field }) => (
                <Select
                  value={field.value || ''}
                  onValueChange={field.onChange}
                >
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
        </div>
      )}

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? 'Saving...' : 'Save Transaction'}
      </Button>
    </form>
  )
}

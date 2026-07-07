/**
 * Central Zod schemas for the expense tracker frontend.
 * All reusable form schemas are defined here and imported across components.
 * Built for Zod 4.x with proper type inference and composition.
 */

import { z } from 'zod'

// ─── Shared / Primitives ────────────────────────────────────────────────────

export const txnTypeSchema = z.enum(['INCOME', 'EXPENSE'])
export type TxnType = z.infer<typeof txnTypeSchema>

export const recurringRuleSchema = z.enum(['DAILY', 'WEEKLY', 'MONTHLY'])
export type RecurringRule = z.infer<typeof recurringRuleSchema>

// ─── Transaction ──────────────────────────────────────────────────────────

/** ISO 8601 datetime string with timezone offset — used for date fields sent to the backend. */
export const isoDateTimeSchema = z
  .string()
  .datetime({ offset: true, message: 'Invalid ISO datetime' })

export const transactionSchema = z.object({
  type: txnTypeSchema,
  amount: z.coerce.number().positive('Amount must be positive'),
  categoryId: z.string().min(1, 'Please select a category'),
  date: isoDateTimeSchema,
  note: z.string().optional(),
  tags: z.array(z.string()).default([]),
  isRecurring: z.boolean().default(false),
  recurringRule: recurringRuleSchema.optional(),
})

/** Shape BEFORE zod parses/coerces (what react-hook-form fields hold, e.g. amount may be a string). */
export type TransactionFormInput = z.input<typeof transactionSchema>
/** Shape AFTER zod parses/coerces (what onSubmit receives). */
export type TransactionFormValues = z.output<typeof transactionSchema>

// ─── Budget ───────────────────────────────────────────────────────────────

export const budgetSchema = z.object({
  categoryId: z.string().min(1, 'Please select a category'),
  limit: z.coerce.number().positive('Limit must be a positive number'),
  alertThreshold: z.coerce
    .number()
    .int()
    .min(1, 'Must be between 1 and 100')
    .max(100, 'Must be between 1 and 100'),
  month: z.coerce
    .number()
    .int()
    .min(1, 'Must be between 1 and 12')
    .max(12, 'Must be between 1 and 12'),
  year: z.coerce.number().int().min(1970, 'Invalid year'),
})

export type BudgetFormInput = z.input<typeof budgetSchema>
export type BudgetFormValues = z.output<typeof budgetSchema>

// ─── Savings Goal ──────────────────────────────────────────────────────────

export const savingsGoalSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  targetAmount: z.coerce.number().positive('Must be greater than 0'),
  deadline: isoDateTimeSchema,
})

export type SavingsGoalFormInput = z.input<typeof savingsGoalSchema>
export type SavingsGoalFormValues = z.output<typeof savingsGoalSchema>

// ─── Category ─────────────────────────────────────────────────────────────

export const categorySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  type: txnTypeSchema,
  icon: z.string().optional(),
  color: z.string().optional(),
})

export type CategoryFormValues = z.infer<typeof categorySchema>

// ─── Auth ─────────────────────────────────────────────────────────────────

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

export type LoginFormValues = z.infer<typeof loginSchema>

export const registerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  currency: z.string().optional(),
})

export type RegisterFormValues = z.infer<typeof registerSchema>

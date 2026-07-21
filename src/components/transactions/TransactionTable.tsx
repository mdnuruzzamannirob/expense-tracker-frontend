'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'
import type { Transaction } from '@/types'
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Copy,
  ExternalLink,
  Hash,
  Pencil,
  Repeat2,
  Trash2,
} from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

interface Props {
  transactions: Transaction[]
  currency?: string
  page: number
  pageSize: number
  total: number
  onPageChange: (page: number) => void
  onPageSizeChange: (pageSize: number) => void
  onEdit: (transaction: Transaction) => void
  onDelete: (id: string) => void
}

function formatCurrency(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
    }).format(Math.abs(amount))
  } catch {
    return `${currency} ${Math.abs(amount).toFixed(2)}`
  }
}

function formatDateOnly(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date)
}

function formatDateTime(value?: string) {
  if (!value) return 'Unknown'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date)
}

function Amount({
  transaction,
  currency,
  large = false,
}: {
  transaction: Transaction
  currency: string
  large?: boolean
}) {
  const isIncome = transaction.type === 'INCOME'
  return (
    <span
      className={cn(
        'font-semibold tabular-nums',
        large && 'text-3xl tracking-tight',
        isIncome
          ? 'text-emerald-600 dark:text-emerald-400'
          : 'text-red-600 dark:text-red-400',
      )}
    >
      {isIncome ? '+' : '-'}
      {formatCurrency(transaction.amount, currency)}
    </span>
  )
}

function Category({ transaction }: { transaction: Transaction }) {
  return (
    <span className="block max-w-40 truncate font-medium">
      {transaction.category?.name ?? 'Uncategorized'}
    </span>
  )
}

function Tags({ tags, limit }: { tags: string[]; limit?: number }) {
  const visible = typeof limit === 'number' ? tags.slice(0, limit) : tags
  const remaining = tags.length - visible.length
  if (!tags.length) return <span className="text-muted-foreground">—</span>
  return (
    <div className="flex flex-wrap gap-1.5">
      {visible.map((tag) => (
        <Badge key={tag} variant="secondary" className="font-normal">
          {tag}
        </Badge>
      ))}
      {remaining > 0 && <Badge variant="outline">+{remaining}</Badge>}
    </div>
  )
}

function TransactionDetails({
  transaction,
  currency,
}: {
  transaction: Transaction
  currency: string
}) {
  const [copied, setCopied] = useState(false)
  const recurringLabel = transaction.recurringRule
    ? transaction.recurringRule.charAt(0) +
      transaction.recurringRule.slice(1).toLowerCase()
    : 'Recurring'

  const copyId = async () => {
    try {
      await navigator.clipboard.writeText(transaction.id)
      setCopied(true)
      toast.success('Transaction ID copied')
      window.setTimeout(() => setCopied(false), 1500)
    } catch {
      toast.error('Could not copy transaction ID')
    }
  }

  return (
    <DialogContent className="overflow-hidden p-0 sm:max-w-lg">
      <div
        className={cn(
          'border-b px-5 py-5 pr-14 sm:px-6',
          transaction.type === 'INCOME'
            ? 'bg-linear-to-br from-emerald-500/12 via-emerald-500/5 to-transparent'
            : 'bg-linear-to-br from-red-500/12 via-red-500/5 to-transparent',
        )}
      >
        <DialogHeader className="gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <DialogTitle className="text-lg">Transaction details</DialogTitle>
            <DialogDescription className="sr-only">
              Complete details for the selected transaction.
            </DialogDescription>
          </div>
          <div>
            <p className="mb-1 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
              {transaction.category?.name ?? 'Uncategorized'} · {transaction.type === 'INCOME' ? 'Income' : 'Expense'}
            </p>
            <Amount transaction={transaction} currency={currency} large />
          </div>
        </DialogHeader>
      </div>

      <div className="space-y-5 px-5 pb-5 sm:px-6">
        <div className="grid border-b sm:grid-cols-2">
          <div className="pb-4 sm:border-r sm:pr-4">
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">Category</p>
              <Category transaction={transaction} />
            </div>
          </div>
          <div className="py-4 sm:py-0 sm:pl-4">
            <div>
              <p className="text-xs text-muted-foreground">Date &amp; time</p>
              <time
                suppressHydrationWarning
                dateTime={transaction.date}
                className="font-medium"
              >
                {formatDateTime(transaction.date)}
              </time>
            </div>
          </div>
        </div>

        <section className="space-y-2 border-b pb-5">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Note
          </p>
          <p
            className={cn(
              'whitespace-pre-wrap leading-relaxed',
              !transaction.note?.trim() && 'text-muted-foreground',
            )}
          >
            {transaction.note?.trim() || 'No note'}
          </p>
        </section>

        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Tags
          </p>
          {transaction.tags.length ? (
            <Tags tags={transaction.tags} />
          ) : (
            <p className="text-muted-foreground">No tags</p>
          )}
        </div>

        <div className="grid gap-5 border-b pb-5 sm:grid-cols-2">
          <div className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Recurring
            </p>
            <p className="flex items-center gap-2 font-medium">
              {transaction.isRecurring ? (
                <>
                  <Repeat2 className="size-4" />
                  Recurring: {recurringLabel}
                </>
              ) : (
                'Not recurring'
              )}
            </p>
          </div>
          <div className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Receipt
            </p>
            {transaction.receiptUrl ? (
              <Button
                variant="outline"
                size="sm"
                render={
                  <a
                    href={transaction.receiptUrl}
                    target="_blank"
                    rel="noreferrer"
                  />
                }
              >
                View receipt <ExternalLink className="size-3.5" />
              </Button>
            ) : (
              <p className="text-muted-foreground">No receipt attached</p>
            )}
          </div>
        </div>

        <div>
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Hash className="size-3" />
            Transaction ID
          </p>
          <div className="flex items-center gap-2">
            <code className="min-w-0 flex-1 truncate text-xs">
              {transaction.id}
            </code>
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={copyId}
              aria-label="Copy transaction ID"
            >
              {copied ? <Check className="text-emerald-600" /> : <Copy />}
            </Button>
          </div>
        </div>

        <p
          className="flex items-center gap-1.5 text-xs text-muted-foreground"
          suppressHydrationWarning
        >
          <Clock3 className="size-3.5" /> Added:{' '}
          {formatDateTime(transaction.createdAt)}
        </p>
      </div>
    </DialogContent>
  )
}

export function TransactionTable({
  transactions,
  currency = 'USD',
  page,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
  onEdit,
  onDelete,
}: Props) {
  const [selected, setSelected] = useState<Transaction | null>(null)
  const firstLine = (note?: string | null) =>
    note?.split(/\r?\n/, 1)[0].trim() || ''
  const pageCount = Math.max(1, Math.ceil(total / pageSize))
  const pageNumbers = Array.from(
    { length: pageCount },
    (_, index) => index + 1,
  ).filter(
    (number) =>
      number === 1 || number === pageCount || Math.abs(number - page) <= 1,
  )

  const actionButtons = (transaction: Transaction) => (
    <div className="flex justify-end gap-1">
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={(event) => {
          event.stopPropagation()
          onEdit(transaction)
        }}
        aria-label={`Edit transaction ${transaction.id}`}
      >
        <Pencil />
      </Button>
      <Button
        variant="ghost"
        size="icon-sm"
        className="text-destructive hover:text-destructive"
        onClick={(event) => {
          event.stopPropagation()
          onDelete(transaction.id)
        }}
        aria-label={`Delete transaction ${transaction.id}`}
      >
        <Trash2 />
      </Button>
    </div>
  )

  return (
    <div className="overflow-hidden rounded-xl border">
      <div className="hidden md:block">
        <Table>
          <TableHeader className="bg-muted/40">
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-14 pl-5 text-muted-foreground">
                SL
              </TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Note</TableHead>
              <TableHead>Tags</TableHead>
              <TableHead className="text-center">Recurring</TableHead>
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((transaction, index) => (
              <TableRow
                key={transaction.id}
                tabIndex={0}
                role="button"
                className="cursor-pointer focus-visible:bg-muted/60 focus-visible:outline-none"
                onClick={() => setSelected(transaction)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault()
                    setSelected(transaction)
                  }
                }}
              >
                <TableCell className="pl-5 text-xs tabular-nums text-muted-foreground">
                  {(page - 1) * pageSize + index + 1}
                </TableCell>
                <TableCell
                  className="text-muted-foreground"
                  suppressHydrationWarning
                >
                  {formatDateOnly(transaction.date)}
                </TableCell>
                <TableCell>
                  <Category transaction={transaction} />
                </TableCell>
                <TableCell>
                  <Amount transaction={transaction} currency={currency} />
                </TableCell>
                <TableCell className="max-w-48 truncate text-muted-foreground">
                  {firstLine(transaction.note) || '—'}
                </TableCell>
                <TableCell>
                  <Tags tags={transaction.tags} limit={2} />
                </TableCell>
                <TableCell className="text-center">
                  {transaction.isRecurring && (
                    <Repeat2
                      className="mx-auto size-4 text-muted-foreground"
                      aria-label="Recurring transaction"
                    />
                  )}
                </TableCell>
                <TableCell className="pr-3">
                  {actionButtons(transaction)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="divide-y md:hidden">
        {transactions.map((transaction, index) => (
          <article
            key={transaction.id}
            tabIndex={0}
            role="button"
            onClick={() => setSelected(transaction)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault()
                setSelected(transaction)
              }
            }}
            className="cursor-pointer space-y-3 p-4 outline-none transition-colors hover:bg-muted/40 focus-visible:bg-muted/60"
          >
            <p className="text-[11px] font-medium text-muted-foreground">
              #{(page - 1) * pageSize + index + 1}
            </p>
            <div className="flex items-start justify-between gap-3">
              <Category transaction={transaction} />
              <Amount transaction={transaction} currency={currency} />
            </div>
            {firstLine(transaction.note) && (
              <p className="truncate text-sm text-muted-foreground">
                {firstLine(transaction.note)}
              </p>
            )}
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-2 text-xs text-muted-foreground">
                <time suppressHydrationWarning dateTime={transaction.date}>
                  {formatDateOnly(transaction.date)}
                </time>
                {transaction.isRecurring && (
                  <Repeat2
                    className="size-3.5 shrink-0"
                    aria-label="Recurring transaction"
                  />
                )}
              </div>
              {actionButtons(transaction)}
            </div>
            {transaction.tags.length > 0 && (
              <Tags tags={transaction.tags} limit={2} />
            )}
          </article>
        ))}
      </div>

      <div className="flex flex-col gap-3 border-t bg-muted/20 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center justify-center gap-3 sm:justify-start">
          <p className="text-xs text-muted-foreground">
            Showing {total ? (page - 1) * pageSize + 1 : 0}–{Math.min(page * pageSize, total)} of {total}
          </p>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Rows</span>
            <Select value={String(pageSize)} onValueChange={(value) => onPageSizeChange(Number(value))}>
              <SelectTrigger size="sm" className="w-18"><SelectValue /></SelectTrigger>
              <SelectContent align="end">
                {[5, 10, 20, 50].map((size) => <SelectItem key={size} value={String(size)}>{size}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex items-center justify-center gap-1">
          <Button
            variant="outline"
            size="icon-sm"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
            aria-label="Previous page"
          >
            <ChevronLeft />
          </Button>
          {pageNumbers.map((number, index) => (
            <div key={number} className="flex items-center gap-1">
              {index > 0 && number - pageNumbers[index - 1] > 1 && (
                <span className="px-1 text-muted-foreground">…</span>
              )}
              <Button
                variant={number === page ? 'default' : 'ghost'}
                size="icon-sm"
                onClick={() => onPageChange(number)}
                aria-label={`Page ${number}`}
                aria-current={number === page ? 'page' : undefined}
              >
                {number}
              </Button>
            </div>
          ))}
          <Button
            variant="outline"
            size="icon-sm"
            disabled={page >= pageCount}
            onClick={() => onPageChange(page + 1)}
            aria-label="Next page"
          >
            <ChevronRight />
          </Button>
        </div>
      </div>

      <Dialog
        open={!!selected}
        onOpenChange={(open) => !open && setSelected(null)}
      >
        {selected && (
          <TransactionDetails transaction={selected} currency={currency} />
        )}
      </Dialog>
    </div>
  )
}

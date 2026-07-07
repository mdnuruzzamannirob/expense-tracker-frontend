'use client'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useCreateCategoryMutation } from '@/hooks/useCategories'
import { extractErrorMessage } from '@/lib/api'
import { Plus, Tag } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { categorySchema } from '@/lib/schema'


interface CategoryAddModalProps {
  onSuccess?: () => void
  trigger?: React.ReactNode
  /** Custom label for the default button (defaults to "Add category") */
  label?: string
  /** Show as icon-only button (default: true when no label/children) */
  iconOnly?: boolean
  className?: string
}

export function CategoryAddModal({
  onSuccess,
  trigger,
  label,
  iconOnly,
  className,
}: CategoryAddModalProps) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [type, setType] = useState<'INCOME' | 'EXPENSE'>('EXPENSE')
  const [error, setError] = useState<string | null>(null)

  const createMutation = useCreateCategoryMutation()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const result = categorySchema.safeParse({ name: name.trim(), type })
    if (!result.success) {
      setError(result.error.issues[0]?.message ?? 'Validation failed')
      return
    }

    createMutation.mutate(
      { name: name.trim(), type },
      {
        onSuccess: () => {
          toast.success('Category created')
          setName('')
          setType('EXPENSE')
          setError(null)
          setOpen(false)
          onSuccess?.()
        },
        onError: (err) => {
          setError(extractErrorMessage(err, 'Could not create category'))
        },
      }
    )
  }

  const handleOpenChange = (next: boolean) => {
    setOpen(next)
    if (!next) {
      setName('')
      setType('EXPENSE')
      setError(null)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger render={<Button className="gap-1.5" />}>
        <Plus className="h-4 w-4" />
        {!iconOnly && label}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Tag className="h-5 w-5" />
            Add Category
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="categoryType">Type</Label>
            <Select
              value={type}
              onValueChange={(v) => setType(v as 'INCOME' | 'EXPENSE')}
            >
              <SelectTrigger id="categoryType" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="EXPENSE">Expense</SelectItem>
                <SelectItem value="INCOME">Income</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="categoryName">Name</Label>
            <Input
              id="categoryName"
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                if (error) setError(null)
              }}
              placeholder="e.g. Groceries, Salary"
              autoFocus
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={createMutation.isPending}
          >
            {createMutation.isPending ? 'Creating...' : 'Create Category'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

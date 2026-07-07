'use client'
import { CategoryAddModal } from '@/components/categories/CategoryAddModal'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  useCategoriesQuery,
  useDeleteCategoryMutation,
} from '@/hooks/useCategories'
import { extractErrorMessage } from '@/lib/api'
import { Plus, Tag, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

export default function CategoriesPage() {
  const query = useCategoriesQuery()
  const categories = query.data?.pages.flatMap((p) => p.data) ?? []
  const isLoading = query.isLoading
  const deleteMutation = useDeleteCategoryMutation()
  const [confirmDelete, setConfirmDelete] = useState<{
    id: string
    name: string
  } | null>(null)

  const handleConfirmDelete = () => {
    if (!confirmDelete) return
    deleteMutation.mutate(confirmDelete.id, {
      onSuccess: () => {
        toast.success('Category deleted')
        setConfirmDelete(null)
      },
      onError: (error) => {
        toast.error(extractErrorMessage(error, 'Could not delete category'))
      },
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Categories</h1>
        <CategoryAddModal
          iconOnly={false}
          label="Add Category"
          trigger={
            <Button className="gap-1.5">
              <Plus className="h-4 w-4" />
              Add Category
            </Button>
          }
        />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4 flex justify-between items-center">
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-12" />
                </div>
                <Skeleton className="size-8" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : categories && categories.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {categories.map((c) => (
            <Card key={c.id}>
              <CardContent className="p-4 flex justify-between items-center gap-2">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{c.name}</p>
                  <Badge
                    variant={c.type === 'INCOME' ? 'default' : 'destructive'}
                    className="mt-1"
                  >
                    {c.type}
                  </Badge>
                </div>
                <Tooltip>
                  <TooltipTrigger
                    render={
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          setConfirmDelete({ id: c.id, name: c.name })
                        }
                        disabled={deleteMutation.isPending}
                        aria-label={`Delete ${c.name}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    }
                  />
                  <TooltipContent>Delete category</TooltipContent>
                </Tooltip>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-12 flex flex-col items-center justify-center text-center text-muted-foreground">
            <Tag className="h-10 w-10 mb-3" />
            <p className="font-medium">No categories yet</p>
            <p className="text-sm">
              Create your first category to start organizing transactions.
            </p>
          </CardContent>
        </Card>
      )}

      <ConfirmDialog
        open={!!confirmDelete}
        onOpenChange={(open) => !open && setConfirmDelete(null)}
        title="Delete category?"
        description={
          confirmDelete
            ? `Are you sure you want to delete "${confirmDelete.name}"? This action cannot be undone.`
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

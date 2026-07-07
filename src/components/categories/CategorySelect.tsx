'use client'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useCategoriesQuery } from '@/hooks/useCategories'
import type { Category } from '@/types'
import { Loader2 } from 'lucide-react'
import * as React from 'react'

interface CategorySelectProps {
  value?: string
  onValueChange: (value: string) => void
  type?: 'INCOME' | 'EXPENSE'
  placeholder?: string
  id?: string
  invalid?: boolean
  emptyMessage?: string
  /** Page size for paginated fetch */
  pageSize?: number
  /** শুধু ঐ type এর categories দেখাবে (default: prop অনুযায়ী) */
  showAll?: boolean
}

export function CategorySelect({
  value,
  onValueChange,
  type,
  placeholder = 'Select category',
  id,
  invalid,
  emptyMessage,
  pageSize = 30,
  showAll = false,
}: CategorySelectProps) {
  const query = useCategoriesQuery(showAll ? undefined : type, {
    limit: pageSize,
  })
  const sentinelRef = React.useRef<HTMLDivElement | null>(null)
  const listRef = React.useRef<HTMLDivElement | null>(null)

  const allItems: Category[] = React.useMemo(
    () => query.data?.pages.flatMap((p) => p.data) ?? [],
    [query.data],
  )

  const items = React.useMemo(
    () =>
      showAll ? allItems : allItems.filter((c) => !type || c.type === type),
    [allItems, showAll, type],
  )

  const selectedItem = items.find((c) => c.id === value)

  // Scroll-based pagination: bottom এ পৌঁছালে next page load হবে
  React.useEffect(() => {
    const sentinel = sentinelRef.current
    const list = listRef.current
    if (!sentinel || !list) return

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (
          entry?.isIntersecting &&
          query.hasNextPage &&
          !query.isFetchingNextPage
        ) {
          query.fetchNextPage()
        }
      },
      { root: list, rootMargin: '0px 0px 100px 0px', threshold: 0 },
    )

    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [query])

  return (
    <Select
      value={value || ''}
      onValueChange={(val) => onValueChange(val ?? '')}
    >
      {' '}
      <SelectTrigger id={id} className="w-full" aria-invalid={invalid}>
        <SelectValue placeholder={placeholder}>
          {selectedItem ? selectedItem.name : placeholder}
        </SelectValue>
      </SelectTrigger>
      <SelectContent className="p-0">
        <div ref={listRef} className="max-h-72 overflow-y-auto p-1">
          {query.isLoading ? (
            <div className="flex items-center justify-center gap-2 py-6 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading...
            </div>
          ) : items.length === 0 ? (
            <div className="px-2 py-6 text-sm text-muted-foreground text-center">
              {emptyMessage ?? 'No categories found'}
            </div>
          ) : (
            <>
              {items.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
              <div ref={sentinelRef} className="h-1" aria-hidden="true" />
              {(query.hasNextPage || query.isFetchingNextPage) && (
                <div className="flex items-center justify-center py-2 text-xs text-muted-foreground">
                  {query.isFetchingNextPage ? (
                    <span className="flex items-center gap-1.5">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      Loading more...
                    </span>
                  ) : (
                    'Scroll for more'
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </SelectContent>
    </Select>
  )
}

'use client'

import { format } from 'date-fns'
import { CalendarIcon } from 'lucide-react'
import * as React from 'react'

import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'

interface DatePickerProps {
  value?: string // ISO date string (yyyy-MM-dd) or full ISO
  onChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
  id?: string
  className?: string
  // Defaults to "yyyy-MM-dd" for form submission compatibility.
  outputFormat?: 'yyyy-MM-dd' | "yyyy-MM-dd'T'HH:mm:ss.SSSxxx"
}

/**
 * A controlled date picker built on top of Popover + Calendar.
 *
 * The `value` is an ISO date string. The `onChange` callback receives the
 * formatted string in `outputFormat` (default: yyyy-MM-dd) so the parent
 * form can pass it directly to a backend that expects that shape.
 */
function DatePicker({
  value,
  onChange,
  placeholder = 'Pick a date',
  disabled,
  id,
  className,
  outputFormat = 'yyyy-MM-dd',
}: DatePickerProps) {
  const selectedDate = React.useMemo(() => {
    if (!value) return undefined
    const d = new Date(value)
    return Number.isNaN(d.getTime()) ? undefined : d
  }, [value])

  return (
    <Popover>
      <PopoverTrigger
        id={id}
        disabled={disabled}
        render={
          <Button
            type="button"
            variant="outline"
            disabled={disabled}
            className={cn(
              'w-full justify-start text-left font-normal',
              !selectedDate && 'text-muted-foreground',
              className,
            )}
          />
        }
      >
        <CalendarIcon className="mr-2 size-4" />
        {selectedDate ? format(selectedDate, 'PPP') : placeholder}
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={(date) => {
            if (!date) {
              onChange('')
              return
            }
            onChange(format(date, outputFormat))
          }}
        />
      </PopoverContent>
    </Popover>
  )
}

export { DatePicker }

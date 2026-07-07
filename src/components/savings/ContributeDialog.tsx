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
import { PlusCircle } from 'lucide-react'
import { useState } from 'react'

interface Props {
  goalId: string
  onContribute: (goalId: string, amount: number) => void
}

export function ContributeDialog({ goalId, onContribute }: Props) {
  const [amount, setAmount] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [open, setOpen] = useState(false)

  const handleSubmit = () => {
    const parsed = parseFloat(amount)
    if (Number.isNaN(parsed) || parsed <= 0) {
      setError('Enter a positive amount')
      return
    }
    onContribute(goalId, parsed)
    setAmount('')
    setError(null)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button
            type="button"
            size="icon"
            variant="outline"
            aria-label="Contribute to goal"
          />
        }
      >
        <PlusCircle className="h-4 w-4" />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Contribution</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleSubmit()
          }}
          className="space-y-4"
        >
          <div className="space-y-1.5">
            <Label htmlFor={`contribute-amount-${goalId}`}>Amount</Label>
            <Input
              id={`contribute-amount-${goalId}`}
              type="number"
              step="0.01"
              inputMode="decimal"
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value)
                if (error) setError(null)
              }}
              autoFocus
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
          <Button type="submit" className="w-full">
            Add Contribution
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

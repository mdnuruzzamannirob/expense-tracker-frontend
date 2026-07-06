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
import { useState } from 'react'

interface Props {
  goalId: string
  onContribute: (goalId: string, amount: number) => void
}

export function ContributeDialog({ goalId, onContribute }: Props) {
  const [amount, setAmount] = useState('')

  return (
    <Dialog>
      <DialogTrigger render={<Button size="sm" variant="outline" />}>
        Contribute
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Contribution</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
          <Button
            className="w-full"
            onClick={() => {
              onContribute(goalId, parseFloat(amount))
              setAmount('')
            }}
          >
            Add
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

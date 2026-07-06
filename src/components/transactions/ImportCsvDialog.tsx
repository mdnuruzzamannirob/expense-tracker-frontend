'use client'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { useImportTransactionsMutation } from '@/hooks/useTransactions'
import { toast } from 'sonner'

export function ImportCsvDialog() {
  const importMutation = useImportTransactionsMutation()

  const handleFile = (file: File) => {
    importMutation.mutate(file, {
      onSuccess: () => toast.success('CSV imported successfully'),
      onError: () => toast.error('Import failed - check file format'),
    })
  }

  return (
    <Dialog>
      <DialogTrigger>
        <Button variant="outline">Import CSV</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Import Transactions</DialogTitle>
        </DialogHeader>
        <div
          className="border-2 border-dashed rounded-md p-8 text-center text-sm text-muted-foreground cursor-pointer"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault()
            const f = e.dataTransfer.files?.[0]
            if (f) handleFile(f)
          }}
          onClick={() => document.getElementById('csv-input')?.click()}
        >
          {importMutation.isPending
            ? 'Importing...'
            : 'Drag & drop a CSV file here, or click to select'}
          <input
            type="file"
            accept=".csv"
            className="hidden"
            id="csv-input"
            onChange={(e) =>
              e.target.files?.[0] && handleFile(e.target.files[0])
            }
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}

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
import { extractErrorMessage } from '@/lib/api'
import { FileSpreadsheet, Upload } from 'lucide-react'
import { toast } from 'sonner'

export function ImportCsvDialog() {
  const importMutation = useImportTransactionsMutation()

  const handleFile = (file: File) => {
    importMutation.mutate(file, {
      onSuccess: () => toast.success('CSV imported successfully'),
      onError: (error) =>
        toast.error(
          extractErrorMessage(
            error,
            'Import failed. Please check the file format and try again.',
          ),
        ),
    })
  }

  return (
    <Dialog>
      <DialogTrigger render={<Button variant="outline" className="gap-1.5" />}>
        <Upload className="h-4 w-4" />
        Import CSV
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Import Transactions</DialogTitle>
        </DialogHeader>
        <div
          className="border-2 border-dashed rounded-md p-8 text-center text-sm text-muted-foreground cursor-pointer hover:bg-muted/30 transition-colors"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault()
            const f = e.dataTransfer.files?.[0]
            if (f) handleFile(f)
          }}
          onClick={() => document.getElementById('csv-input')?.click()}
        >
          <FileSpreadsheet className="h-10 w-10 mx-auto mb-3" />
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

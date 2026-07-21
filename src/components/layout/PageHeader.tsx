import type { ReactNode } from 'react'

type PageHeaderProps = {
  title: string
  description: string
  actions?: ReactNode
}

export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:justify-between">
      <div className="min-w-0 space-y-1">
        <h1 className="text-2xl tracking-normal text-foreground sm:text-3xl">
          {title}
        </h1>
        <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
          {description}
        </p>
      </div>
      {actions ? (
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center sm:justify-end *:w-full sm:*:w-auto">
          {actions}
        </div>
      ) : null}
    </div>
  )
}

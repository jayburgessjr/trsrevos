import * as React from 'react'
import { cn } from '@/lib/utils'

type TableProps = React.HTMLAttributes<HTMLTableElement>

type TableSubComponentProps<T extends HTMLElement> = React.HTMLAttributes<T>

export function Table({ className, ...props }: TableProps) {
  return (
    <div className="overflow-x-auto">
      <table
        className={cn(
          'min-w-full divide-y divide-border text-left text-sm text-foreground',
          className,
        )}
        {...props}
      />
    </div>
  )
}

export function TableHeader({ className, ...props }: TableSubComponentProps<HTMLTableSectionElement>) {
  return <thead className={cn('bg-muted', className)} {...props} />
}

export function TableBody({ className, ...props }: TableSubComponentProps<HTMLTableSectionElement>) {
  return <tbody className={cn('divide-y divide-border bg-card', className)} {...props} />
}

export function TableRow({ className, ...props }: TableSubComponentProps<HTMLTableRowElement>) {
  return <tr className={cn('transition hover:bg-muted', className)} {...props} />
}

export function TableHead({ className, ...props }: React.ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      className={cn('px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground', className)}
      {...props}
    />
  )
}

export function TableCell({ className, ...props }: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return <td className={cn('px-4 py-3 align-top text-sm text-foreground', className)} {...props} />
}

import * as React from 'react'
import { cn } from '@/lib/utils'

type TableProps = React.HTMLAttributes<HTMLTableElement>

type TableSubComponentProps<T extends HTMLElement> = React.HTMLAttributes<T>

export function Table({ className, ...props }: TableProps) {
  return (
    <div className="overflow-x-auto">
      <table
        className={cn(
          'min-w-full divide-y divide-slate-200 dark:divide-slate-800 text-left text-sm text-slate-900 dark:text-slate-100',
          className,
        )}
        {...props}
      />
    </div>
  )
}

export function TableHeader({ className, ...props }: TableSubComponentProps<HTMLTableSectionElement>) {
  return <thead className={cn('bg-slate-50 dark:bg-slate-900', className)} {...props} />
}

export function TableBody({ className, ...props }: TableSubComponentProps<HTMLTableSectionElement>) {
  return <tbody className={cn('divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-[#121212]', className)} {...props} />
}

export function TableRow({ className, ...props }: TableSubComponentProps<HTMLTableRowElement>) {
  return <tr className={cn('transition hover:bg-slate-50 dark:hover:bg-slate-900', className)} {...props} />
}

export function TableHead({ className, ...props }: React.ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      className={cn('px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-400', className)}
      {...props}
    />
  )
}

export function TableCell({ className, ...props }: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return <td className={cn('px-4 py-3 align-top text-sm text-slate-900 dark:text-slate-100', className)} {...props} />
}

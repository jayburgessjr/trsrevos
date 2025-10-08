import * as React from 'react'
export function Progress({ value=0, className='' }:{ value?: number; className?: string }) {
  const pct = Math.max(0, Math.min(100, value))
  return <div className={`h-2 w-full rounded bg-neutral-200 ${className}`}>
    <div className="h-2 rounded bg-neutral-900" style={{ width: pct + '%' }} />
  </div>
}

import * as React from 'react'
type Props = React.HTMLAttributes<HTMLSpanElement> & { variant?: 'outline'|'secondary'|undefined }
export function Badge({ className='', variant, ...props }: Props) {
  const v = variant==='outline' ? 'border' : 'bg-neutral-200'
  return <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs ${v} ${className}`} {...props} />
}

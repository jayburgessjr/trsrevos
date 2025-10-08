import * as React from 'react'
type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'outline'|'secondary'|undefined; size?: 'sm'|'icon'|undefined }
export function Button({ className='', variant, size, ...props }: Props) {
  const base = 'inline-flex items-center justify-center rounded-md px-3 py-2 text-sm transition'
  const v = variant==='outline' ? 'border bg-white hover:bg-neutral-50' : variant==='secondary' ? 'bg-neutral-900 text-white hover:opacity-90' : 'bg-neutral-900 text-white hover:opacity-90'
  const s = size==='sm' ? 'h-8 px-2' : size==='icon' ? 'h-8 w-8 p-0' : ''
  return <button className={`${base} ${v} ${s} ${className}`} {...props} />
}

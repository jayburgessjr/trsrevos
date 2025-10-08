import * as React from 'react'
export function Card({ className='', ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={`border bg-white ${className}`} {...props} />
}
export function CardHeader({ className='', ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={`border-b p-3 ${className}`} {...props} />
}
export function CardTitle({ className='', ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={`font-semibold ${className}`} {...props} />
}
export function CardContent({ className='', ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={`p-3 ${className}`} {...props} />
}

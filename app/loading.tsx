import { Skeleton } from '@/ui/skeleton'

export default function Loading() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-6 py-12">
      <Skeleton className="h-24 w-full" />
      <Skeleton className="h-48 w-full" />
      <Skeleton className="h-48 w-full" />
    </div>
  )
}

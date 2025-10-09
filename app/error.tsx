'use client'

import { Button } from '@/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/ui/card'

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col justify-center px-6 py-12">
      <Card>
        <CardHeader>
          <CardTitle>Something went wrong</CardTitle>
          <CardDescription>We&apos;re logging this failure. Try again or refresh the page.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-[color:var(--color-text-muted)]">
          <p>{error.message}</p>
          <Button type="button" variant="primary" size="sm" onClick={() => reset()}>
            Try again
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

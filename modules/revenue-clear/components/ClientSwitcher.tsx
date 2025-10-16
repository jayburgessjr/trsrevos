'use client'

import { useTransition, type ChangeEvent } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'

import { Select } from '@/ui/select'

export type ClientSwitcherOption = {
  id: string
  name: string
  industry?: string | null
}

type ClientSwitcherProps = {
  clients: ClientSwitcherOption[]
  activeClientId: string
}

export function ClientSwitcher({ clients, activeClientId }: ClientSwitcherProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const handleChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const nextClientId = event.target.value
    const params = new URLSearchParams(searchParams?.toString() ?? '')
    params.set('clientId', nextClientId)
    const query = params.toString()

    startTransition(() => {
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false })
    })
  }

  return (
    <div className="flex w-full flex-col gap-2 rounded-lg border border-[color:var(--color-border)] bg-white p-4 shadow-sm lg:w-auto">
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--color-text-muted)]">
          Active client
        </span>
        {isPending ? (
          <span className="text-[11px] font-medium uppercase tracking-wide text-[color:var(--color-text-muted)]">
            Updating…
          </span>
        ) : null}
      </div>
      <Select
        value={activeClientId}
        onChange={handleChange}
        className="w-full min-w-[12rem] rounded-md border border-[color:var(--color-border)] bg-white py-2 text-sm font-medium text-[color:var(--color-text)] focus-visible:border-[color:var(--color-accent)] focus-visible:ring-[color:var(--color-accent)] lg:w-64"
      >
        {clients.map((client) => (
          <option key={client.id} value={client.id} className="bg-white text-[color:var(--color-text)]">
            {client.name}
            {client.industry ? ` · ${client.industry}` : ''}
          </option>
        ))}
      </Select>
      <p className="text-[11px] leading-relaxed text-[color:var(--color-text-muted)]">
        {isPending
          ? 'Loading Revenue Clear workspace…'
          : 'Choose a client to load their guided Revenue Clear workflow.'}
      </p>
    </div>
  )
}

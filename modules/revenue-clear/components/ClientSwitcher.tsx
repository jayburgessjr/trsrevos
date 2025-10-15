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
    <div className="flex w-full flex-col gap-3 rounded-2xl border border-white/10 bg-white/10 p-4 text-white shadow-inner shadow-black/30 backdrop-blur-sm lg:w-auto">
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs font-semibold uppercase tracking-[0.18em] text-white/60">Active Client</span>
        {isPending ? (
          <span className="text-[11px] font-medium uppercase tracking-wide text-white/50">Updating…</span>
        ) : null}
      </div>
      <Select
        value={activeClientId}
        onChange={handleChange}
        className="w-full min-w-[12rem] rounded-xl border-white/20 bg-[#090b14] py-2 text-sm font-medium text-white/90 focus-visible:border-white/40 focus-visible:ring-white/40 lg:w-64"
      >
        {clients.map((client) => (
          <option key={client.id} value={client.id} className="bg-[#090b14] text-white">
            {client.name}
            {client.industry ? ` · ${client.industry}` : ''}
          </option>
        ))}
      </Select>
      <p className="text-[11px] leading-relaxed text-white/60">
        {isPending
          ? 'Loading Revenue Clear workspace…'
          : 'Choose a client to load their guided Revenue Clear workflow.'}
      </p>
    </div>
  )
}

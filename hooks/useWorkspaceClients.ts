'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import type { PostgrestError } from '@supabase/supabase-js'

import { listClients } from '@/core/clients/store'
import type { Client } from '@/core/clients/types'
import { reportClientError } from '@/lib/telemetry'
import { supabase } from '@/lib/supabaseClient'

const HAS_SUPABASE_CREDENTIALS = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
)

export type WorkspaceClient = {
  id: string
  name: string
  ownerId: string | null
  ownerName: string | null
  arr: number | null
  health: number | null
  churnRisk: number | null
  qbrDate: string | null
  phase: string | null
  status: string | null
  isExpansion: boolean | null
}

export type UseWorkspaceClientsOptions = {
  limit?: number
  refreshIntervalMs?: number | null
}

export type UseWorkspaceClientsState = {
  clients: WorkspaceClient[]
  isLoading: boolean
  error: PostgrestError | null
  usingFallback: boolean
}

type SupabaseClientRow = {
  id: string
  name: string | null
  status: string | null
  phase: string | null
  owner_id: string | null
  arr: number | string | null
  health: number | null
  churn_risk: number | null
  qbr_date: string | null
  is_expansion: boolean | null
  owner: { name: string | null } | { name: string | null }[] | null
}

const mapStoreClient = (client: Client): WorkspaceClient => ({
  id: client.id,
  name: client.name,
  ownerId: client.owner,
  ownerName: client.owner,
  arr: client.arr ?? null,
  health: client.health ?? null,
  churnRisk: client.churnRisk ?? null,
  qbrDate: client.qbrDate ?? null,
  phase: client.phase,
  status: client.status ?? 'active',
  isExpansion: client.isExpansion ?? null,
})

const mapSupabaseRow = (row: SupabaseClientRow): WorkspaceClient => {
  const owner = Array.isArray(row.owner) ? row.owner.at(0) : row.owner

  return {
    id: row.id,
    name: row.name ?? 'Unnamed Client',
    ownerId: row.owner_id,
    ownerName: owner?.name ?? null,
    arr: row.arr != null ? Number(row.arr) : null,
    health: row.health,
    churnRisk: row.churn_risk,
    qbrDate: row.qbr_date,
    phase: row.phase,
    status: row.status,
    isExpansion: row.is_expansion,
  }
}

async function fetchWorkspaceClients(limit: number): Promise<WorkspaceClient[]> {
  const { data, error } = await supabase
    .from('clients')
    .select(
      'id, name, status, phase, owner_id, arr, health, churn_risk, qbr_date, is_expansion, owner:users!clients_owner_id_fkey(name)',
    )
    .order('updated_at', { ascending: false })
    .limit(limit)

  if (error) {
    throw error
  }

  return (data ?? []).map(mapSupabaseRow)
}

export function useWorkspaceClients({
  limit = 200,
  refreshIntervalMs = 60_000,
}: UseWorkspaceClientsOptions = {}): UseWorkspaceClientsState {
  const fallbackClients = useMemo(() => listClients().map(mapStoreClient), [])
  const lastGoodClientsRef = useRef<WorkspaceClient[] | null>(
    HAS_SUPABASE_CREDENTIALS ? null : fallbackClients,
  )

  const [state, setState] = useState<UseWorkspaceClientsState>({
    clients: HAS_SUPABASE_CREDENTIALS ? [] : fallbackClients,
    isLoading: HAS_SUPABASE_CREDENTIALS,
    error: null,
    usingFallback: !HAS_SUPABASE_CREDENTIALS,
  })

  useEffect(() => {
    if (!HAS_SUPABASE_CREDENTIALS) {
      return
    }

    let aborted = false

    async function load() {
      setState((prev) => ({ ...prev, isLoading: true }))

      try {
        const clients = await fetchWorkspaceClients(limit)
        if (aborted) {
          return
        }

        lastGoodClientsRef.current = clients
        setState({ clients, isLoading: false, error: null, usingFallback: false })
      } catch (error) {
        if (aborted) {
          return
        }

        reportClientError('workspace_clients_fetch_failed', error, { limit })

        const fallback = lastGoodClientsRef.current ?? fallbackClients
        const usingFallback = fallback === fallbackClients

        setState({
          clients: fallback,
          isLoading: false,
          error: error as PostgrestError,
          usingFallback,
        })
      }
    }

    load()

    if (refreshIntervalMs && refreshIntervalMs > 0) {
      const id = window.setInterval(load, refreshIntervalMs)
      return () => {
        aborted = true
        window.clearInterval(id)
      }
    }

    return () => {
      aborted = true
    }
  }, [fallbackClients, limit, refreshIntervalMs])

  return state
}

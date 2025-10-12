import { notFound } from 'next/navigation'

import { getActivity } from '@/core/clients/actions'
import type { ActivityItem, ClientDeliverable, ClientStrategy, DataRequirement, DiscoveryResponse, QRARun } from '@/core/clients/types'
import ClientWorkspace, { ClientFinance, ClientWorkspaceClient, TabKey } from './ClientWorkspace'
import { createServerClient } from '@/lib/supabase/server'

const TAB_KEYS: TabKey[] = ['discovery', 'data', 'algorithm', 'architecture', 'deliverables', 'finance', 'activity']

export default async function ClientPage({
  params,
  searchParams,
}: {
  params: { id: string }
  searchParams?: { tab?: string }
}) {
  const supabase = createServerClient()
  const activeTabParam = (searchParams?.tab ?? '').toLowerCase()
  const initialTab = (TAB_KEYS.includes(activeTabParam as TabKey) ? (activeTabParam as TabKey) : 'discovery') as TabKey

  const { data: clientRow, error: clientError } = await supabase
    .from('clients')
    .select(
      `id, name, segment, industry, region, arr, health, phase, status, notes, qbr_date, owner:users!clients_owner_id_fkey(name, email)`,
    )
    .eq('id', params.id)
    .maybeSingle()

  if (clientError) {
    throw clientError
  }

  if (!clientRow) {
    notFound()
  }

  const [financeRow, discoveryRows, requirementRows, qraRows, strategyRows, deliverableRows, activity] = await Promise.all([
    supabase
      .from('finance')
      .select('id, client_id, arrangement_type, equity_stake_pct, projection_mrr, monthly_recurring_revenue, outstanding_invoices, updated_at')
      .eq('client_id', params.id)
      .maybeSingle(),
    supabase
      .from('discovery_responses')
      .select('*')
      .eq('client_id', params.id)
      .order('form_type', { ascending: true }),
    supabase
      .from('data_requirements')
      .select('*')
      .eq('client_id', params.id)
      .order('created_at', { ascending: true }),
    supabase
      .from('qra_runs')
      .select('*')
      .eq('client_id', params.id)
      .order('created_at', { ascending: false }),
    supabase
      .from('client_strategies')
      .select('*')
      .eq('client_id', params.id)
      .order('created_at', { ascending: false }),
    supabase
      .from('client_deliverables')
      .select('id, client_id, title, name, type, url, link, share_expires_at, meta, created_at')
      .eq('client_id', params.id)
      .order('created_at', { ascending: false }),
    getActivity(params.id),
  ])

  if (financeRow.error) throw financeRow.error
  if (discoveryRows.error) throw discoveryRows.error
  if (requirementRows.error) throw requirementRows.error
  if (qraRows.error) throw qraRows.error
  if (strategyRows.error) throw strategyRows.error
  if (deliverableRows.error) throw deliverableRows.error

  const ownerRecord = Array.isArray(clientRow.owner)
    ? clientRow.owner[0]
    : clientRow.owner

  const client: ClientWorkspaceClient = {
    id: clientRow.id,
    name: clientRow.name,
    segment: clientRow.segment,
    industry: clientRow.industry,
    region: clientRow.region,
    arr: clientRow.arr,
    health: clientRow.health,
    phase: clientRow.phase,
    status: clientRow.status,
    notes: clientRow.notes,
    ownerName: ownerRecord?.name ?? null,
    ownerEmail: ownerRecord?.email ?? null,
    qbrDate: clientRow.qbr_date,
  }

  const finance: ClientFinance | null = financeRow.data ?? null

  const discoveryResponses = (discoveryRows.data ?? []) as DiscoveryResponse[]
  const dataRequirements = (requirementRows.data ?? []) as DataRequirement[]
  const qraRuns = (qraRows.data ?? []) as QRARun[]
  const strategies = (strategyRows.data ?? []) as ClientStrategy[]
  const deliverables = (deliverableRows.data ?? []) as ClientDeliverable[]
  const activityItems = activity as ActivityItem[]

  return (
    <div className="min-h-screen bg-white text-black">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-6 py-6">
        <ClientWorkspace
          client={client}
          finance={finance}
          discoveryResponses={discoveryResponses}
          dataRequirements={dataRequirements}
          qraRuns={qraRuns}
          strategies={strategies}
          deliverables={deliverables}
          activity={activityItems}
          initialTab={initialTab}
        />
      </div>
    </div>
  )
}

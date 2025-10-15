"use server"

import type { PostgrestError } from "@supabase/supabase-js"

import { createClient } from "@/lib/supabase/server"
import type { ClientHealthSnapshot } from "./types"

type ClientHealthRow = {
  client_id: string
  snapshot_date: string
  health: number | null
  churn_risk: number | null
  trs_score: number | null
  notes: string | null
  client?: { name: string | null } | { name: string | null }[] | null
}

const hasSupabaseCredentials = () =>
  Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

export type ClientRow = {
  id: string
  name: string
  status: string | null
  stage: string | null
  health: string | null
  owner_id: string | null
  arr: number | null
  created_at: string
  phase: string | null
  organization_id: string | null
}

export type ClientOverview = {
  client_id: string
  client_name: string
  client_type: string | null
  organization_id: string | null
  owner_id: string | null
  pipeline_id: string | null
  pipeline_stage: string | null
  pipeline_value: number | null
  weighted_value: number | null
  probability: number | null
  finance_id: string | null
  mrr: number | null
  ar_outstanding: number | null
  ar_collected: number | null
}

export type OwnerRow = {
  id: string
  email: string | null
  full_name: string | null
  role: string | null
}

export type ProjectRecord = {
  id: string
  client_id: string
  name: string
  status: string | null
  health: string | null
  start_date: string | null
  end_date: string | null
  progress?: number | null
  budget?: number | null
  spent?: number | null
}

export type OpportunityRecord = {
  id: string
  client_id: string
  name: string | null
  stage: string | null
  amount: number | null
  probability: number | null
  next_step: string | null
  next_step_date: string | null
  close_date: string | null
  owner_id: string | null
}

const CLIENT_HEALTH_HISTORY_FALLBACK: ClientHealthRow[] = [
  {
    client_id: 'acme',
    snapshot_date: '2025-07-15',
    health: 68,
    churn_risk: 16,
    trs_score: 72,
    notes: 'Collections automation deployed',
    client: { name: 'ACME Industries' },
  },
  {
    client_id: 'acme',
    snapshot_date: '2025-08-20',
    health: 72,
    churn_risk: 14,
    trs_score: 78,
    notes: 'Executive sponsor engaged',
    client: { name: 'ACME Industries' },
  },
  {
    client_id: 'acme',
    snapshot_date: '2025-09-25',
    health: 76,
    churn_risk: 12,
    trs_score: 82,
    notes: 'Pricing uplift live',
    client: { name: 'ACME Industries' },
  },
  {
    client_id: 'globex',
    snapshot_date: '2025-07-01',
    health: 60,
    churn_risk: 22,
    trs_score: 64,
    notes: 'Integration blockers identified',
    client: { name: 'Globex Retail' },
  },
  {
    client_id: 'globex',
    snapshot_date: '2025-08-10',
    health: 63,
    churn_risk: 20,
    trs_score: 66,
    notes: 'Data contract renewed',
    client: { name: 'Globex Retail' },
  },
  {
    client_id: 'globex',
    snapshot_date: '2025-09-22',
    health: 67,
    churn_risk: 18,
    trs_score: 70,
    notes: 'Pilot conversion trending up',
    client: { name: 'Globex Retail' },
  },
  {
    client_id: 'northwave',
    snapshot_date: '2025-07-30',
    health: 54,
    churn_risk: 26,
    trs_score: 58,
    notes: 'Data trust remediation launched',
    client: { name: 'Northwave Analytics' },
  },
  {
    client_id: 'northwave',
    snapshot_date: '2025-09-12',
    health: 58,
    churn_risk: 22,
    trs_score: 60,
    notes: 'Success plan activated',
    client: { name: 'Northwave Analytics' },
  },
]

async function getClient() {
  const supabase = await createClient()
  return supabase
}

export async function fetchClientsForProjects() {
  if (!hasSupabaseCredentials()) {
    return [] as ClientRow[]
  }
  const supabase = await getClient()
  const { data, error } = await supabase
    .from("clients")
    .select(
      "id,name,status,stage,health,owner_id,arr,created_at,phase,organization_id",
    )
    .order("created_at", { ascending: false })

  if (error) throw error
  return (data ?? []) as ClientRow[]
}

export async function fetchOverviewJoin() {
  if (!hasSupabaseCredentials()) {
    return [] as ClientOverview[]
  }
  const supabase = await getClient()
  const { data, error } = await supabase.from("vw_client_overview").select("*")

  if (error) {
    if (isMissingRelationError(error)) {
      console.warn(
        "[projects] vw_client_overview view is missing in Supabase – returning empty overview data.",
      )
      return [] as ClientOverview[]
    }
    throw error
  }
  return (data ?? []) as ClientOverview[]
}

export async function fetchOwners() {
  if (!hasSupabaseCredentials()) {
    return [] as OwnerRow[]
  }
  const supabase = await getClient()
  const { data, error } = await supabase
    .from("users")
    .select("id,email,full_name,role")
    .order("email", { ascending: true })

  if (error) throw error
  return (data ?? []) as OwnerRow[]
}

export async function fetchProjects() {
  if (!hasSupabaseCredentials()) {
    return [] as ProjectRecord[]
  }
  const supabase = await getClient()
  const { data, error } = await supabase
    .from("projects")
    .select("id,client_id,name,status,health,start_date,end_date,progress,budget,spent")
    .order("start_date", { ascending: true })

  if (error) {
    if (isMissingRelationError(error)) {
      console.warn(
        "[projects] projects table is missing in Supabase – returning empty project data.",
      )
      return [] as ProjectRecord[]
    }
    throw error
  }
  return (data ?? []) as ProjectRecord[]
}

export async function fetchOpportunities() {
  if (!hasSupabaseCredentials()) {
    return [] as OpportunityRecord[]
  }
  const supabase = await getClient()
  const { data, error } = await supabase
    .from("opportunities")
    .select(
      "id,client_id,name,stage,amount,probability,next_step,next_step_date,close_date,owner_id",
    )

  if (error) {
    if (isMissingRelationError(error)) {
      console.warn(
        "[projects] opportunities table is missing in Supabase – returning empty opportunity data.",
      )
      return [] as OpportunityRecord[]
    }
    throw error
  }
  return (data ?? []) as OpportunityRecord[]
}

function isMissingRelationError(error: PostgrestError) {
  return error.code === "42P01"
}

function deriveHealthSentiment(health: number | null, churnRisk: number | null) {
  const healthScore = typeof health === "number" ? health : 0
  const churnScore = typeof churnRisk === "number" ? churnRisk : 0

  if (healthScore >= 70 && churnScore <= 15) {
    return "Positive" as const
  }
  if (healthScore <= 55 || churnScore >= 25) {
    return "Caution" as const
  }
  return "Neutral" as const
}

function resolveClientName(client: ClientHealthRow["client"]) {
  if (!client) {
    return "Unknown Client"
  }
  if (Array.isArray(client)) {
    return client[0]?.name ?? "Unknown Client"
  }
  return client.name ?? "Unknown Client"
}

function mapHealthRow(row: ClientHealthRow): ClientHealthSnapshot {
  return {
    clientId: row.client_id,
    clientName: resolveClientName(row.client),
    snapshotDate: row.snapshot_date,
    health: row.health,
    churnRisk: row.churn_risk,
    trsScore: row.trs_score,
    notes: row.notes,
    sentiment: deriveHealthSentiment(row.health, row.churn_risk),
  }
}

export async function fetchClientHealthHistory(): Promise<ClientHealthSnapshot[]> {
  if (!hasSupabaseCredentials()) {
    return CLIENT_HEALTH_HISTORY_FALLBACK.map((row) => mapHealthRow(row))
  }

  const supabase = await getClient()
  const { data, error } = await supabase
    .from("client_health_history")
    .select(
      `client_id,snapshot_date,health,churn_risk,trs_score,notes,client:clients!client_health_history_client_id_fkey(name)`,
    )
    .order("snapshot_date", { ascending: true })

  if (error || !data) {
    if (error) {
      console.error("Error fetching client health history", error)
    }
    return CLIENT_HEALTH_HISTORY_FALLBACK.map((row) => mapHealthRow(row))
  }

  return (data as ClientHealthRow[]).map((row) => mapHealthRow(row))
}

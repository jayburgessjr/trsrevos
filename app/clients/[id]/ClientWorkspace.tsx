'use client'

import { useMemo, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'

import { Badge } from '@/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/ui/tabs'

import {
  ActivityItem,
  ClientDeliverable,
  ClientStrategy,
  DataRequirement,
  DiscoveryResponse,
  QRARun,
} from '@/core/clients/types'
import { StrategyVariant } from '@/core/qra/engine'

import DiscoveryTab from './tabs/DiscoveryTab'
import DataTab from './tabs/DataTab'
import AlgorithmTab from './tabs/AlgorithmTab'
import ArchitectureTab from './tabs/ArchitectureTab'
import DeliverablesTab from './tabs/DeliverablesTab'
import FinanceTab from './tabs/FinanceTab'
import ActivityTab from './tabs/ActivityTab'

const TAB_ITEMS: { key: TabKey; label: string }[] = [
  { key: 'discovery', label: 'Discovery' },
  { key: 'data', label: 'Data' },
  { key: 'algorithm', label: 'Algorithm' },
  { key: 'architecture', label: 'Architecture' },
  { key: 'deliverables', label: 'Deliverables' },
  { key: 'finance', label: 'Finance' },
  { key: 'activity', label: 'Activity' },
]

export type TabKey =
  | 'discovery'
  | 'data'
  | 'algorithm'
  | 'architecture'
  | 'deliverables'
  | 'finance'
  | 'activity'

export type ClientWorkspaceClient = {
  id: string
  name: string
  segment: string | null
  industry: string | null
  region: string | null
  arr: number | null
  health: number | null
  phase: string | null
  status: string | null
  notes: string | null
  ownerName: string | null
  ownerEmail: string | null
  qbrDate: string | null
}

export type ClientFinance = {
  id?: string
  client_id?: string
  arrangement_type?: string | null
  equity_stake_pct?: number | null
  projection_mrr?: number | null
  monthly_recurring_revenue?: number | null
  outstanding_invoices?: number | null
  updated_at?: string | null
}

type ClientWorkspaceProps = {
  client: ClientWorkspaceClient
  finance: ClientFinance | null
  discoveryResponses: DiscoveryResponse[]
  dataRequirements: DataRequirement[]
  qraRuns: QRARun[]
  strategies: ClientStrategy[]
  deliverables: ClientDeliverable[]
  activity: ActivityItem[]
  generatedStrategies?: StrategyVariant[]
  initialTab: TabKey
}

const healthFormatter = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 0,
})

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
})

export default function ClientWorkspace({
  client,
  finance,
  discoveryResponses,
  dataRequirements,
  qraRuns,
  strategies,
  deliverables,
  activity,
  generatedStrategies,
  initialTab,
}: ClientWorkspaceProps) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const router = useRouter()

  const [activeTab, setActiveTab] = useState<TabKey>(initialTab)

  const activeStrategy = useMemo(
    () => strategies.find((strategy) => strategy.status === 'active') ?? null,
    [strategies],
  )

  const latestQraRun = useMemo(() => (qraRuns.length ? qraRuns[0] : null), [qraRuns])

  const handleTabChange = (value: string) => {
    const key = TAB_ITEMS.find((item) => item.key === value)?.key ?? initialTab
    setActiveTab(key)
    const params = new URLSearchParams(searchParams.toString())
    if (key === 'discovery') {
      params.delete('tab')
    } else {
      params.set('tab', key)
    }
    const query = params.toString()
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false })
  }

  return (
    <div className="flex flex-col gap-6">
      <header className="rounded-2xl border border-[color:var(--color-outline)] bg-white px-6 py-5 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="space-y-2">
            <Badge variant="outline" className="uppercase tracking-wide">
              Client Workspace
            </Badge>
            <h1 className="text-2xl font-semibold text-[color:var(--color-text)]">{client.name}</h1>
            <p className="text-sm text-[color:var(--color-text-muted)]">
              {client.segment ?? 'Segment TBD'} • {client.industry ?? 'Industry TBD'} • Owner{' '}
              {client.ownerName ?? 'Unassigned'}
            </p>
            {client.notes ? (
              <p className="text-sm text-[color:var(--color-text-muted)]">{client.notes}</p>
            ) : null}
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <SummaryPill label="Phase" value={client.phase ?? '—'} />
            <SummaryPill label="Status" value={client.status ?? '—'} />
            <SummaryPill
              label="ARR"
              value={client.arr != null ? currencyFormatter.format(client.arr) : '—'}
            />
            <SummaryPill
              label="Health"
              value={client.health != null ? `${healthFormatter.format(client.health)}%` : '—'}
            />
          </div>
        </div>
        {client.qbrDate ? (
          <p className="mt-4 text-xs text-[color:var(--color-text-muted)]">
            Next QBR: {new Date(client.qbrDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </p>
        ) : null}
      </header>

      <Tabs value={activeTab} onValueChange={handleTabChange} defaultValue={initialTab}>
        <TabsList>
          {TAB_ITEMS.map((tab) => (
            <TabsTrigger key={tab.key} value={tab.key}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="discovery" className="border border-dashed border-[color:var(--color-outline)]">
          <DiscoveryTab clientId={client.id} responses={discoveryResponses} />
        </TabsContent>
        <TabsContent value="data" className="border border-dashed border-[color:var(--color-outline)]">
          <DataTab clientId={client.id} requirements={dataRequirements} />
        </TabsContent>
        <TabsContent value="algorithm" className="border border-dashed border-[color:var(--color-outline)]">
          <AlgorithmTab
            clientId={client.id}
            latestRun={latestQraRun}
            strategies={strategies}
            generatedStrategies={generatedStrategies}
          />
        </TabsContent>
        <TabsContent value="architecture" className="border border-dashed border-[color:var(--color-outline)]">
          <ArchitectureTab activeStrategy={activeStrategy} />
        </TabsContent>
        <TabsContent value="deliverables" className="border border-dashed border-[color:var(--color-outline)]">
          <DeliverablesTab clientId={client.id} items={deliverables} />
        </TabsContent>
        <TabsContent value="finance" className="border border-dashed border-[color:var(--color-outline)]">
          <FinanceTab clientId={client.id} finance={finance} />
        </TabsContent>
        <TabsContent value="activity" className="border border-dashed border-[color:var(--color-outline)]">
          <ActivityTab items={activity} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

function SummaryPill({ label, value }: { label: string; value: string }) {
  return (
    <Card className="border-none bg-[color:var(--color-surface-muted)] px-3 py-2 text-left shadow-none">
      <CardHeader className="px-0 py-0">
        <p className="text-[10px] font-medium uppercase tracking-wide text-[color:var(--color-text-muted)]">
          {label}
        </p>
      </CardHeader>
      <CardContent className="px-0 py-0">
        <CardTitle className="text-sm font-semibold text-[color:var(--color-text)]">{value}</CardTitle>
      </CardContent>
    </Card>
  )
}

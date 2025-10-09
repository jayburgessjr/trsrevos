'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/ui/tabs'

type KPIData = {
  label: string
  value: string
  delta: string
  positive: boolean
}

const mockKPIs: Record<string, KPIData[]> = {
  day: [
    { label: 'Revenue', value: '$12.4K', delta: '+8%', positive: true },
    { label: 'Pipeline Adds', value: '$45K', delta: '+12%', positive: true },
    { label: 'Client Health', value: '82', delta: '-2%', positive: false },
  ],
  week: [
    { label: 'Revenue', value: '$87.2K', delta: '+15%', positive: true },
    { label: 'Pipeline Adds', value: '$234K', delta: '+18%', positive: true },
    { label: 'Client Health', value: '84', delta: '+3%', positive: true },
  ],
  quarter: [
    { label: 'Revenue', value: '$1.1M', delta: '+22%', positive: true },
    { label: 'Pipeline Adds', value: '$2.8M', delta: '+25%', positive: true },
    { label: 'Client Health', value: '86', delta: '+5%', positive: true },
  ],
  year: [
    { label: 'Revenue', value: '$4.2M', delta: '+28%', positive: true },
    { label: 'Pipeline Adds', value: '$11.5M', delta: '+32%', positive: true },
    { label: 'Client Health', value: '88', delta: '+8%', positive: true },
  ],
}

export function KPIStanding() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>KPI Standing</CardTitle>
        <CardDescription>Performance metrics vs. prior period</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="day">
          <TabsList>
            <TabsTrigger value="day">Day</TabsTrigger>
            <TabsTrigger value="week">Week</TabsTrigger>
            <TabsTrigger value="quarter">Quarter</TabsTrigger>
            <TabsTrigger value="year">Year</TabsTrigger>
          </TabsList>
          {Object.entries(mockKPIs).map(([period, kpis]) => (
            <TabsContent key={period} value={period} className="space-y-4">
              {kpis.map((kpi) => (
                <div key={kpi.label} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-[color:var(--color-text)]">{kpi.label}</p>
                    <p className="text-2xl font-semibold text-[color:var(--color-text)]">{kpi.value}</p>
                  </div>
                  <div
                    className={`text-sm font-medium ${
                      kpi.positive ? 'text-[color:var(--color-positive)]' : 'text-[color:var(--color-critical)]'
                    }`}
                  >
                    {kpi.delta}
                  </div>
                </div>
              ))}
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  )
}

import { getTelemetrySnapshot } from '@/core/analytics/telemetry'

import TelemetryDashboardClient from './TelemetryDashboardClient'

type TelemetryPageProps = {
  searchParams?: { lookback?: string }
}

export default async function TelemetryPage({ searchParams }: TelemetryPageProps) {
  const requestedLookback = Number(searchParams?.lookback ?? '30')
  const lookbackDays = Number.isFinite(requestedLookback) && requestedLookback > 0 ? requestedLookback : 30
  const snapshot = await getTelemetrySnapshot(lookbackDays)

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6">
      <TelemetryDashboardClient snapshot={snapshot} />
    </div>
  )
}

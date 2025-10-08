'use client'

import { useEffect, useState } from 'react'

type ScoreBand = 'RED' | 'YELLOW' | 'GREEN'

type ScorePayload = {
  accountId: string
  computedAt: string
  score: number
  band: ScoreBand
  drivers: Array<{ name: string; delta: number }>
}

type ScoreState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; data: ScorePayload }

function formatDelta(delta: number): string {
  const rounded = delta.toFixed(1)
  return delta > 0 ? `+${rounded}` : rounded
}

const bandStyles: Record<
  ScoreBand,
  { container: string; badge: string; pulse: string }
> = {
  GREEN: {
    container: 'bg-green-100 text-green-700 border-green-200',
    badge: 'bg-green-500 text-white',
    pulse: 'bg-green-200'
  },
  YELLOW: {
    container: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    badge: 'bg-yellow-500 text-white',
    pulse: 'bg-yellow-200'
  },
  RED: {
    container: 'bg-red-100 text-red-700 border-red-200',
    badge: 'bg-red-500 text-white',
    pulse: 'bg-red-200'
  }
}

export function ScoreChip({ accountId = 'demo' }: { accountId?: string }) {
  const [state, setState] = useState<ScoreState>({ status: 'loading' })

  useEffect(() => {
    const controller = new AbortController()

    async function loadScore() {
      try {
        setState({ status: 'loading' })
        const response = await fetch(`/api/trs-score/${accountId}`, {
          signal: controller.signal,
          cache: 'no-store'
        })

        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`)
        }

        const payload = (await response.json()) as ScorePayload
        setState({ status: 'ready', data: payload })
      } catch (error) {
        if ((error as Error).name === 'AbortError') {
          return
        }
        setState({
          status: 'error',
          message: 'Unable to load TRS score.'
        })
      }
    }

    void loadScore()

    return () => {
      controller.abort()
    }
  }, [accountId])

  if (state.status === 'loading') {
    return (
      <div
        id="trs-score"
        className="inline-flex items-center gap-2 rounded-full border border-dashed border-gray-300 bg-white px-3 py-1 text-xs text-gray-500"
      >
        <span className="h-2 w-2 rounded-full bg-gray-300" />
        Loading TRS Score…
      </div>
    )
  }

  if (state.status === 'error') {
    return (
      <div
        id="trs-score"
        className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs text-red-600"
      >
        <span className="h-2 w-2 rounded-full bg-red-400" />
        {state.message}
      </div>
    )
  }

  const { data } = state
  const styles = bandStyles[data.band]
  const topDrivers = data.drivers.slice(0, 3)

  return (
    <div id="trs-score" className="flex flex-col gap-1 text-xs">
      <div
        className={`inline-flex items-center gap-3 rounded-full border px-3 py-1 font-medium ${styles.container}`}
      >
        <span className="flex items-center gap-2">
          <span className={`h-2 w-2 rounded-full ${styles.pulse}`} />
          TRS Score
        </span>
        <span className="text-sm font-semibold">{Math.round(data.score)}</span>
        <span className={`rounded-full px-2 py-0.5 text-[0.65rem] font-semibold uppercase ${styles.badge}`}>
          {data.band}
        </span>
      </div>
      <div className="flex flex-wrap items-center gap-2 text-[0.7rem] text-gray-500">
        {topDrivers.map((driver) => (
          <span
            key={driver.name}
            className="cursor-help rounded bg-gray-100 px-2 py-0.5 font-medium text-gray-700 hover:bg-gray-200"
            title={`${driver.name}: ${formatDelta(driver.delta)} pts from neutral`}
            aria-label={`${driver.name} impact ${formatDelta(driver.delta)} points from neutral`}
          >
            {driver.name}
          </span>
        ))}
      </div>
    </div>
  )
}

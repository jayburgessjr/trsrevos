'use client'

import { useMemo, useState, useTransition } from 'react'

import { runQRA, selectStrategy } from '@/core/clients/actions'
import { ClientStrategy, QRARun } from '@/core/clients/types'
import { StrategyVariant } from '@/core/qra/engine'
import { Badge } from '@/ui/badge'
import { Button } from '@/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/ui/card'
import { Textarea } from '@/ui/textarea'

const DEFAULT_QUANT = {
  arr: 0,
  growth_rate: 15,
  churn_rate: 7,
  win_rate: 30,
  sales_cycle_days: 45,
  acv: 40000,
}

const DEFAULT_QUAL = {
  primary_goal: 'Accelerate revenue compounding',
  champion: 'Revenue Lead',
}

type AlgorithmTabProps = {
  clientId: string
  latestRun: QRARun | null
  strategies: ClientStrategy[]
  generatedStrategies?: StrategyVariant[]
}

type ParsedInputs = {
  quant: Record<string, unknown>
  qual: Record<string, unknown>
}

export default function AlgorithmTab({ clientId, latestRun, strategies, generatedStrategies }: AlgorithmTabProps) {
  const activeStrategy = useMemo(
    () => strategies.find((strategy) => strategy.status === 'active') ?? null,
    [strategies],
  )

  const lastInputs = useMemo<ParsedInputs>(() => {
    if (latestRun?.inputs) {
      const quant = (latestRun.inputs as ParsedInputs).quant ?? DEFAULT_QUANT
      const qual = (latestRun.inputs as ParsedInputs).qual ?? DEFAULT_QUAL
      return { quant, qual }
    }
    return { quant: DEFAULT_QUANT, qual: DEFAULT_QUAL }
  }, [latestRun])

  const lastVariants = useMemo<StrategyVariant[]>(() => {
    if (generatedStrategies && generatedStrategies.length) {
      return generatedStrategies
    }
    const output = latestRun?.outputs as { strategies?: StrategyVariant[] } | null | undefined
    if (output?.strategies && Array.isArray(output.strategies)) {
      return output.strategies as StrategyVariant[]
    }
    return []
  }, [generatedStrategies, latestRun])

  const [quantText, setQuantText] = useState(JSON.stringify(lastInputs.quant, null, 2))
  const [qualText, setQualText] = useState(JSON.stringify(lastInputs.qual, null, 2))
  const [variants, setVariants] = useState<StrategyVariant[]>(lastVariants)
  const [error, setError] = useState<string | null>(null)
  const [selectionKey, setSelectionKey] = useState<string | null>(activeStrategy?.key ?? null)
  const [isPending, startTransition] = useTransition()
  const [isSelecting, startSelectTransition] = useTransition()

  const parseInputs = (): ParsedInputs | null => {
    try {
      const quant = quantText.trim() ? JSON.parse(quantText) : {}
      const qual = qualText.trim() ? JSON.parse(qualText) : {}
      return { quant, qual }
    } catch (err) {
      setError('Inputs must be valid JSON objects.')
      return null
    }
  }

  const handleRun = () => {
    const parsed = parseInputs()
    if (!parsed) return

    setError(null)
    startTransition(async () => {
      const result = await runQRA(clientId, parsed)
      if (result.strategies?.length) {
        setVariants(result.strategies)
      }
    })
  }

  const handleSelect = (variant: StrategyVariant) => {
    setSelectionKey(variant.key)
    startSelectTransition(async () => {
      await selectStrategy(clientId, variant.key, variant.body as unknown as Record<string, unknown>, variant.title)
    })
  }

  return (
    <div className="grid gap-4 lg:grid-cols-5">
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="text-base">Quant & Qual Inputs</CardTitle>
          <CardDescription>Use structured inputs to generate strategy variants.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="grid gap-2">
            <label className="text-xs font-medium text-[color:var(--color-text-muted)]" htmlFor="quant-input">
              Quantitative Inputs
            </label>
            <Textarea
              id="quant-input"
              value={quantText}
              onChange={(event) => setQuantText(event.target.value)}
              className="min-h-[160px] font-mono"
              spellCheck={false}
            />
          </div>
          <div className="grid gap-2">
            <label className="text-xs font-medium text-[color:var(--color-text-muted)]" htmlFor="qual-input">
              Qualitative Inputs
            </label>
            <Textarea
              id="qual-input"
              value={qualText}
              onChange={(event) => setQualText(event.target.value)}
              className="min-h-[160px] font-mono"
              spellCheck={false}
            />
          </div>
          {error ? <p className="text-xs text-[color:var(--color-critical)]">{error}</p> : null}
          <div className="flex justify-end">
            <Button onClick={handleRun} disabled={isPending}>
              {isPending ? 'Running QRA…' : 'Run QRA'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="lg:col-span-3 flex flex-col gap-4">
        {activeStrategy ? (
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                Current Strategy
                <Badge variant="success">Active</Badge>
              </CardTitle>
              <CardDescription>{activeStrategy.title}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-[color:var(--color-text-muted)]">
                Selected {new Date(activeStrategy.created_at).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </p>
            </CardContent>
          </Card>
        ) : null}

        <div className="grid gap-4 md:grid-cols-2">
          {variants.length ? (
            variants.map((variant) => (
              <StrategyCard
                key={variant.key}
                variant={variant}
                onSelect={() => handleSelect(variant)}
                disabled={isSelecting}
                isSelected={selectionKey === variant.key}
              />
            ))
          ) : (
            <p className="md:col-span-2 rounded-lg border border-dashed border-[color:var(--color-outline)] px-4 py-10 text-center text-sm text-[color:var(--color-text-muted)]">
              Run the QRA engine to generate strategy options.
            </p>
          )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Strategy Archive</CardTitle>
            <CardDescription>Previous strategy selections are archived for reference.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {strategies.length ? (
              strategies.map((strategy) => (
                <div key={strategy.id} className="flex items-center justify-between rounded-lg border border-[color:var(--color-outline)] px-3 py-2 text-sm">
                  <div>
                    <p className="font-medium text-[color:var(--color-text)]">{strategy.title}</p>
                    <p className="text-xs text-[color:var(--color-text-muted)]">
                      {new Date(strategy.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                  <Badge variant={strategy.status === 'active' ? 'success' : 'outline'}>{strategy.status}</Badge>
                </div>
              ))
            ) : (
              <p className="rounded-lg border border-dashed border-[color:var(--color-outline)] px-4 py-6 text-center text-sm text-[color:var(--color-text-muted)]">
                No strategies saved yet.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

type StrategyCardProps = {
  variant: StrategyVariant
  onSelect: () => void
  disabled: boolean
  isSelected: boolean
}

function StrategyCard({ variant, onSelect, disabled, isSelected }: StrategyCardProps) {
  const body = variant.body
  return (
    <Card className="flex h-full flex-col border-[color:var(--color-outline)]">
      <CardHeader className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-base">{variant.title}</CardTitle>
          {isSelected ? <Badge variant="success">Selected</Badge> : null}
        </div>
        <CardDescription>{variant.headline}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-4">
        <div>
          <p className="text-sm font-medium text-[color:var(--color-text)]">Narrative</p>
          <p className="text-sm text-[color:var(--color-text-muted)]">{body.narrative}</p>
        </div>
        <div className="space-y-2">
          <p className="text-sm font-medium text-[color:var(--color-text)]">Plays</p>
          <ul className="space-y-2 text-sm text-[color:var(--color-text-muted)]">
            {body.plays.map((play) => (
              <li key={play.id} className="rounded-lg border border-[color:var(--color-outline)] px-3 py-2">
                <p className="font-medium text-[color:var(--color-text)]">{play.title}</p>
                <p>{play.description}</p>
                <p className="text-xs text-[color:var(--color-text-muted)]">Owner {play.ownerHint} • {play.dueInDays} days</p>
              </li>
            ))}
          </ul>
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium text-[color:var(--color-text)]">Key Metrics</p>
          <ul className="space-y-1 text-sm text-[color:var(--color-text-muted)]">
            {body.metrics.map((metric) => (
              <li key={metric.label}>
                <span className="font-medium text-[color:var(--color-text)]">{metric.label}</span>: {metric.baseline} → {metric.target}
              </li>
            ))}
          </ul>
        </div>
        <div className="mt-auto flex justify-end">
          <Button onClick={onSelect} disabled={disabled}>
            {isSelected ? 'Selected' : 'Activate strategy'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

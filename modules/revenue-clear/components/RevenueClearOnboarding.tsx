'use client'

import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { useFormState, useFormStatus } from 'react-dom'
import { useRouter } from 'next/navigation'

import { PageTemplate } from '@/components/layout/PageTemplate'
import { Button } from '@/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/ui/card'
import { Input } from '@/ui/input'
import { Select } from '@/ui/select'

import {
  convertPipelineOpportunityAction,
  createRevenueClearClientAction,
  INITIAL_ACTION_STATE,
  type ActionState,
} from '../lib/actions'
import type { RevenuePipelineOption } from '../lib/queries'

const PIPELINE_STAGE_OPTIONS = ['Prospect', 'Qualify', 'Proposal', 'Negotiation', 'ClosedWon'] as const

function formatCurrency(value: number | null | undefined) {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return ''
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value)
}

type RevenueClearOnboardingProps = {
  pipelineOptions: RevenuePipelineOption[]
}

type SubmitButtonProps = {
  children: ReactNode
  className?: string
  disabled?: boolean
}

function SubmitButton({ children, className, disabled = false }: SubmitButtonProps) {
  const { pending } = useFormStatus()
  const isDisabled = pending || disabled

  return (
    <Button type="submit" disabled={isDisabled} className={className}>
      {pending ? 'Working…' : children}
    </Button>
  )
}

export default function RevenueClearOnboarding({ pipelineOptions }: RevenueClearOnboardingProps) {
  const router = useRouter()
  const [convertState, convertAction] = useFormState<ActionState, FormData>(
    convertPipelineOpportunityAction,
    INITIAL_ACTION_STATE,
  )
  const [createState, createAction] = useFormState<ActionState, FormData>(
    createRevenueClearClientAction,
    INITIAL_ACTION_STATE,
  )
  const [selectedOpportunityId, setSelectedOpportunityId] = useState<string>(
    pipelineOptions[0]?.id ?? '',
  )

  useEffect(() => {
    setSelectedOpportunityId((current) => {
      if (pipelineOptions.some((option) => option.id === current)) {
        return current
      }
      return pipelineOptions[0]?.id ?? ''
    })
  }, [pipelineOptions])

  const selectedOpportunity = useMemo(() => {
    if (!selectedOpportunityId) return null
    return pipelineOptions.find((option) => option.id === selectedOpportunityId) ?? null
  }, [pipelineOptions, selectedOpportunityId])

  useEffect(() => {
    if (convertState.status === 'success' && convertState.redirectUrl) {
      router.replace(convertState.redirectUrl)
    }
  }, [convertState, router])

  useEffect(() => {
    if (createState.status === 'success' && createState.redirectUrl) {
      router.replace(createState.redirectUrl)
    }
  }, [createState, router])

  return (
    <PageTemplate
      title="Revenue Clear onboarding"
      description="Load a pipeline company or create a client to launch the guided Revenue Clear workflow."
      containerClassName="py-12"
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="h-full">
          <form action={convertAction} className="flex h-full flex-col">
            <CardHeader>
              <CardTitle>Use a pipeline company</CardTitle>
              <CardDescription>
                Promote an existing opportunity into Revenue Clear. We will link or create the client record automatically.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="opportunityId"
                  className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--color-text-muted)]"
                >
                  Pipeline opportunity
                </label>
                <Select
                  id="opportunityId"
                  name="opportunityId"
                  value={selectedOpportunityId}
                  onChange={(event) => setSelectedOpportunityId(event.target.value)}
                  disabled={!pipelineOptions.length}
                >
                  {pipelineOptions.length ? (
                    pipelineOptions.map((option) => {
                      const formattedAmount = formatCurrency(option.amount)
                      return (
                        <option key={option.id} value={option.id}>
                          {option.label}
                          {option.stage ? ` · ${option.stage}` : ''}
                          {formattedAmount ? ` · ${formattedAmount}` : ''}
                        </option>
                      )
                    })
                  ) : (
                    <option value="" disabled>
                      No active opportunities available
                    </option>
                  )}
                </Select>
                <div className="rounded-lg border border-[color:var(--color-border)] bg-white px-3 py-2 text-[11px] text-[color:var(--color-text-muted)]">
                  {selectedOpportunity ? (
                    <div className="flex flex-col gap-1">
                      <span className="font-semibold text-[color:var(--color-text)]">{selectedOpportunity.label}</span>
                      <span>
                        Stage: {selectedOpportunity.stage ?? 'Not set'} · Deal value: {formatCurrency(selectedOpportunity.amount)}
                      </span>
                    </div>
                  ) : (
                    <span>Select a pipeline record to preview its stage and value.</span>
                  )}
                </div>
              </div>

              {convertState.status === 'error' ? (
                <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                  {convertState.error}
                </p>
              ) : null}
            </CardContent>
            <CardFooter className="justify-between">
              <div className="text-xs text-[color:var(--color-text-muted)]">
                We will attach the client to your pipeline when you continue.
              </div>
              <SubmitButton disabled={!pipelineOptions.length || !selectedOpportunityId}>
                {pipelineOptions.length ? 'Load from pipeline' : 'Pipeline empty'}
              </SubmitButton>
            </CardFooter>
          </form>
        </Card>

        <Card className="h-full">
          <form action={createAction} className="flex h-full flex-col">
            <CardHeader>
              <CardTitle>Start with a new client</CardTitle>
              <CardDescription>
                Create a client record and add it to your pipeline with the stage, value, and next step you expect.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label
                  className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--color-text-muted)]"
                  htmlFor="name"
                >
                  Client name
                </label>
                <Input id="name" name="name" placeholder="Acme Corp" required />
              </div>

              <div className="flex flex-col gap-2">
                <label
                  className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--color-text-muted)]"
                  htmlFor="industry"
                >
                  Industry (optional)
                </label>
                <Input id="industry" name="industry" placeholder="B2B SaaS" />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <label
                    className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--color-text-muted)]"
                    htmlFor="stage"
                  >
                    Pipeline stage
                  </label>
                  <Select id="stage" name="stage" defaultValue="Prospect">
                    {PIPELINE_STAGE_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </Select>
                </div>

                <div className="flex flex-col gap-2">
                  <label
                    className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--color-text-muted)]"
                    htmlFor="dealValue"
                  >
                    Deal value ($)
                  </label>
                  <Input id="dealValue" name="dealValue" type="number" step="1000" min="0" placeholder="25000" />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label
                  className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--color-text-muted)]"
                  htmlFor="nextStep"
                >
                  Next step (optional)
                </label>
                <Input id="nextStep" name="nextStep" placeholder="Book Revenue Clear kickoff" />
              </div>

              {createState.status === 'error' ? (
                <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                  {createState.error}
                </p>
              ) : null}
            </CardContent>
            <CardFooter>
              <SubmitButton>Create client &amp; continue</SubmitButton>
            </CardFooter>
          </form>
        </Card>
      </div>
    </PageTemplate>
  )
}

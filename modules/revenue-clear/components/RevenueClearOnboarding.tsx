'use client'

import { useEffect, type ReactNode } from 'react'
import { useFormState, useFormStatus } from 'react-dom'
import { useRouter } from 'next/navigation'

import { Button } from '@/ui/button'
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
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#0e1018] via-[#121526] to-[#0b0d16] px-6 py-12 text-white">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-10">
        <header className="space-y-3 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/60">Revenue Clear</p>
          <h1 className="text-3xl font-semibold">Choose how you want to start</h1>
          <p className="mx-auto max-w-3xl text-sm text-white/70">
            Load an existing company from your revenue pipeline or create a new client. We will handle the Supabase records and
            attach them to the pipeline automatically so you can move straight into the workflow.
          </p>
        </header>

        <div className="grid gap-6 lg:grid-cols-2">
          <form
            action={convertAction}
            className="flex h-full flex-col gap-4 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_0_60px_-25px_rgba(59,130,246,0.65)]"
          >
            <div>
              <h2 className="text-lg font-semibold text-white">Use a pipeline company</h2>
              <p className="mt-1 text-xs text-white/70">
                Promote an existing opportunity into Revenue Clear. Selecting one will link or create the client record for you.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="opportunityId" className="text-xs font-semibold uppercase tracking-[0.18em] text-white/60">
                Pipeline opportunity
              </label>
              <Select
                id="opportunityId"
                name="opportunityId"
                defaultValue={pipelineOptions.length ? pipelineOptions[0]?.id : ''}
                disabled={!pipelineOptions.length}
                className="bg-[#0b1120] text-white"
              >
                {pipelineOptions.length ? (
                  pipelineOptions.map((option) => {
                    const formattedAmount = formatCurrency(option.amount)
                    return (
                      <option key={option.id} value={option.id} className="bg-[#0b1120] text-white">
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
            </div>

            {convertState.status === 'error' ? (
              <p className="rounded-md border border-red-400/40 bg-red-500/10 px-3 py-2 text-xs text-red-100">
                {convertState.error}
              </p>
            ) : null}

            <SubmitButton className="mt-auto" disabled={!pipelineOptions.length}>
              {pipelineOptions.length ? 'Load from pipeline' : 'Pipeline empty'}
            </SubmitButton>
          </form>

          <form
            action={createAction}
            className="flex h-full flex-col gap-4 rounded-3xl border border-white/10 bg-[#090b14] p-6 shadow-[0_0_60px_-25px_rgba(59,130,246,0.35)]"
          >
            <div>
              <h2 className="text-lg font-semibold text-white">Start with a new client</h2>
              <p className="mt-1 text-xs text-white/70">
                Create a fresh client record and add it to your pipeline with the stage and value you expect.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="name" className="text-xs font-semibold uppercase tracking-[0.18em] text-white/60">
                Client name
              </label>
              <Input id="name" name="name" placeholder="Acme Corp" required className="bg-white/90 text-black" />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="industry" className="text-xs font-semibold uppercase tracking-[0.18em] text-white/60">
                Industry (optional)
              </label>
              <Input id="industry" name="industry" placeholder="B2B SaaS" className="bg-white/90 text-black" />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex flex-col gap-2">
                <label htmlFor="stage" className="text-xs font-semibold uppercase tracking-[0.18em] text-white/60">
                  Pipeline stage
                </label>
                <Select id="stage" name="stage" defaultValue="Prospect" className="bg-white/90 text-black">
                  {PIPELINE_STAGE_OPTIONS.map((option) => (
                    <option key={option} value={option} className="text-black">
                      {option}
                    </option>
                  ))}
                </Select>
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="dealValue" className="text-xs font-semibold uppercase tracking-[0.18em] text-white/60">
                  Deal value ($)
                </label>
                <Input
                  id="dealValue"
                  name="dealValue"
                  type="number"
                  step="1000"
                  min="0"
                  placeholder="25000"
                  className="bg-white/90 text-black"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="nextStep" className="text-xs font-semibold uppercase tracking-[0.18em] text-white/60">
                Next step (optional)
              </label>
              <Input
                id="nextStep"
                name="nextStep"
                placeholder="Book Revenue Clear kickoff"
                className="bg-white/90 text-black"
              />
            </div>

            {createState.status === 'error' ? (
              <p className="rounded-md border border-red-400/40 bg-red-500/10 px-3 py-2 text-xs text-red-100">
                {createState.error}
              </p>
            ) : null}

            <SubmitButton className="mt-auto">Create client &amp; continue</SubmitButton>
          </form>
        </div>
      </div>
    </div>
  )
}

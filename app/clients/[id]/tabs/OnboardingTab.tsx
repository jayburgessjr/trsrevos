'use client'

import { useTransition } from 'react'

import { ensureOnboarding, setClientPhase } from '../actions'
import { Badge } from '@/ui/badge'
import { Button } from '@/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/ui/card'
import { showToast } from '@/ui/toast'

type OnboardingTabProps = {
  clientId: string
  phase: string | null
  status: string | null
}

const PHASE_LABELS: Record<string, string> = {
  onboarding: 'Onboarding',
  active: 'Active',
  paused: 'Paused',
}

const STATUS_HINTS: Record<string, string> = {
  onboarding: 'Working through kickoff tasks and data collection.',
  active: 'Engagement is live with recurring delivery.',
  paused: 'Engagement paused — confirm restart plan.',
}

export default function OnboardingTab({ clientId, phase, status }: OnboardingTabProps) {
  const [isPending, startTransition] = useTransition()

  const normalizedPhase = (phase ?? 'onboarding').toLowerCase()
  const normalizedStatus = (status ?? 'Active').toLowerCase()

  const handleEnsure = () => {
    startTransition(async () => {
      try {
        await ensureOnboarding(clientId)
        showToast({
          title: 'Onboarding initialized',
          description: 'Kickoff checklist generated from Supabase workflow.',
          variant: 'success',
        })
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unable to initialize onboarding'
        showToast({ title: 'Onboarding failed', description: message, variant: 'destructive' })
      }
    })
  }

  const handlePhaseChange = (nextPhase: 'Onboarding' | 'Active') => {
    startTransition(async () => {
      try {
        await setClientPhase(clientId, nextPhase)
        showToast({
          title: 'Client phase updated',
          description: `Client marked as ${nextPhase.toLowerCase()}.`,
          variant: 'success',
        })
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unable to update phase'
        showToast({ title: 'Phase update failed', description: message, variant: 'destructive' })
      }
    })
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card className="border border-[color:var(--color-outline)] bg-white">
        <CardHeader>
          <CardTitle>Current State</CardTitle>
          <CardDescription>Track onboarding milestones and shift the client into delivery.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-[color:var(--color-text-muted)]">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wide text-[color:var(--color-text-muted)]">Phase</span>
            <Badge variant="outline">{PHASE_LABELS[normalizedPhase] ?? phase ?? 'Onboarding'}</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wide text-[color:var(--color-text-muted)]">Status</span>
            <Badge variant="outline">{status ?? 'Active'}</Badge>
          </div>
          <p className="text-xs leading-relaxed">
            {STATUS_HINTS[normalizedStatus] ?? 'Use the actions on the right to update onboarding progress.'}
          </p>
        </CardContent>
      </Card>

      <Card className="border border-[color:var(--color-outline)] bg-white">
        <CardHeader>
          <CardTitle>Actions</CardTitle>
          <CardDescription>Log kickoff in Supabase and switch the client into an active phase.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button
            type="button"
            variant="outline"
            className="w-full justify-start"
            onClick={handleEnsure}
            disabled={isPending}
          >
            Generate onboarding checklist
          </Button>
          <Button
            type="button"
            className="w-full justify-start"
            onClick={() => handlePhaseChange('Onboarding')}
            disabled={isPending || normalizedPhase === 'onboarding'}
          >
            Mark as onboarding
          </Button>
          <Button
            type="button"
            className="w-full justify-start"
            onClick={() => handlePhaseChange('Active')}
            disabled={isPending || normalizedPhase === 'active'}
          >
            Mark as active delivery
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

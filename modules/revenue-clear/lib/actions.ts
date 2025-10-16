'use server'

import { revalidatePath } from 'next/cache'

import { requireAuth } from '@/lib/server/auth'

type PostgrestLikeError = {
  code?: string | null
  message?: string | null
}

const REVALIDATE_PATHS = ['/pipeline', '/clients', '/revenue-clear'] as const

function isPermissionDenied(error: PostgrestLikeError | null | undefined) {
  if (!error) return false
  if (error.code === '42501') return true
  const message = error.message?.toLowerCase() ?? ''
  return message.includes('permission denied') || message.includes('rls')
}

async function revalidateRevenueClearPaths() {
  await Promise.allSettled(REVALIDATE_PATHS.map((path) => revalidatePath(path)))
}

const STAGE_PROBABILITIES: Record<string, number> = {
  Prospect: 10,
  Qualify: 25,
  Proposal: 50,
  Negotiation: 75,
  ClosedWon: 100,
  ClosedLost: 0,
}

export type ActionState = {
  status: 'idle' | 'success' | 'error'
  error?: string
  redirectUrl?: string
}

export const INITIAL_ACTION_STATE: ActionState = { status: 'idle' }

function parseAmount(raw: FormDataEntryValue | null): number {
  if (!raw) return 0
  if (typeof raw !== 'string') return 0
  const normalized = raw.replace(/[$,\s]/g, '')
  const parsed = Number.parseFloat(normalized)
  return Number.isFinite(parsed) ? parsed : 0
}

function resolveProbability(stage: string | null | undefined, fallback?: number | null): number {
  if (!stage) return fallback ?? 10
  return STAGE_PROBABILITIES[stage] ?? fallback ?? 10
}

export async function convertPipelineOpportunityAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const opportunityId = formData.get('opportunityId')

    if (!opportunityId || typeof opportunityId !== 'string') {
      return { status: 'error', error: 'Select a pipeline opportunity to continue.' }
    }

    const { supabase, user } = await requireAuth({ redirectTo: `/revenue-clear` })

    const { data: opportunity, error: loadError } = await supabase
      .from('opportunities')
      .select('id, name, client_id, stage, amount, probability, owner_id, next_step')
      .eq('id', opportunityId)
      .maybeSingle()

    if (loadError) {
      console.error('revenue-clear:onboarding.load-opportunity', loadError)
      return { status: 'error', error: 'Failed to load the pipeline record. Try again.' }
    }

    if (!opportunity) {
      return { status: 'error', error: 'The selected pipeline record no longer exists.' }
    }

    let clientId = (opportunity.client_id as string | null) ?? null

    if (!clientId) {
      const { data: insertedClient, error: insertError } = await supabase
        .from('clients')
        .insert({
          name: opportunity.name,
          owner_id: user.id,
          phase: 'Discovery',
          status: 'active',
        })
        .select('id')
        .single()

      if (insertError || !insertedClient) {
        console.error('revenue-clear:onboarding.create-client', insertError)
        return { status: 'error', error: 'Unable to promote the pipeline record into a client.' }
      }

      clientId = insertedClient.id

      const normalizedStage = typeof opportunity.stage === 'string' && opportunity.stage ? opportunity.stage : 'Prospect'
      const probability = resolveProbability(normalizedStage, opportunity.probability)

      const amountValue =
        typeof opportunity.amount === 'number'
          ? opportunity.amount
          : Number.parseFloat(String(opportunity.amount ?? 0)) || 0

      const { error: updateOpportunityError } = await supabase
        .from('opportunities')
        .update({
          client_id: clientId,
          probability,
          owner_id: opportunity.owner_id ?? user.id,
        })
        .eq('id', opportunity.id)

      if (updateOpportunityError) {
        console.error('revenue-clear:onboarding.update-opportunity', updateOpportunityError)

        if (isPermissionDenied(updateOpportunityError)) {
          const { error: fallbackInsertError } = await supabase.from('opportunities').insert({
            client_id: clientId,
            name: opportunity.name,
            amount: amountValue,
            stage: normalizedStage,
            probability,
            owner_id: user.id,
            next_step:
              typeof opportunity.next_step === 'string' && opportunity.next_step.trim()
                ? opportunity.next_step
                : `Launch Revenue Clear intake for ${opportunity.name}`,
          })

          if (fallbackInsertError) {
            console.error('revenue-clear:onboarding.clone-opportunity', fallbackInsertError)
            return {
              status: 'error',
              error: 'Client created, but we could not attach the pipeline deal to Revenue Clear.',
            }
          }
        } else {
          return {
            status: 'error',
            error: 'Client created, but the pipeline record could not be updated. Refresh and try again.',
          }
        }
      }
    }

    await revalidateRevenueClearPaths()

    return { status: 'success', redirectUrl: `/revenue-clear?clientId=${clientId}` }
  } catch (error) {
    console.error('revenue-clear:onboarding.unhandled', error)
    return {
      status: 'error',
      error: 'Something unexpected happened while promoting the pipeline deal. Try again shortly.',
    }
  }
}

export async function createRevenueClearClientAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const name = formData.get('name')
    const industryRaw = formData.get('industry')
    const stageRaw = formData.get('stage')
    const dealValue = parseAmount(formData.get('dealValue'))
    const nextStep = formData.get('nextStep')

    if (!name || typeof name !== 'string' || !name.trim()) {
      return { status: 'error', error: 'Enter a client name to begin.' }
    }

    const stage = typeof stageRaw === 'string' && stageRaw ? stageRaw : 'Prospect'
    const probability = resolveProbability(stage, null)

    const { supabase, user } = await requireAuth({ redirectTo: `/revenue-clear` })

    const { data: client, error: clientError } = await supabase
      .from('clients')
      .insert({
        name: name.trim(),
        owner_id: user.id,
        phase: 'Discovery',
        status: 'active',
        industry: typeof industryRaw === 'string' && industryRaw.trim() ? industryRaw.trim() : null,
      })
      .select('id')
      .single()

    if (clientError || !client) {
      console.error('revenue-clear:onboarding.insert-client', clientError)
      return { status: 'error', error: 'Unable to create the client. Try again in a moment.' }
    }

    const opportunityName = `${name.toString().trim()} • Revenue Clear`

    const { error: opportunityError } = await supabase.from('opportunities').insert({
      client_id: client.id,
      name: opportunityName,
      amount: dealValue,
      stage,
      probability,
      owner_id: user.id,
      next_step:
        typeof nextStep === 'string' && nextStep.trim() ? nextStep.trim() : 'Launch Revenue Clear intake',
    })

    if (opportunityError) {
      console.error('revenue-clear:onboarding.insert-opportunity', opportunityError)
      return {
        status: 'error',
        error: 'Client created, but adding them to the pipeline failed. Refresh and try again.',
      }
    }

    await revalidateRevenueClearPaths()

    return { status: 'success', redirectUrl: `/revenue-clear?clientId=${client.id}` }
  } catch (error) {
    console.error('revenue-clear:onboarding.create-unhandled', error)
    return {
      status: 'error',
      error: 'Unexpected error while creating the client. Try again in a moment.',
    }
  }
}

export async function ensureDefaultRevenueClearClient(): Promise<string | null> {
  const { supabase, user } = await requireAuth({ redirectTo: `/revenue-clear` })

  // Check if user already has clients
  const { data: existingClients } = await supabase
    .from('clients')
    .select('id')
    .limit(1)

  if (existingClients && existingClients.length > 0) {
    return existingClients[0].id
  }

  // Create default client for immediate access
  const { data: client, error: clientError } = await supabase
    .from('clients')
    .insert({
      name: 'New Revenue Clear Client',
      owner_id: user.id,
      phase: 'Discovery',
      status: 'active',
      industry: null,
      revenue_model: null,
      monthly_recurring_revenue: 0,
      profit_margin: 0,
      target_growth: 0,
      primary_goal: null,
    })
    .select('id')
    .single()

  if (clientError || !client) {
    console.error('revenue-clear:ensure-default-client', clientError)
    return null
  }

  await revalidatePath('/revenue-clear')

  return client.id
}

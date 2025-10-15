'use server'

import { revalidatePath } from 'next/cache'

import { requireAuth } from '@/lib/server/auth'

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
  const opportunityId = formData.get('opportunityId')

  if (!opportunityId || typeof opportunityId !== 'string') {
    return { status: 'error', error: 'Select a pipeline opportunity to continue.' }
  }

  const { supabase, user } = await requireAuth({ redirectTo: `/revenue-clear` })

  const { data: opportunity, error: loadError } = await supabase
    .from('opportunities')
    .select('id, name, client_id, stage, amount, probability, owner_id')
    .eq('id', opportunityId)
    .maybeSingle()

  if (loadError) {
    console.error('revenue-clear:onboarding.load-opportunity', loadError)
    return { status: 'error', error: 'Failed to load the pipeline record. Try again.' }
  }

  if (!opportunity) {
    return { status: 'error', error: 'The selected pipeline record no longer exists.' }
  }

  let clientId = opportunity.client_id as string | null

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

    const probability = resolveProbability(opportunity.stage, opportunity.probability)

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
      return {
        status: 'error',
        error: 'Client created, but the pipeline record could not be updated. Refresh and try again.',
      }
    }
  }

  await Promise.all([
    revalidatePath('/pipeline'),
    revalidatePath('/clients'),
    revalidatePath('/revenue-clear'),
  ])

  return { status: 'success', redirectUrl: `/revenue-clear?clientId=${clientId}` }
}

export async function createRevenueClearClientAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
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
    next_step: typeof nextStep === 'string' && nextStep.trim() ? nextStep.trim() : 'Launch Revenue Clear intake',
  })

  if (opportunityError) {
    console.error('revenue-clear:onboarding.insert-opportunity', opportunityError)
    return {
      status: 'error',
      error: 'Client created, but adding them to the pipeline failed. Refresh and try again.',
    }
  }

  await Promise.all([
    revalidatePath('/pipeline'),
    revalidatePath('/clients'),
    revalidatePath('/revenue-clear'),
  ])

  return { status: 'success', redirectUrl: `/revenue-clear?clientId=${client.id}` }
}

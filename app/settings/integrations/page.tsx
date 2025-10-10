import { redirect } from 'next/navigation'

import { getGmailIntegration, getSupabaseUser } from '@/lib/gmail/server'
import { GmailIntegrationWizard } from '@/components/settings/gmail/GmailIntegrationWizard'

export const dynamic = 'force-dynamic'

interface IntegrationsPageProps {
  searchParams: Record<string, string | string[] | undefined>
}

export default async function GmailIntegrationsPage({ searchParams }: IntegrationsPageProps) {
  const { supabase, user } = await getSupabaseUser()

  if (!user) {
    redirect('/settings')
  }

  const integration = await getGmailIntegration(supabase, user.id)

  const connected = Boolean(integration?.refresh_token)
  const connectedAt = integration?.connected_at ?? null
  const scope = integration?.scope ?? null

  const success = searchParams.connected === 'gmail'
  const error = typeof searchParams.error === 'string' ? searchParams.error : null

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-8">
      <div>
        <h1 className="text-2xl font-semibold text-[var(--color-text, #0f172a)]">Gmail Workspace Integration</h1>
        <p className="mt-2 text-sm text-gray-600">
          Securely connect your Gmail account to orchestrate email sending, inbox triage, and thread governance directly inside
          TRSREVOS.
        </p>
      </div>

      <GmailIntegrationWizard
        connected={connected}
        connectedAt={connectedAt}
        scope={scope}
        success={success}
        error={error}
      />
    </div>
  )
}

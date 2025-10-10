import { redirect } from 'next/navigation'

import { MailConsole } from '@/components/mail/MailConsole'
import { getGmailIntegration, getSupabaseUser } from '@/lib/gmail/server'

export const dynamic = 'force-dynamic'

export default async function MailPage() {
  const { supabase, user } = await getSupabaseUser()

  if (!user) {
    redirect('/settings/integrations')
  }

  const integration = await getGmailIntegration(supabase, user.id)

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold text-[var(--color-text, #0f172a)]">Mail Console</h1>
        <p className="text-sm text-gray-600">
          Review inbound messages, respond instantly, and let automations orchestrate follow-ups without leaving TRSREVOS.
        </p>
      </header>
      <MailConsole connected={Boolean(integration?.refresh_token)} />
    </div>
  )
}

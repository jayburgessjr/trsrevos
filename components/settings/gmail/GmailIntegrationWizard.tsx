"use client"

import { useMemo } from "react"
import Link from "next/link"
import { AlertTriangle, ArrowRight, CheckCircle2, Loader2, Mail, ShieldCheck } from "lucide-react"

import { Button } from "@/components/ui/button"

type GmailIntegrationWizardProps = {
  connected: boolean
  connectedAt: string | null
  scope: string | null
  success?: boolean
  error?: string | null
}

const ERROR_MESSAGES: Record<string, string> = {
  auth: "You need to be signed in to connect Gmail. Please authenticate and try again.",
  oauth_start: "We couldn’t start the Google OAuth flow. Check your configuration and retry.",
  oauth_callback: "Google returned an error during authorization. Re-run the connection flow.",
  state_mismatch: "The OAuth request expired or was tampered with. Launch a fresh connection attempt.",
  missing_code: "Google did not provide an authorization code. Try the connection again.",
}

const STEP_CONTENT = [
  {
    title: "Authenticate with Google",
    description: "You’ll be redirected to Google’s secure consent screen to authorize TRSREVOS.",
    icon: Mail,
  },
  {
    title: "Grant Gmail permissions",
    description: "Allow read, send, and modify access so we can orchestrate inbox management on your behalf.",
    icon: ShieldCheck,
  },
  {
    title: "Manage mail inside TRSREVOS",
    description: "Once connected, triage threads, send replies, and archive conversations from the Mail console.",
    icon: ArrowRight,
  },
] as const

export function GmailIntegrationWizard({ connected, connectedAt, scope, success, error }: GmailIntegrationWizardProps) {
  const formattedConnectedAt = useMemo(() => {
    if (!connectedAt) {
      return null
    }

    try {
      return new Intl.DateTimeFormat(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date(connectedAt))
    } catch (err) {
      console.error("Failed to format connectedAt", err)
      return connectedAt
    }
  }, [connectedAt])

  const scopeList = useMemo(() => {
    if (!scope) {
      return []
    }
    return scope.split(" ").filter(Boolean)
  }, [scope])

  const statusPill = connected ? (
    <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
      <CheckCircle2 className="h-4 w-4" />
      Connected
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700">
      <Loader2 className="h-4 w-4 animate-spin" />
      Awaiting Connection
    </span>
  )

  const hasScopes = scopeList.length > 0

  return (
    <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
      <div className="space-y-4">
        {success ? (
          <div className="flex items-start gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
            <CheckCircle2 className="mt-0.5 h-4 w-4" />
            <div>
              <p className="font-medium">Gmail connected</p>
              <p className="text-xs text-emerald-700">
                We stored your refresh token securely in Supabase so background email actions can run without re-authentication.
              </p>
            </div>
          </div>
        ) : null}

        {error ? (
          <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <AlertTriangle className="mt-0.5 h-4 w-4" />
            <div>
              <p className="font-medium">Gmail connection failed</p>
              <p className="text-xs text-red-600">{ERROR_MESSAGES[error] ?? "An unexpected error occurred. Retry the connection."}</p>
            </div>
          </div>
        ) : null}

        <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 border-b border-gray-100 pb-5 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Connect Gmail Workspace</h2>
              <p className="mt-1 text-sm text-gray-600">
                Establish a secure OAuth 2.0 connection with Google Workspace to unlock in-app email orchestration.
              </p>
            </div>
            <div className="flex items-center gap-2">
              {statusPill}
              <Button asChild variant={connected ? "secondary" : "default"}>
                <Link href="/api/gmail/oauth/start">{connected ? "Reconnect" : "Connect Gmail"}</Link>
              </Button>
            </div>
          </div>

          <ol className="mt-6 space-y-4">
            {STEP_CONTENT.map((step, index) => {
              const complete = connected ? true : index === 0 ? false : false
              const Icon = step.icon

              return (
                <li key={step.title} className="flex gap-3">
                  <div
                    className={`mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border ${
                      connected || index === 0 ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-gray-200 bg-gray-50 text-gray-500"
                    }`}
                  >
                    {complete ? <CheckCircle2 className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{step.title}</p>
                    <p className="text-xs text-gray-600">{step.description}</p>
                  </div>
                </li>
              )
            })}
          </ol>
        </section>

        <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-900">What happens after connecting?</h3>
          <ul className="mt-4 space-y-3 text-sm text-gray-600">
            <li className="flex items-start gap-3">
              <ShieldCheck className="mt-0.5 h-4 w-4 text-emerald-600" />
              <span>
                Refresh tokens are encrypted and stored per-user in Supabase. RLS policies ensure other tenants can’t access your
                credentials.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <Mail className="mt-0.5 h-4 w-4 text-blue-600" />
              <span>Use the Mail module to browse inbox threads, archive or trash messages, and send new communications.</span>
            </li>
            <li className="flex items-start gap-3">
              <ArrowRight className="mt-0.5 h-4 w-4 text-gray-500" />
              <span>Agents can now trigger outbound emails via automations using your connected account.</span>
            </li>
          </ul>
        </section>
      </div>

      <aside className="space-y-4">
        <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-900">Connection details</h3>
          <dl className="mt-4 space-y-3 text-xs text-gray-600">
            <div>
              <dt className="font-medium text-gray-800">Status</dt>
              <dd className="mt-1 flex items-center gap-2 text-sm">
                {statusPill}
              </dd>
            </div>
            <div>
              <dt className="font-medium text-gray-800">Connected on</dt>
              <dd className="mt-1 text-sm text-gray-700">{formattedConnectedAt ?? "Not connected"}</dd>
            </div>
            <div>
              <dt className="font-medium text-gray-800">Granted scopes</dt>
              <dd className="mt-1 space-y-1">
                {hasScopes ? (
                  scopeList.map((item) => (
                    <div key={item} className="rounded-md bg-gray-100 px-2 py-1 text-[11px] font-medium text-gray-700">
                      {item}
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">Scopes will appear once the integration is connected.</p>
                )}
              </dd>
            </div>
          </dl>
        </section>

        <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-900">Need help?</h3>
          <p className="mt-2 text-xs text-gray-600">
            Make sure the Google Cloud project has OAuth consent published and the Gmail API enabled. Workspace admins may need to
            pre-authorize the scopes before users can connect.
          </p>
          <p className="mt-3 text-xs text-gray-600">
            If you rotate credentials, click <span className="font-semibold">Reconnect</span> to refresh the tokens without
            losing your existing configuration.
          </p>
        </section>
      </aside>
    </div>
  )
}

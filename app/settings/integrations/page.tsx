import Link from "next/link";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import {
  disconnectGmail,
  disconnectQuickBooks,
  startQuickBooksOAuth,
  syncCalendar,
  syncGmail,
  syncQuickBooks,
} from "./actions";

const CARD_CLASS = "flex flex-col gap-4 rounded-lg border border-gray-200 bg-white p-6";
const BUTTON_CLASS = "rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-800 transition hover:bg-gray-100";
const SECONDARY_BUTTON_CLASS = "rounded-md border border-gray-200 px-3 py-1.5 text-sm text-gray-600 transition hover:bg-gray-100";

function formatDateTime(value: string | null | undefined) {
  if (!value) return "Never";
  try {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }).format(new Date(value));
  } catch (_error) {
    return value;
  }
}

export default async function IntegrationsPage() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return (
      <div className="flex flex-col gap-6 p-8">
        <header className="space-y-2">
          <h1 className="text-2xl font-semibold text-gray-900">Integrations</h1>
          <p className="max-w-2xl text-sm text-gray-600">
            Configure <code className="font-mono">NEXT_PUBLIC_SUPABASE_URL</code> and{' '}
            <code className="font-mono">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> to enable Supabase-backed integrations.
          </p>
        </header>
        <div className="rounded-lg border border-gray-200 bg-white p-6 text-sm text-gray-600">
          <p>Supabase credentials are required to manage Gmail, Calendar, and QuickBooks connections.</p>
        </div>
      </div>
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/settings/integrations");
  }

  const { data: profile } = await supabase
    .from("users")
    .select("organization_id")
    .eq("id", user.id)
    .maybeSingle();

  const organizationId = profile?.organization_id ?? null;

  const gmailConnectionQuery = supabase
    .from("user_integrations")
    .select("connected_at, expiry_date, scope")
    .eq("user_id", user.id)
    .eq("provider", "gmail");
  const { data: gmailConnection } = await gmailConnectionQuery.maybeSingle();

  const gmailIntegrationQuery = supabase
    .from("integrations")
    .select("status, last_synced_at, settings")
    .eq("provider", "gmail");
  if (organizationId) {
    gmailIntegrationQuery.eq("organization_id", organizationId);
  } else {
    gmailIntegrationQuery.is("organization_id", null);
  }
  const { data: gmailIntegration } = await gmailIntegrationQuery.maybeSingle();

  const calendarIntegrationQuery = supabase
    .from("integrations")
    .select("status, last_synced_at, settings")
    .eq("provider", "google_calendar");
  if (organizationId) {
    calendarIntegrationQuery.eq("organization_id", organizationId);
  } else {
    calendarIntegrationQuery.is("organization_id", null);
  }
  const { data: calendarIntegration } = await calendarIntegrationQuery.maybeSingle();

  const quickbooksIntegrationQuery = supabase
    .from("integrations")
    .select("status, last_synced_at, settings")
    .eq("provider", "quickbooks");
  if (organizationId) {
    quickbooksIntegrationQuery.eq("organization_id", organizationId);
  } else {
    quickbooksIntegrationQuery.is("organization_id", null);
  }
  const { data: quickbooksIntegration } = await quickbooksIntegrationQuery.maybeSingle();

  const gmailConnected = Boolean(gmailConnection);
  const gmailStatus = gmailIntegration?.status ?? (gmailConnected ? "connected" : "disconnected");
  const calendarStatus = calendarIntegration?.status ?? (gmailConnected ? "connected" : "disconnected");
  const gmailLastSynced = gmailIntegration?.last_synced_at ?? null;
  const calendarLastSynced = calendarIntegration?.last_synced_at ?? null;
  const quickbooksStatus = quickbooksIntegration?.status ?? "disconnected";
  const quickbooksLastSynced = quickbooksIntegration?.last_synced_at ?? null;

  const gmailSettings = (gmailIntegration?.settings as Record<string, unknown> | undefined) ?? {};
  const quickbooksSettings = (quickbooksIntegration?.settings as Record<string, unknown> | undefined) ?? {};

  return (
    <div className="flex flex-col gap-8 p-8">
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold text-gray-900">Integrations</h1>
        <p className="max-w-2xl text-sm text-gray-600">
          Connect Gmail, Google Calendar, and QuickBooks to keep TRS RevOS synchronized through Supabase edge functions.
        </p>
      </header>

      <section className="grid gap-6 md:grid-cols-2">
        <article className={CARD_CLASS}>
          <div className="flex flex-col gap-1">
            <h2 className="text-lg font-semibold text-gray-900">Gmail Workspace</h2>
            <p className="text-sm text-gray-600">
              OAuth connection for inbox insights, synced through Supabase functions.
            </p>
          </div>

          <dl className="grid gap-2 text-sm text-gray-600">
            <div className="flex justify-between">
              <dt>Status</dt>
              <dd className="font-medium text-gray-900 capitalize">{gmailStatus}</dd>
            </div>
            <div className="flex justify-between">
              <dt>Last mail sync</dt>
              <dd className="font-medium text-gray-900">{formatDateTime(gmailLastSynced)}</dd>
            </div>
            <div className="flex justify-between">
              <dt>Last calendar sync</dt>
              <dd className="font-medium text-gray-900">{formatDateTime(calendarLastSynced)}</dd>
            </div>
          </dl>

          <div className="flex flex-wrap gap-3">
            <Link href="/api/gmail/oauth/start" className={BUTTON_CLASS}>
              Connect Gmail
            </Link>
            <form action={syncGmail}>
              <button type="submit" className={BUTTON_CLASS}>
                Sync mail now
              </button>
            </form>
            <form action={syncCalendar}>
              <button type="submit" className={BUTTON_CLASS}>
                Sync calendar
              </button>
            </form>
            <form action={disconnectGmail}>
              <button type="submit" className={SECONDARY_BUTTON_CLASS}>
                Disconnect
              </button>
            </form>
          </div>

          <div className="rounded-md border border-dashed border-gray-200 p-4 text-xs text-gray-500">
            <p>Scopes: {gmailConnection?.scope ?? "Not granted"}</p>
            <p>Token expires: {formatDateTime(gmailConnection?.expiry_date ?? null)}</p>
            <p>Last sync count: {(gmailSettings.last_sync_count as number | undefined) ?? 0}</p>
            <p>Calendar sync status: {calendarStatus}</p>
          </div>
        </article>

        <article className={CARD_CLASS}>
          <div className="flex flex-col gap-1">
            <h2 className="text-lg font-semibold text-gray-900">QuickBooks Online</h2>
            <p className="text-sm text-gray-600">
              Finance and invoice sync powered by Supabase service role functions.
            </p>
          </div>

          <dl className="grid gap-2 text-sm text-gray-600">
            <div className="flex justify-between">
              <dt>Status</dt>
              <dd className="font-medium text-gray-900 capitalize">{quickbooksStatus}</dd>
            </div>
            <div className="flex justify-between">
              <dt>Last sync</dt>
              <dd className="font-medium text-gray-900">{formatDateTime(quickbooksLastSynced)}</dd>
            </div>
            <div className="flex justify-between">
              <dt>Invoices synced</dt>
              <dd className="font-medium text-gray-900">{(quickbooksSettings.last_sync_count as number | undefined) ?? 0}</dd>
            </div>
          </dl>

          <div className="flex flex-wrap gap-3">
            <form action={startQuickBooksOAuth}>
              <button type="submit" className={BUTTON_CLASS}>
                Connect QuickBooks
              </button>
            </form>
            <form action={syncQuickBooks}>
              <button type="submit" className={BUTTON_CLASS}>
                Sync invoices
              </button>
            </form>
            <form action={disconnectQuickBooks}>
              <button type="submit" className={SECONDARY_BUTTON_CLASS}>
                Disconnect
              </button>
            </form>
          </div>

          <div className="rounded-md border border-dashed border-gray-200 p-4 text-xs text-gray-500">
            <p>Realm ID: {(quickbooksSettings.realm_id as string | undefined) ?? "Not linked"}</p>
            <p>Default client mapping: {(quickbooksSettings.default_client_id as string | undefined) ?? "Not configured"}</p>
          </div>
        </article>
      </section>
    </div>
  );
}

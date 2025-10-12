import { NextResponse } from "next/server";

import { supabaseServer } from "@/lib/supabaseServer";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const kind = typeof body?.kind === "string" ? body.kind : "unknown";

  const supabase = supabaseServer();
  const { error } = await supabase.from("analytics_events").insert({
    event_type: "agent_run",
    entity_type: "projects",
    entity_id: "projects_hub",
    metadata: { kind },
  });

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

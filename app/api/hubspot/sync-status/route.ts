import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/hubspot/sync-status
 * Returns current sync statistics and recent log entries
 */
export async function GET() {
  try {
    const supabase = await createClient();

    // Get sync stats using the database function
    const { data: statsData, error: statsError } = await supabase.rpc("get_sync_stats");

    if (statsError) {
      console.error("Error fetching sync stats:", statsError);
    }

    const stats = statsData?.[0] || {
      opportunities_pending: 0,
      clients_pending: 0,
      contacts_pending: 0,
      sync_errors_24h: 0,
      last_successful_sync: null,
    };

    // Get recent sync log entries
    const { data: recentLogs, error: logsError } = await supabase
      .from("sync_log")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(20);

    if (logsError) {
      console.error("Error fetching sync logs:", logsError);
    }

    return NextResponse.json({
      success: true,
      stats,
      recentLogs: recentLogs || [],
    });
  } catch (error) {
    console.error("Error in sync status route:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch sync status",
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

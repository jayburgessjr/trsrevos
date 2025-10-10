import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/hubspot/sync
 * Triggers the HubSpot sync edge function
 */
export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    // Get the Supabase URL from environment
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!supabaseUrl) {
      throw new Error("NEXT_PUBLIC_SUPABASE_URL not configured");
    }

    // Trigger the edge function
    const { data, error } = await supabase.functions.invoke("hubspot-sync", {
      body: { trigger: "manual", timestamp: new Date().toISOString() },
    });

    if (error) {
      console.error("Error triggering HubSpot sync:", error);
      return NextResponse.json(
        {
          success: false,
          error: "Failed to trigger sync",
          message: error.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "HubSpot sync triggered successfully",
      data,
    });
  } catch (error) {
    console.error("Error in sync route:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to trigger sync",
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/hubspot/sync
 * Get the status of the last sync
 */
export async function GET() {
  try {
    const supabase = await createClient();

    // Query the last sync event from analytics_events
    const { data, error } = await supabase
      .from("analytics_events")
      .select("*")
      .eq("event_type", "hubspot_sync")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error("Error fetching sync status:", error);
      return NextResponse.json(
        {
          success: false,
          error: "Failed to fetch sync status",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      lastSync: data
        ? {
            timestamp: data.created_at,
            status: data.metadata?.status || "unknown",
            dealsSynced: data.metadata?.deals_synced || 0,
            companiesSynced: data.metadata?.companies_synced || 0,
            contactsSynced: data.metadata?.contacts_synced || 0,
          }
        : null,
    });
  } catch (error) {
    console.error("Error in sync status route:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch sync status",
      },
      { status: 500 }
    );
  }
}

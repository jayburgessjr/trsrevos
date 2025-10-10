import { NextResponse } from "next/server";
import { hubspot } from "@/lib/hubspot/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/hubspot/deals
 * Fetches all deals from HubSpot and returns them in a standardized format
 */
export async function GET(request: Request) {
  try {
    if (!hubspot.isConfigured()) {
      return NextResponse.json(
        { error: "HubSpot API key not configured" },
        { status: 503 }
      );
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "100");

    const response = await hubspot.getDeals(limit);

    // Transform HubSpot deals into standardized format
    const deals = response.results.map((deal) => ({
      id: deal.id,
      name: deal.properties.dealname || "Untitled Deal",
      amount: parseFloat(deal.properties.amount || "0"),
      stage: deal.properties.dealstage || "New",
      probability: parseInt(deal.properties.hs_deal_stage_probability || "0"),
      closeDate: deal.properties.closedate || null,
      pipeline: deal.properties.pipeline || "default",
      owner: deal.properties.hubspot_owner_id || null,
      lastModified: deal.properties.hs_lastmodifieddate || deal.updatedAt,
      description: deal.properties.description || null,
      createdAt: deal.createdAt,
      updatedAt: deal.updatedAt,
    }));

    return NextResponse.json({
      success: true,
      deals,
      count: deals.length,
      hasMore: !!response.paging?.next,
    });
  } catch (error) {
    console.error("Error fetching HubSpot deals:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch deals from HubSpot",
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

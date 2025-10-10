import { NextResponse } from "next/server";
import { hubspot } from "@/lib/hubspot/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/hubspot/companies
 * Fetches all companies from HubSpot and returns them in a standardized format
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

    const response = await hubspot.getCompanies(limit);

    // Transform HubSpot companies into standardized format
    const companies = response.results.map((company) => ({
      id: company.id,
      name: company.properties.name || "Untitled Company",
      domain: company.properties.domain || null,
      industry: company.properties.industry || null,
      region: company.properties.country || null,
      arr: parseFloat(company.properties.annualrevenue || "0"),
      employees: parseInt(company.properties.numberofemployees || "0"),
      owner: company.properties.hubspot_owner_id || null,
      lastModified: company.properties.hs_lastmodifieddate || company.updatedAt,
      lifecycleStage: company.properties.lifecyclestage || null,
      createdAt: company.createdAt,
      updatedAt: company.updatedAt,
    }));

    return NextResponse.json({
      success: true,
      companies,
      count: companies.length,
      hasMore: !!response.paging?.next,
    });
  } catch (error) {
    console.error("Error fetching HubSpot companies:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch companies from HubSpot",
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

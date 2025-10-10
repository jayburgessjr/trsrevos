import { NextResponse } from "next/server";
import { hubspot } from "@/lib/hubspot/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/hubspot/contacts
 * Fetches all contacts from HubSpot and returns them in a standardized format
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
    const companyId = searchParams.get("company_id");

    let response;
    if (companyId) {
      // Fetch contacts for specific company
      response = await hubspot.getCompanyContacts(companyId);
    } else {
      // Fetch all contacts
      response = await hubspot.getContacts(limit);
    }

    // Transform HubSpot contacts into standardized format
    const contacts = response.results.map((contact) => ({
      id: contact.id,
      firstName: contact.properties.firstname || "",
      lastName: contact.properties.lastname || "",
      name: `${contact.properties.firstname || ""} ${contact.properties.lastname || ""}`.trim() || "Unnamed Contact",
      email: contact.properties.email || null,
      role: contact.properties.jobtitle || null,
      phone: contact.properties.phone || null,
      owner: contact.properties.hubspot_owner_id || null,
      lastModified: contact.properties.hs_lastmodifieddate || contact.updatedAt,
      createdAt: contact.createdAt,
      updatedAt: contact.updatedAt,
    }));

    return NextResponse.json({
      success: true,
      contacts,
      count: contacts.length,
      hasMore: !companyId && !!(response as any).paging?.next,
    });
  } catch (error) {
    console.error("Error fetching HubSpot contacts:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch contacts from HubSpot",
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

/**
 * HubSpot Sync Edge Function
 *
 * Syncs HubSpot CRM data (deals, companies, contacts) into Supabase.
 * Runs hourly via cron or on-demand via API trigger.
 *
 * Environment variables required:
 * - HUBSPOT_API_KEY: HubSpot private app access token
 * - SUPABASE_URL: Supabase project URL
 * - SUPABASE_SERVICE_ROLE_KEY: Service role key for bypassing RLS
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const HUBSPOT_API_KEY = Deno.env.get("HUBSPOT_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const HUBSPOT_BASE_URL = "https://api.hubapi.com";

interface HubSpotDeal {
  id: string;
  properties: {
    dealname: string;
    amount: string;
    dealstage: string;
    closedate: string;
    pipeline: string;
    hubspot_owner_id: string;
    hs_deal_stage_probability: string;
    hs_lastmodifieddate: string;
    description?: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface HubSpotCompany {
  id: string;
  properties: {
    name: string;
    domain: string;
    industry: string;
    country: string;
    annualrevenue: string;
    hubspot_owner_id: string;
    hs_lastmodifieddate: string;
    lifecyclestage?: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface HubSpotContact {
  id: string;
  properties: {
    firstname: string;
    lastname: string;
    email: string;
    jobtitle: string;
    phone: string;
    hubspot_owner_id: string;
    hs_lastmodifieddate: string;
  };
  createdAt: string;
  updatedAt: string;
}

async function hubspotRequest(endpoint: string) {
  if (!HUBSPOT_API_KEY) {
    throw new Error("HUBSPOT_API_KEY not configured");
  }

  const response = await fetch(`${HUBSPOT_BASE_URL}${endpoint}`, {
    headers: {
      Authorization: `Bearer ${HUBSPOT_API_KEY}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`HubSpot API error (${response.status}): ${error}`);
  }

  return response.json();
}

async function syncDeals(supabase: any): Promise<number> {
  console.log("Fetching deals from HubSpot...");
  const { results } = await hubspotRequest(
    "/crm/v3/objects/deals?limit=100&properties=dealname,amount,dealstage,closedate,pipeline,hubspot_owner_id,hs_deal_stage_probability,hs_lastmodifieddate,description"
  );

  console.log(`Found ${results.length} deals`);

  let synced = 0;
  for (const deal of results as HubSpotDeal[]) {
    // Map HubSpot stage to TRS stage
    const stageMap: Record<string, string> = {
      appointmentscheduled: "Qualify",
      qualifiedtobuy: "Qualify",
      presentationscheduled: "Proposal",
      decisionmakerboughtin: "Proposal",
      contractsent: "Negotiation",
      closedwon: "ClosedWon",
      closedlost: "ClosedLost",
    };

    const stage = stageMap[deal.properties.dealstage?.toLowerCase()] || "New";

    // Find or create client_id from HubSpot company association
    // For now, we'll use the HubSpot deal ID as a reference
    const { error } = await supabase.from("opportunities").upsert({
      id: `hs_${deal.id}`,
      client_id: `hs_company_${deal.properties.hubspot_owner_id || "unknown"}`, // Will be updated when companies sync
      name: deal.properties.dealname || "Untitled Deal",
      amount: parseFloat(deal.properties.amount || "0"),
      stage,
      probability: parseInt(deal.properties.hs_deal_stage_probability || "0"),
      close_date: deal.properties.closedate || null,
      owner_id: `hs_owner_${deal.properties.hubspot_owner_id || "system"}`,
      notes: deal.properties.description ? JSON.stringify([{ body: deal.properties.description }]) : "[]",
      created_at: deal.createdAt,
      updated_at: deal.updatedAt,
    });

    if (error) {
      console.error(`Error syncing deal ${deal.id}:`, error);
    } else {
      synced++;
    }
  }

  return synced;
}

async function syncCompanies(supabase: any): Promise<number> {
  console.log("Fetching companies from HubSpot...");
  const { results } = await hubspotRequest(
    "/crm/v3/objects/companies?limit=100&properties=name,domain,industry,country,annualrevenue,hubspot_owner_id,hs_lastmodifieddate,lifecyclestage"
  );

  console.log(`Found ${results.length} companies`);

  let synced = 0;
  for (const company of results as HubSpotCompany[]) {
    // Determine segment based on ARR
    const arr = parseFloat(company.properties.annualrevenue || "0");
    let segment = "SMB";
    if (arr > 500000) segment = "Enterprise";
    else if (arr > 100000) segment = "Mid";

    // Map lifecycle stage to RevOS phase
    const phaseMap: Record<string, string> = {
      lead: "Discovery",
      marketingqualifiedlead: "Discovery",
      salesqualifiedlead: "Data",
      opportunity: "Algorithm",
      customer: "Architecture",
      evangelist: "Compounding",
    };

    const phase = phaseMap[company.properties.lifecyclestage?.toLowerCase() || ""] || "Discovery";

    const { error } = await supabase.from("clients").upsert({
      id: `hs_company_${company.id}`,
      name: company.properties.name || "Untitled Company",
      segment,
      arr,
      industry: company.properties.industry || null,
      region: company.properties.country || "Unknown",
      phase,
      owner_id: `hs_owner_${company.properties.hubspot_owner_id || "system"}`,
      health: 75, // Default, will be calculated later
      churn_risk: 10, // Default
      status: company.properties.lifecyclestage === "customer" ? "active" : "churned",
      created_at: company.createdAt,
      updated_at: company.updatedAt,
    });

    if (error) {
      console.error(`Error syncing company ${company.id}:`, error);
    } else {
      synced++;
    }
  }

  return synced;
}

async function syncContacts(supabase: any): Promise<number> {
  console.log("Fetching contacts from HubSpot...");
  const { results } = await hubspotRequest(
    "/crm/v3/objects/contacts?limit=100&properties=firstname,lastname,email,jobtitle,phone,hubspot_owner_id,hs_lastmodifieddate"
  );

  console.log(`Found ${results.length} contacts`);

  let synced = 0;
  for (const contact of results as HubSpotContact[]) {
    // Determine power level based on job title
    const title = (contact.properties.jobtitle || "").toLowerCase();
    let power = "User";
    if (title.includes("ceo") || title.includes("cfo") || title.includes("founder")) {
      power = "Economic";
    } else if (title.includes("vp") || title.includes("director") || title.includes("head")) {
      power = "Decision";
    } else if (title.includes("manager") || title.includes("lead")) {
      power = "Influencer";
    }

    // Note: We'd need company associations from HubSpot to link contacts to clients
    // For now, contacts are orphaned until we fetch associations
    const { error } = await supabase.from("contacts").upsert({
      id: `hs_contact_${contact.id}`,
      client_id: null, // Will be updated when we fetch associations
      name: `${contact.properties.firstname || ""} ${contact.properties.lastname || ""}`.trim() || "Unnamed Contact",
      role: contact.properties.jobtitle || null,
      email: contact.properties.email || null,
      phone: contact.properties.phone || null,
      power,
      created_at: contact.createdAt,
      updated_at: contact.updatedAt,
    });

    if (error) {
      console.error(`Error syncing contact ${contact.id}:`, error);
    } else {
      synced++;
    }
  }

  return synced;
}

serve(async (req) => {
  try {
    console.log("HubSpot sync started...");
    const startTime = Date.now();

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Sync in order: companies first (to establish client_id), then deals, then contacts
    const companiesSynced = await syncCompanies(supabase);
    const dealsSynced = await syncDeals(supabase);
    const contactsSynced = await syncContacts(supabase);

    const duration = Date.now() - startTime;

    // Log sync event to analytics
    await supabase.from("analytics_events").insert({
      event_type: "hubspot_sync",
      entity_type: "system",
      entity_id: "hubspot",
      metadata: {
        status: "success",
        deals_synced: dealsSynced,
        companies_synced: companiesSynced,
        contacts_synced: contactsSynced,
        duration_ms: duration,
      },
    });

    console.log(`Sync completed in ${duration}ms`);
    console.log(`- Companies: ${companiesSynced}`);
    console.log(`- Deals: ${dealsSynced}`);
    console.log(`- Contacts: ${contactsSynced}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: "HubSpot sync completed successfully",
        stats: {
          companies_synced: companiesSynced,
          deals_synced: dealsSynced,
          contacts_synced: contactsSynced,
          duration_ms: duration,
        },
      }),
      {
        headers: { "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("HubSpot sync failed:", error);

    // Log error to analytics
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    await supabase.from("analytics_events").insert({
      event_type: "hubspot_sync",
      entity_type: "system",
      entity_id: "hubspot",
      metadata: {
        status: "error",
        error: error instanceof Error ? error.message : String(error),
      },
    });

    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : String(error),
      }),
      {
        headers: { "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});

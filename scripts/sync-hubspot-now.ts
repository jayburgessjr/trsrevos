/**
 * Quick sync script - fetches from HubSpot API and inserts into Supabase
 */

import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

const HUBSPOT_API_KEY = process.env.HUBSPOT_API_KEY!;
const SUPABASE_URL = "https://itolyllbvbdorqapuhyj.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml0b2x5bGxidmJkb3JxYXB1aHlqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAwMzkxOTEsImV4cCI6MjA3NTYxNTE5MX0.QO0bFQFs9npH-GIwGEIjEMxtiiTRB8nTAl9OBjaIg-M";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Generate deterministic UUID from HubSpot ID
function generateUUID(prefix: string, hubspotId: string): string {
  const hash = crypto.createHash('sha256').update(`${prefix}_${hubspotId}`).digest('hex');
  return `${hash.substring(0, 8)}-${hash.substring(8, 12)}-${hash.substring(12, 16)}-${hash.substring(16, 20)}-${hash.substring(20, 32)}`;
}

const STAGE_MAP: Record<string, string> = {
  appointmentscheduled: "New",
  qualifiedtobuy: "Qualify",
  presentationscheduled: "Proposal",
  decisionmakerboughtin: "Proposal",
  contractsent: "Negotiation",
  closedwon: "ClosedWon",
  closedlost: "ClosedLost",
};

async function syncNow() {
  console.log("🚀 Syncing HubSpot data now...\n");

  // Authenticate with Supabase
  console.log("🔒 Authenticating with Supabase...");
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: "admin@trs.com",
    password: "password123",
  });

  if (authError || !authData.session) {
    console.error("❌ Authentication failed:", authError?.message);
    process.exit(1);
  }

  console.log("✅ Authenticated successfully!");
  const { session } = authData;
  const authedSupabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${session.access_token}` } },
  });


  // 1. Fetch companies
  console.log("📦 Fetching companies from HubSpot...");
  const companiesRes = await fetch("https://api.hubapi.com/crm/v3/objects/companies?limit=100", {
    headers: { Authorization: `Bearer ${HUBSPOT_API_KEY}` },
  });
  const companiesData = await companiesRes.json();

  // Use the test admin user ID directly (created by create-test-user.ts)
  const ownerId = "c4c0e68e-8154-4f87-9aca-6b2bc50edbf0";

  const companies = companiesData.results.map((c: any) => ({
    id: generateUUID("company", c.id),
    name: c.properties.name || "Unknown",
    industry: c.properties.industry || null,
    region: c.properties.country || "North America",
    arr: parseFloat(c.properties.annualrevenue || "0"),
    phase: "Data",
    status: "active",
    owner_id: ownerId,
    health: 75,
    churn_risk: 20,
    created_at: c.createdAt,
  }));

  console.log(`✅ Found ${companies.length} companies`);

  const { data: insertedCompanies, error: companyError } = await authedSupabase
    .from("clients")
    .upsert(companies, { onConflict: "id" })
    .select();

  if (companyError) {
    console.error("❌ Error syncing companies:", companyError);
  } else {
    console.log(`✅ Synced ${insertedCompanies?.length || 0} companies to Supabase`);
  }

  // 2. Fetch deals
  console.log("\n💰 Fetching deals from HubSpot...");
  const dealsRes = await fetch("https://api.hubapi.com/crm/v3/objects/deals?limit=100&properties=dealname,amount,dealstage,closedate,hs_deal_stage_probability,pipeline,hubspot_owner_id", {
    headers: { Authorization: `Bearer ${HUBSPOT_API_KEY}` },
  });
  const dealsData = await dealsRes.json();

  // Get first company UUID
  const firstCompanyId = insertedCompanies && insertedCompanies.length > 0
    ? insertedCompanies[0].id
    : null;

  if (!firstCompanyId) {
    console.error("❌ No companies were synced. Cannot create opportunities.");
    process.exit(1);
  }

  const opportunities = dealsData.results.map((d: any) => ({
    id: generateUUID("deal", d.id),
    name: d.properties.dealname || "Unnamed Deal",
    client_id: firstCompanyId, // Use UUID from clients table
    stage: STAGE_MAP[d.properties.dealstage] || "New",
    amount: parseFloat(d.properties.amount || "0"),
    probability: parseInt(d.properties.hs_deal_stage_probability || "0"),
    close_date: d.properties.closedate || null,
    owner_id: ownerId, // Use same owner as companies
    next_step: "Follow up scheduled",
    created_at: d.createdAt,
  }));

  console.log(`✅ Found ${opportunities.length} deals`);

  const { error: oppError } = await authedSupabase
    .from("opportunities")
    .upsert(opportunities, { onConflict: "id" });

  if (oppError) {
    console.error("❌ Error syncing opportunities:", oppError);
  } else {
    console.log(`✅ Synced ${opportunities.length} opportunities to Supabase`);
  }

  console.log("\n✅ Sync complete! Check your dashboard at http://localhost:3000/dashboard");
}

syncNow()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Sync failed:", error);
    process.exit(1);
  });

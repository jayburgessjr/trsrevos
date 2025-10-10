/**
 * Seed Demo Data for HubSpot Integration
 *
 * Creates sample opportunities tied to the existing HubSpot company
 * to demonstrate dashboard and pipeline functionality.
 */

import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Generate deterministic UUID from HubSpot ID
function generateUUID(prefix: string, hubspotId: string): string {
  const hash = crypto.createHash('sha256').update(`${prefix}_${hubspotId}`).digest('hex');
  return `${hash.substring(0, 8)}-${hash.substring(8, 12)}-${hash.substring(12, 16)}-${hash.substring(16, 20)}-${hash.substring(20, 32)}`;
}

async function seedDemoData() {
  console.log("🌱 Seeding HubSpot demo data...\n");

  // 1. Get the existing admin user to own the data
  const { data: adminUser, error: userError } = await supabase
    .from("users")
    .select("id, name")
    .eq("email", "admin@trs.com")
    .single();

  if (userError || !adminUser) {
    console.error("❌ Error fetching admin user:", userError);
    process.exit(1);
  }

  const ownerId = adminUser.id;
  console.log(`✅ Found owner: ${adminUser.name}`);

  // 2. Create/upsert the HubSpot company first
  const hubspotCompanyData = {
    id: generateUUID("company", "115503442653"),
    name: "HubSpot",
    industry: "Software",
    region: "North America",
    arr: 500000,
    phase: "Architecture",
    status: "active",
    health: 85,
    churn_risk: 10,
    created_at: new Date("2025-07-11T18:35:40.016Z").toISOString(),
    owner_id: ownerId,
  };

  const { data: upsertedCompany, error: upsertError } = await supabase
    .from("clients")
    .upsert(hubspotCompanyData, { onConflict: "id" })
    .select()
    .single();

  if (upsertError) {
    console.error("❌ Error creating company:", upsertError);
    process.exit(1);
  }

  const hubspotCompany = upsertedCompany;
  console.log(`✅ Company ready: ${hubspotCompany.name}`);

  // 3. Create sample opportunities for this company
  const sampleOpportunities = [
    {
      id: generateUUID("opp", "1"),
      name: "Enterprise Platform Implementation",
      client_id: hubspotCompany.id,
      stage: "Proposal",
      amount: 85000,
      probability: 65,
      close_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      owner_id: ownerId,
      next_step: "Schedule technical deep dive",
      created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: generateUUID("opp", "2"),
      name: "Q4 Revenue Analytics Upgrade",
      client_id: hubspotCompany.id,
      stage: "Negotiation",
      amount: 125000,
      probability: 80,
      close_date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      owner_id: ownerId,
      next_step: "Final pricing review with CFO",
      created_at: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: generateUUID("opp", "3"),
      name: "Sales Intelligence Dashboard",
      client_id: hubspotCompany.id,
      stage: "Qualify",
      amount: 45000,
      probability: 35,
      close_date: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      owner_id: ownerId,
      next_step: "Requirements gathering call",
      created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: generateUUID("opp", "4"),
      name: "Data Warehouse Migration",
      client_id: hubspotCompany.id,
      stage: "ClosedWon",
      amount: 95000,
      probability: 100,
      close_date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      owner_id: ownerId,
      next_step: "Kickoff scheduled",
      created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: generateUUID("opp", "5"),
      name: "RevOps Automation Suite",
      client_id: hubspotCompany.id,
      stage: "New",
      amount: 150000,
      probability: 20,
      close_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      owner_id: ownerId,
      next_step: "Discovery call scheduled",
      created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ];

  console.log(`\n📊 Creating ${sampleOpportunities.length} demo opportunities...`);

  const { data: insertedOpps, error: oppError } = await supabase
    .from("opportunities")
    .upsert(sampleOpportunities, { onConflict: "id" })
    .select();

  if (oppError) {
    console.error("❌ Error creating opportunities:", oppError);
  } else {
    console.log(`✅ Created ${insertedOpps?.length || 0} opportunities`);
  }

  // 5. Create sample projects
  const sampleProjects = [
    {
      id: generateUUID("proj", "1"),
      name: "Platform Implementation - Phase 1",
      client_id: hubspotCompany.id,
      owner_id: ownerId,
      status: "Active",
      budget: 95000,
      spent: 45000,
      start_date: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      due_date: new Date(Date.now() + 40 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    },
  ];

  console.log(`\n🚀 Creating ${sampleProjects.length} demo projects...`);

  const { data: insertedProj, error: projError } = await supabase
    .from("projects")
    .upsert(sampleProjects, { onConflict: "id" })
    .select();

  if (projError) {
    console.error("❌ Error creating projects:", projError);
  } else {
    console.log(`✅ Created ${insertedProj?.length || 0} projects`);
  }

  console.log("\n✅ Demo data seeding complete!\n");
  console.log("📍 You can now view:");
  console.log("   - Dashboard: http://localhost:3000/dashboard");
  console.log("   - Pipeline: http://localhost:3000/pipeline");
  console.log("   - Clients: http://localhost:3000/clients");
}

seedDemoData()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Seed failed:", error);
    process.exit(1);
  });
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (_req) => {
  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    // 1. Fetch companies
    console.log("📦 Fetching companies from HubSpot...");
    const companiesRes = await fetch("https://api.hubapi.com/crm/v3/objects/companies?limit=100", {
      headers: { Authorization: `Bearer ${Deno.env.get("HUBSPOT_API_KEY")}` },
    });
    const companiesData = await companiesRes.json();
    console.log(`✅ Found ${companiesData.results.length} companies`);

    // 2. Fetch deals
    console.log("\n💰 Fetching deals from HubSpot...");
    const dealsRes = await fetch("https://api.hubapi.com/crm/v3/objects/deals?limit=100&properties=dealname,amount,dealstage,closedate,hs_deal_stage_probability,pipeline,hubspot_owner_id", {
      headers: { Authorization: `Bearer ${Deno.env.get("HUBSPOT_API_KEY")}` },
    });
    const dealsData = await dealsRes.json();
    console.log(`✅ Found ${dealsData.results.length} deals`);

    // 3. Sync companies to Supabase
    const { error: companyError } = await supabaseClient.from('clients').upsert(companiesData.results.map((c: any) => ({
      id: c.id,
      name: c.properties.name,
    })), { onConflict: 'id' })
    if (companyError) {
      throw companyError
    }

    // 4. Sync deals to Supabase
    const { error: dealError } = await supabaseClient.from('opportunities').upsert(dealsData.results.map((d: any) => ({
      id: d.id,
      name: d.properties.dealname,
      amount: d.properties.amount,
      stage: d.properties.dealstage,
      close_date: d.properties.closedate,
    })), { onConflict: 'id' })
    if (dealError) {
      throw dealError
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { "Content-Type": "application/json" },
      status: 500,
    });
  }
});

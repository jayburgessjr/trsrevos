/**
 * HubSpot Webhook Handler
 *
 * Receives property change notifications from HubSpot and updates Supabase.
 * This enables HubSpot → TRS (inbound) synchronization in real-time.
 *
 * Setup in HubSpot:
 * 1. Settings → Integrations → Private Apps → Your App → Webhooks
 * 2. Create webhook subscription for:
 *    - deal.propertyChange (dealname, amount, dealstage, closedate, hubspot_owner_id)
 *    - company.propertyChange (name, annualrevenue, lifecyclestage)
 *    - contact.propertyChange (firstname, lastname, email, jobtitle)
 * 3. Set webhook URL: https://your-project.supabase.co/functions/v1/hubspot-webhook
 * 4. Verify with test event
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

interface HubSpotWebhookEvent {
  objectId: number;
  propertyName: string;
  propertyValue: string;
  eventType: string;
  subscriptionId: number;
  portalId: number;
  appId: number;
  occurredAt: number;
  subscriptionType: string;
  attemptNumber: number;
}

// Stage mappings: HubSpot → TRS
const STAGE_MAP: Record<string, string> = {
  appointmentscheduled: "Qualify",
  qualifiedtobuy: "Qualify",
  presentationscheduled: "Proposal",
  decisionmakerboughtin: "Proposal",
  contractsent: "Negotiation",
  closedwon: "ClosedWon",
  closedlost: "ClosedLost",
};

// Phase mappings: HubSpot lifecycle → RevOS phase
const PHASE_MAP: Record<string, string> = {
  lead: "Discovery",
  marketingqualifiedlead: "Discovery",
  salesqualifiedlead: "Data",
  opportunity: "Algorithm",
  customer: "Architecture",
  evangelist: "Compounding",
};

async function handleDealUpdate(objectId: number, propertyName: string, propertyValue: string) {
  const dealId = `hs_${objectId}`;

  console.log(`Processing deal update: ${dealId}, ${propertyName} = ${propertyValue}`);

  let updateData: any = {
    updated_at: new Date().toISOString(),
    needs_sync: false, // Already synced from HubSpot
    hubspot_synced: true,
    last_synced_at: new Date().toISOString(),
  };

  // Map HubSpot properties to Supabase columns
  switch (propertyName) {
    case "dealname":
      updateData.name = propertyValue;
      break;
    case "amount":
      updateData.amount = parseFloat(propertyValue || "0");
      break;
    case "dealstage":
      updateData.stage = STAGE_MAP[propertyValue?.toLowerCase()] || "New";
      break;
    case "closedate":
      updateData.close_date = propertyValue;
      break;
    case "hs_deal_stage_probability":
      updateData.probability = parseInt(propertyValue || "0");
      break;
    case "hubspot_owner_id":
      updateData.owner_id = `hs_owner_${propertyValue}`;
      break;
    default:
      console.log(`Unmapped property: ${propertyName}`);
      return;
  }

  const { error } = await supabase
    .from("opportunities")
    .update(updateData)
    .eq("id", dealId);

  if (error) {
    console.error(`Error updating deal ${dealId}:`, error);
    await supabase.from("sync_log").insert({
      object_type: "opportunity",
      object_id: dealId,
      direction: "inbound",
      status: "error",
      message: `Failed to update ${propertyName}`,
      error_details: error,
    });
    throw error;
  }

  // Log success
  await supabase.from("sync_log").insert({
    object_type: "opportunity",
    object_id: dealId,
    direction: "inbound",
    status: "success",
    message: `Updated ${propertyName} from HubSpot webhook`,
    metadata: { property: propertyName, value: propertyValue },
    completed_at: new Date().toISOString(),
  });

  console.log(`Successfully updated deal ${dealId}`);
}

async function handleCompanyUpdate(objectId: number, propertyName: string, propertyValue: string) {
  const companyId = `hs_company_${objectId}`;

  console.log(`Processing company update: ${companyId}, ${propertyName} = ${propertyValue}`);

  let updateData: any = {
    updated_at: new Date().toISOString(),
    needs_sync: false,
    hubspot_synced: true,
    last_synced_at: new Date().toISOString(),
  };

  switch (propertyName) {
    case "name":
      updateData.name = propertyValue;
      break;
    case "annualrevenue":
      const arr = parseFloat(propertyValue || "0");
      updateData.arr = arr;
      // Update segment based on ARR
      if (arr > 500000) updateData.segment = "Enterprise";
      else if (arr > 100000) updateData.segment = "Mid";
      else updateData.segment = "SMB";
      break;
    case "lifecyclestage":
      updateData.phase = PHASE_MAP[propertyValue?.toLowerCase()] || "Discovery";
      updateData.status = propertyValue === "customer" ? "active" : "churned";
      break;
    case "industry":
      updateData.industry = propertyValue;
      break;
    case "country":
      updateData.region = propertyValue;
      break;
    case "hubspot_owner_id":
      updateData.owner_id = `hs_owner_${propertyValue}`;
      break;
    default:
      console.log(`Unmapped property: ${propertyName}`);
      return;
  }

  const { error } = await supabase
    .from("clients")
    .update(updateData)
    .eq("id", companyId);

  if (error) {
    console.error(`Error updating company ${companyId}:`, error);
    await supabase.from("sync_log").insert({
      object_type: "client",
      object_id: companyId,
      direction: "inbound",
      status: "error",
      message: `Failed to update ${propertyName}`,
      error_details: error,
    });
    throw error;
  }

  await supabase.from("sync_log").insert({
    object_type: "client",
    object_id: companyId,
    direction: "inbound",
    status: "success",
    message: `Updated ${propertyName} from HubSpot webhook`,
    metadata: { property: propertyName, value: propertyValue },
    completed_at: new Date().toISOString(),
  });

  console.log(`Successfully updated company ${companyId}`);
}

async function handleContactUpdate(objectId: number, propertyName: string, propertyValue: string) {
  const contactId = `hs_contact_${objectId}`;

  console.log(`Processing contact update: ${contactId}, ${propertyName} = ${propertyValue}`);

  let updateData: any = {
    updated_at: new Date().toISOString(),
    needs_sync: false,
    hubspot_synced: true,
    last_synced_at: new Date().toISOString(),
  };

  switch (propertyName) {
    case "firstname":
    case "lastname":
      // Fetch current contact to rebuild full name
      const { data: contact } = await supabase
        .from("contacts")
        .select("name")
        .eq("id", contactId)
        .maybeSingle();

      if (propertyName === "firstname") {
        const lastname = contact?.name?.split(" ")[1] || "";
        updateData.name = `${propertyValue} ${lastname}`.trim();
      } else {
        const firstname = contact?.name?.split(" ")[0] || "";
        updateData.name = `${firstname} ${propertyValue}`.trim();
      }
      break;
    case "email":
      updateData.email = propertyValue;
      break;
    case "jobtitle":
      updateData.role = propertyValue;
      // Infer power level from title
      const title = propertyValue?.toLowerCase() || "";
      if (title.includes("ceo") || title.includes("cfo") || title.includes("founder")) {
        updateData.power = "Economic";
      } else if (title.includes("vp") || title.includes("director") || title.includes("head")) {
        updateData.power = "Decision";
      } else if (title.includes("manager") || title.includes("lead")) {
        updateData.power = "Influencer";
      } else {
        updateData.power = "User";
      }
      break;
    case "phone":
      updateData.phone = propertyValue;
      break;
    default:
      console.log(`Unmapped property: ${propertyName}`);
      return;
  }

  const { error } = await supabase
    .from("contacts")
    .update(updateData)
    .eq("id", contactId);

  if (error) {
    console.error(`Error updating contact ${contactId}:`, error);
    await supabase.from("sync_log").insert({
      object_type: "contact",
      object_id: contactId,
      direction: "inbound",
      status: "error",
      message: `Failed to update ${propertyName}`,
      error_details: error,
    });
    throw error;
  }

  await supabase.from("sync_log").insert({
    object_type: "contact",
    object_id: contactId,
    direction: "inbound",
    status: "success",
    message: `Updated ${propertyName} from HubSpot webhook`,
    metadata: { property: propertyName, value: propertyValue },
    completed_at: new Date().toISOString(),
  });

  console.log(`Successfully updated contact ${contactId}`);
}

serve(async (req) => {
  try {
    console.log("Received HubSpot webhook request");

    const events: HubSpotWebhookEvent[] = await req.json();

    console.log(`Processing ${events.length} webhook events`);

    for (const event of events) {
      // Only handle property change events
      if (event.eventType !== "propertyChange") {
        console.log(`Skipping non-propertyChange event: ${event.eventType}`);
        continue;
      }

      // Determine object type from subscription type
      const objectType = event.subscriptionType.split(".")[0]; // "deal", "company", or "contact"

      switch (objectType) {
        case "deal":
          await handleDealUpdate(event.objectId, event.propertyName, event.propertyValue);
          break;
        case "company":
          await handleCompanyUpdate(event.objectId, event.propertyName, event.propertyValue);
          break;
        case "contact":
          await handleContactUpdate(event.objectId, event.propertyName, event.propertyValue);
          break;
        default:
          console.log(`Unknown object type: ${objectType}`);
      }
    }

    return new Response(JSON.stringify({ success: true, processed: events.length }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Webhook processing error:", error);
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

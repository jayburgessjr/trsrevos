export const connect = async () => {
  if (!process.env.HUBSPOT_API_KEY) {
    throw new Error("HubSpot API key not found");
  }
};

export const sync = async () => {
  await connect();
  const response = await fetch("https://itolyllbvbdorqapuhyj.supabase.co/functions/v1/hubspot-sync", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
    },
    body: JSON.stringify({ name: "HubSpot Sync" }),
  });
  if (!response.ok) {
    throw new Error("Failed to sync HubSpot data");
  }
};

export const test = async () => {
  await connect();
  const response = await fetch("https://api.hubapi.com/crm/v3/objects/companies?limit=1", {
    headers: {
      Authorization: `Bearer ${process.env.HUBSPOT_API_KEY}`,
    },
  });
  if (!response.ok) {
    throw new Error("HubSpot API key is invalid");
  }
};

export const disconnect = async () => {};

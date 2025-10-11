// Integration utilities for TRS platform
// All integrations are handled via API routes to avoid bundling Node.js-only dependencies

type IntegrationProvider = "google" | "quickbooks" | "slack";

export const connectIntegration = async (provider: IntegrationProvider) => {
  // All integrations should be called via API routes to avoid bundling issues
  console.log(`${provider} integration should be handled via API route`);
};

export const disconnectIntegration = async (provider: IntegrationProvider) => {
  // All integrations should be called via API routes
  console.log(`${provider} integration should be handled via API route`);
};

export const listLabels = async (accessToken: string) => {
  // This should be called via API route
  const response = await fetch('/api/integrations/google/labels', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ accessToken }),
  });
  return response.json();
};

export const listEvents = async (accessToken: string) => {
  // Call via API route to avoid bundling googleapis on client
  const response = await fetch('/api/integrations/google/events', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ accessToken }),
  });
  return response.json();
};

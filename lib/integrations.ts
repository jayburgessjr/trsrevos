import * as hubspot from "./integrations/hubspot";
import * as google from "./integrations/google";
import * as quickbooks from "./integrations/quickbooks";
import * as slack from "./integrations/slack";

const integrations = {
  hubspot,
  google,
  quickbooks,
  slack,
};

type IntegrationProvider = keyof typeof integrations;

export const connectIntegration = async (provider: IntegrationProvider) => {
  await integrations[provider].connect();
};

export const disconnectIntegration = async (provider: IntegrationProvider) => {
  await integrations[provider].disconnect();
};

export const listLabels = async (accessToken: string) => {
  return await google.listLabels(accessToken);
};

export const listEvents = async (accessToken: string) => {
  return await google.listEvents(accessToken);
};

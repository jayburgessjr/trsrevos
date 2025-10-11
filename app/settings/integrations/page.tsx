"use client";
import IntegrationCard from "@/components/integrations/IntegrationCard";
import { connectIntegration, disconnectIntegration, listLabels, listEvents } from "@/lib/integrations";
import { useState } from "react";

export default function IntegrationsPage() {
  const [integrations, setIntegrations] = useState([
    {
      provider: "Google",
      description: "Sync Gmail, Calendar, Drive, and Docs.",
      connected: false,
      lastSync: "Never",
    },
    {
      provider: "QuickBooks",
      description: "Sync invoices and financial data.",
      connected: false,
      lastSync: "Never",
    },
    {
      provider: "Slack",
      description: "Send alerts and pipeline notifications.",
      connected: false,
      lastSync: "Never",
    },
  ]);
  const [accessToken, setAccessToken] = useState("");

  const handleConnect = async (provider: string) => {
    await connectIntegration(provider as any);
    setIntegrations((prev) =>
      prev.map((i) => (i.provider === provider ? { ...i, connected: true } : i))
    );
  };

  const handleDisconnect = async (provider: string) => {
    await disconnectIntegration(provider as any);
    setIntegrations((prev) =>
      prev.map((i) => (i.provider === provider ? { ...i, connected: false } : i))
    );
  };

  const handleListLabels = async () => {
    const labels = await listLabels(accessToken);
    console.log(labels);
  };

  const handleListEvents = async () => {
    const events = await listEvents(accessToken);
    console.log(events);
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Integrations</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {integrations.map((integration) => (
          <IntegrationCard
            key={integration.provider}
            provider={integration.provider}
            description={integration.description}
            connected={integration.connected}
            lastSync={integration.lastSync}
            onConnect={() => handleConnect(integration.provider)}
            onDisconnect={() => handleDisconnect(integration.provider)}
          />
        ))}
      </div>
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">Google API</h2>
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="Access Token"
            value={accessToken}
            onChange={(e) => setAccessToken(e.target.value)}
            className="border rounded-lg p-2 w-full"
          />
          <button onClick={handleListLabels} className="bg-blue-500 text-white py-2 px-4 rounded-lg">List Labels</button>
          <button onClick={handleListEvents} className="bg-blue-500 text-white py-2 px-4 rounded-lg">List Events</button>
        </div>
      </div>
    </div>
  );
}
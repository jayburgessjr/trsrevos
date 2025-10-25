import { redirect } from "next/navigation";

import DashboardClient from "./DashboardClient";
import { getExecDashboard } from "@/core/exec/actions";
import { exportForecastSnapshot, getForecastReviewState } from "@/core/exec/review";
import { listClients } from "@/core/clients/store";
import type { Client } from "@/core/clients/types";

// Helper to calculate monthly revenue from clients
function calculateMonthlyRevenue(client: Client): number {
  if (!client.dealType) return 0;

  switch (client.dealType) {
    case "invoiced":
      return client.monthlyInvoiced ?? 0;
    case "equity_partnership":
      const clientMRR = client.compounding?.currentMRR ?? 0;
      return 2500 + (clientMRR * 0.02);
    case "equity":
      const equityMRR = client.compounding?.currentMRR ?? 0;
      return equityMRR * (client.equityPercentage ?? 15) / 100;
    default:
      return 0;
  }
}

export default async function DashboardPage() {
  const data = await getExecDashboard();
  const review = await getForecastReviewState(data.scope);

  // Calculate financial metrics from clients
  const clients = listClients();
  let invoicedRevenue = 0;
  let equityRevenue = 0;
  let equityPartnershipRevenue = 0;
  let totalMonthlyRevenue = 0;

  clients.forEach((client) => {
    const revenue = calculateMonthlyRevenue(client);
    totalMonthlyRevenue += revenue;

    if (client.dealType === "invoiced") {
      invoicedRevenue += revenue;
    } else if (client.dealType === "equity") {
      equityRevenue += revenue;
    } else if (client.dealType === "equity_partnership") {
      equityPartnershipRevenue += revenue;
    }
  });

  const financialMetrics = {
    invoicedRevenue: Math.round(invoicedRevenue),
    equityRevenue: Math.round(equityRevenue),
    equityPartnershipRevenue: Math.round(equityPartnershipRevenue),
    totalMonthlyRevenue: Math.round(totalMonthlyRevenue),
  };

  const commitTrajectory = data.forecast.p50;
  const bestTrajectory = data.forecast.p90;
  const upsideTrajectory = data.forecast.p50.map((point, index) => ({
    ts: point.ts,
    value: Math.round(
      ((point.value ?? 0) + (data.forecast.p90[index]?.value ?? point.value ?? 0)) / 2,
    ),
  }));

  async function handleExport() {
    "use server";

    await exportForecastSnapshot(data.scope, {
      scenario: "commit",
      commitTrajectory,
      upsideTrajectory,
      bestTrajectory,
      metadata: {
        coverage: data.sales.pipelineCoverageX,
        riskIndex: data.ribbon.riskIndexPct,
      },
    });

    redirect("/dashboard?tab=Overview&export=success");
  }

  return (
    <DashboardClient
      data={data}
      review={review}
      exportAction={handleExport}
      financialMetrics={financialMetrics}
    />
  );
}

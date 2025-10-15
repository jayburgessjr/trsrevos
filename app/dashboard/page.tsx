import { redirect } from "next/navigation";

import DashboardClient from "./DashboardClient";
import { getExecDashboard } from "@/core/exec/actions";
import { exportForecastSnapshot, getForecastReviewState } from "@/core/exec/review";

export default async function DashboardPage() {
  const data = await getExecDashboard();
  const review = await getForecastReviewState(data.scope);

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

  return <DashboardClient data={data} review={review} exportAction={handleExport} />;
}

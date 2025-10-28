import { redirect } from "next/navigation";

import PipelineClient from "./PipelineClient";
import {
  calculatePipelineMetrics,
  getOpportunities,
  getPipelineAutomationState,
} from "@/core/pipeline/actions";
import { getSampleOpportunities } from "@/core/pipeline/sample-data";
import { getAuthContext } from "@/lib/server/auth";

export const dynamic = "force-dynamic";

export default async function PipelinePage() {
  const automation = await getPipelineAutomationState();
  const supabaseConfigured =
    Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL) &&
    Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

  let userId = "demo-user";
  let opportunities = getSampleOpportunities();
  let metrics = calculatePipelineMetrics(opportunities);
  let isSampleData = true;

  if (supabaseConfigured) {
    try {
      const auth = await getAuthContext();

      if (!auth.user) {
        redirect("/login");
      }

      userId = auth.user.id;
      opportunities = await getOpportunities();
      metrics = calculatePipelineMetrics(opportunities);
      isSampleData = false;
    } catch (error) {
      console.error("pipeline:failed-to-load-live-data", error);
      opportunities = getSampleOpportunities();
      metrics = calculatePipelineMetrics(opportunities);
      isSampleData = true;
    }
  }

  return (
    <PipelineClient
      opportunities={opportunities}
      metrics={metrics}
      automation={automation}
      userId={userId}
      isSampleData={isSampleData}
    />
  );
}

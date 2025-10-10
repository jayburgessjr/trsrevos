import { getOpportunities, getPipelineMetrics } from "@/core/pipeline/actions";
import PipelineClient from "./PipelineClient";

export default async function PipelinePage() {
  const [opportunities, metrics] = await Promise.all([
    getOpportunities(),
    getPipelineMetrics(),
  ]);

  return <PipelineClient opportunities={opportunities} metrics={metrics} />;
}

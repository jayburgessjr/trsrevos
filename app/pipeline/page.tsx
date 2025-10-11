import { getOpportunities, getPipelineMetrics } from "@/core/pipeline/actions";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import PipelineClient from "./PipelineClient";

export default async function PipelinePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [opportunities, metrics] = await Promise.all([
    getOpportunities(),
    getPipelineMetrics(),
  ]);

  return <PipelineClient opportunities={opportunities} metrics={metrics} userId={user.id} />;
}

// lib/types.ts
export type VwClientOverview = {
  client_id: string;
  client_name: string;
  client_type: string | null;
  organization_id: string | null;
  owner_id: string | null;

  pipeline_id: string | null;
  pipeline_stage: string | null;
  pipeline_value: number | null;
  weighted_value: number | null;
  probability: number | null;

  finance_id: string | null;
  mrr: number | null;
  ar_outstanding: number | null;
  ar_collected: number | null;
};

export type VwPipelineForecast = {
  stage: string;
  deals: number;
  total_value: number;
  weighted_value: number;
  all_total_value: number;
  all_weighted_value: number;
};

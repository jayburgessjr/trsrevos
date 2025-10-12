DROP VIEW IF EXISTS public.vw_client_overview;

CREATE VIEW public.vw_client_overview AS
SELECT
  c.id AS client_id,
  c.name AS client_name,
  c.segment AS client_type,
  NULLIF(to_jsonb(c) ->> 'organization_id', '')::uuid AS organization_id,
  c.owner_id,
  pip.id AS pipeline_id,
  pip.stage AS pipeline_stage,
  pip.amount AS pipeline_value,
  CASE
    WHEN pip.amount IS NOT NULL AND pip.probability IS NOT NULL THEN
      pip.amount * (pip.probability::numeric / 100)
    ELSE NULL
  END AS weighted_value,
  pip.probability,
  fin.id AS finance_id,
  fin.monthly_recurring_revenue AS mrr,
  fin.outstanding_invoices AS ar_outstanding,
  COALESCE(
    NULLIF((to_jsonb(fin) ->> 'ar_collected'), '')::numeric,
    NULLIF((to_jsonb(fin) ->> 'total_collected'), '')::numeric,
    0::numeric
  ) AS ar_collected
FROM public.clients c
LEFT JOIN LATERAL (
  SELECT o.id, o.stage, o.amount, o.probability
  FROM public.opportunities o
  WHERE o.client_id = c.id
  ORDER BY o.updated_at DESC NULLS LAST, o.created_at DESC NULLS LAST
  LIMIT 1
) pip ON TRUE
LEFT JOIN LATERAL (
  SELECT f.*
  FROM public.finance f
  WHERE f.client_id = c.id
  ORDER BY f.updated_at DESC NULLS LAST
  LIMIT 1
) fin ON TRUE;

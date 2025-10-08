# Data Schema (Minimal, Enforceable)

## Tables
- trs_scores(id, account_id, score, band, computed_at, drivers_json)
- deliverables(id, account_id, type, status, owner_id, due_at, export_link, last_reviewed_at)
- governance_actions(id, entity, entity_id, requirement, status, owner_id, evidence_link, decided_at)
- model_cards(id, name, version, training_sources, metrics_json, thresholds_json, retrain_at, approver_id)
- agents(id, key, name, kpi_owned, sop_link, prompt_ref, input_schema, output_schema, enabled)
- agent_bindings(id, agent_id, deliverable_id, kpi_key, ownership_level)

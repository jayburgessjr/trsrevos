# Governance Checklists (Non-Bypassable Gates)

## Activation Requirements (Module/Agent/Experiment)
- ROI Hypothesis: link to quantified impact model
- QA Checklist: unit tests, e2e path, rollback
- Owner Assigned: name, role, decision rights
- Payback Window: target <= 90 days (Tier 1) else reason
- TRS Score Lever: metric(s) this impacts

## Decision Log
- entity • entity_id • requirement • status • owner • evidence_link • decided_at

## Auto-Action Guardrails
- If model performance < thresholds → switch to Recommend-only and route to Principal review.

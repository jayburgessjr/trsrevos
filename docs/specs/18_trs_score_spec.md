# TRS Score — Spec

## Inputs
- CAC, NRR, churn, payback, gross margin deltas
- Execution velocity, incidents, forecast accuracy

## Weights (default)
- Margin 25, NRR 20, Churn 20, CAC 15, Payback 10, Forecast 10

## Bands
- Red < 60 → Stabilization
- Yellow 60–69 → Incremental
- Green ≥ 70 → Brilliant

## Alerts
- Fire on band changes; include driver diffs.

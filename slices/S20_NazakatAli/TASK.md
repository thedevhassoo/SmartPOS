# S20 - View explained AI recommendations and threshold suggestions

Slice: S20
Assigned member: Nazakat Ali
Branch: feature-nazakat
Dependencies: S16, S19
Requirements: FR-07, FR-10; NFR-03; NFR-04 (final)
Acceptance criteria: AC-FR-07-05, AC-FR-10-01, AC-FR-10-02, AC-FR-10-03, AC-FR-10-04, AC-FR-10-05, AC-FR-10-06

## Scope

Owner/Manager views evidence-backed local recommendations and suggested thresholds, displays evidence/uncertainty and Insufficient Data; explicit authorized acceptance to change manual threshold, never auto-buy or mutate stock/sales. Use the approved local evidence-based method. Use local explainable 30-day moving average, at least 30 days history and 10 net units; ceil 7-day coverage for suggested threshold; insufficient data is explicit. Human authorization to adopt a threshold; no stock/sales/purchase mutation. Deterministic fixture checks and held-out error metric only when data permits.

## Source handoff

The feature source and representative passing domain test are supplied. The requester has approved the integrated application for publication. The assigned member publishes the complete code/ tree on the designated branch in the documented sequence.

## Baseline acceptance checks

F: deterministic known-data recommendation with supporting facts, accepted threshold and unchanged stock; EP: sufficient/sparse/missing data; N: Cashier denied, no silent threshold override or supplier order; recommendation failure cannot affect Push.; 29/30 days and 9/10 net units; independent expected threshold; no claim of accuracy without evaluation.

G1 scope/dependencies/criteria; G2 actual functional and negative results; G3 architecture/permissions; G4 regression on candidate; human decision before integration. For shared criteria record partial versus final verification. See EVIDENCE.md.

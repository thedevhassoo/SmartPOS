# S16 - View sales dashboard and product performance

Slice: S16
Assigned member: Hassan Adil
Branch: feature-hassan
Dependencies: S13, S17, S18
Requirements: FR-08, FR-09; NFR-03; NFR-04 (final)
Acceptance criteria: AC-FR-08-01, AC-FR-08-02, AC-FR-08-03, AC-FR-08-04, AC-FR-08-05, AC-FR-08-06, AC-FR-09-01, AC-FR-09-02, AC-FR-09-03, AC-FR-09-04, AC-FR-09-05, AC-FR-09-06

## Scope

Owner/Manager dashboard and date-filtered reports from Completed Sales; product units, trends and profitability separately, Insufficient Data where facts/costs lacking. Use committed refund/return facts from S17/S18; no draft inclusion. Use only approved PRD/DR-21-25 metrics: gross sales, count, completed refunds, net sales and units; PKT event dates; approved periods; no Draft Bills. Implement refund-aware reporting after S17/S18, cost snapshots and missing-cost handling, category demand/trends per approved thresholds. Reference DreamsPOS only for visuals; no reference data/features.

## Source handoff

The feature source and representative passing domain test are supplied. The requester has approved the integrated application for publication. The assigned member publishes the complete code/ tree on the designated branch in the documented sequence.

## Baseline acceptance checks

F: known fixture totals/units across dates; N: Cashier direct analytics denied, missing costs show unavailable; EP: empty period and sparse history; boundary start/end; regression after refunds/returns under approved policy.; completed versus pending refunds, resellable versus non-resellable returns, missing cost, all approved periods.

G1 scope/dependencies/criteria; G2 actual functional and negative results; G3 architecture/permissions; G4 regression on candidate; human decision before integration. For shared criteria record partial versus final verification. See EVIDENCE.md.

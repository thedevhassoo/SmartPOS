# S19 - Monitor stock, low-stock and expiry alerts

Slice: S19
Assigned member: Nazakat Ali
Branch: feature-nazakat
Dependencies: S04, S10, S13, S18
Requirements: FR-07; NFR-03; NFR-04 (final)
Acceptance criteria: AC-FR-07-01, AC-FR-07-02, AC-FR-07-03, AC-FR-07-04

## Scope

Owner/Manager dashboard for actual stock, zero stock, configurable per-product low-stock threshold and approaching expiry based on approved 30-day default. S20 adds advisory suggested threshold. Use positive Available Stock at or below manual threshold for Low Stock, zero for Out of Stock, 30-calendar-day approaching expiry default, separate expired state; approved alert priority and actual facts only.

## Source handoff

The feature source and representative passing domain test are supplied. The requester has approved the integrated application for publication. The assigned member publishes the complete code/ tree on the designated branch in the documented sequence.

## Baseline acceptance checks

F: zero-stock and low-stock views, save threshold, date-based expiry alert; EP/BVA: stock threshold-1/threshold/threshold+1, 0; expiry window last/next day; N: Cashier threshold change denied; actual stock with no history.

G1 scope/dependencies/criteria; G2 actual functional and negative results; G3 architecture/permissions; G4 regression on candidate; human decision before integration. For shared criteria record partial versus final verification. See EVIDENCE.md.

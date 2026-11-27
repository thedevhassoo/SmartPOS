# S04 - Receive stock batches and inspect expiry and costs

Slice: S04
Assigned member: Muhammad Sana Ullah
Branch: feature-sana
Dependencies: S03
Requirements: FR-05, FR-06; NFR-03; NFR-04 (final); NFR-02
Acceptance criteria: AC-FR-05-01, AC-FR-06-01, AC-FR-06-02, AC-FR-06-03, AC-FR-06-04, AC-FR-06-06, AC-FR-06-05

## Scope

Owner/Manager enters incoming Product Batch quantity, expiry and purchase cost; Inventory owns stock changes; show batch-specific quantities/dates/cost and Recorded Stock. Cashier cannot alter expiry. Use the approved Recorded/Available Stock distinction. Positive integer batch quantity, exact PKR cost, valid expiry or explicit non-expiring status; expired items are not sellable. Ensure deterministic FEFO allocation is available to S13; capture actual batch cost.

## Source handoff

The feature source and representative passing domain test are supplied. The requester has approved the integrated application for publication. The assigned member publishes the complete code/ tree on the designated branch in the documented sequence.

## Baseline acceptance checks

F: receive two batches with distinct dates/costs; verify quantities/cost persist and stock total; N/EP: invalid quantity/date/cost, Cashier denied; BVA: quantity 0 and 1; rollback on injected receipt failure.

G1 scope/dependencies/criteria; G2 actual functional and negative results; G3 architecture/permissions; G4 regression on candidate; human decision before integration. For shared criteria record partial versus final verification. See EVIDENCE.md.

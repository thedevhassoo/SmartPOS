# S18 - Inspect returns and decide stock disposition

Slice: S18
Assigned member: Muhammad Faseeh
Branch: feature-faseeh
Dependencies: S04, S15, S17
Requirements: FR-09, FR-12, FR-13; NFR-03; NFR-04 (final); NFR-02
Acceptance criteria: AC-FR-09-05, AC-FR-12-01, AC-FR-12-02, AC-FR-12-03, AC-FR-12-04, AC-FR-12-05, AC-FR-12-06, AC-FR-13-04, AC-FR-13-08

## Scope

Cashier records initial inspection; Owner/Manager decides resellable or non-resellable; only approved resellable units enter Available Stock once through Inventory. Keep monetary and stock states separate and update reporting per approved rule. Separate physical and monetary status. Only authorized resellability confirmation changes Available Stock once, through Inventory; non-resellable/expired/disputed goods excluded. Publish committed disposition facts for S16.

## Source handoff

The feature source and representative passing domain test are supplied. The requester has approved the integrated application for publication. The assigned member publishes the complete code/ tree on the designated branch in the documented sequence.

## Baseline acceptance checks

F: pending return excluded, manager confirms resellable increases stock once; non-resellable excluded; N: Cashier disposition, duplicate decision, excess returned quantity, injected failure rolls back; regress refund and stock reconciliation.

G1 scope/dependencies/criteria; G2 actual functional and negative results; G3 architecture/permissions; G4 regression on candidate; human decision before integration. For shared criteria record partial versus final verification. See EVIDENCE.md.

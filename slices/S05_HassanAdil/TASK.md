# S05 - Create, rename and assign storage locations

Slice: S05
Assigned member: Hassan Adil
Branch: feature-hassan
Dependencies: S03
Requirements: FR-15; NFR-03; NFR-04 (final)
Acceptance criteria: AC-FR-15-01, AC-FR-15-02, AC-FR-15-03, AC-FR-15-04, AC-FR-15-05, AC-FR-15-12

## Scope

Owner/Manager creates or renames normalized locations and assigns/replaces one current location; authorized lookup including Cashier shows location or Unassigned. Catalog alone changes product reference. Canonical normalized location, one assignment or Unassigned; only Catalog writes product references through its own public service. Audit only as required by PRD.

## Source handoff

The feature source and representative passing domain test are supplied. The requester has approved the integrated application for publication. The assigned member publishes the complete code/ tree on the designated branch in the documented sequence.

## Baseline acceptance checks

F: create A/B, assign and move product, rename and see current value in lookup; EP: case/format variants reuse identity, spelling difference distinct; N: Cashier mutation denied; stock/price unchanged.

G1 scope/dependencies/criteria; G2 actual functional and negative results; G3 architecture/permissions; G4 regression on candidate; human decision before integration. For shared criteria record partial versus final verification. See EVIDENCE.md.

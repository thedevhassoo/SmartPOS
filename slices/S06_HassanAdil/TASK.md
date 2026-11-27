# S06 - Filter products and safely delete locations

Slice: S06
Assigned member: Hassan Adil
Branch: feature-hassan
Dependencies: S05
Requirements: FR-15; NFR-03; NFR-04 (final); NFR-02
Acceptance criteria: AC-FR-15-06, AC-FR-15-07, AC-FR-15-08, AC-FR-15-09, AC-FR-15-10, AC-FR-15-11

## Scope

Owner/Manager filters by current location and deletes with warning/confirmation; unassign products atomically and clear affected active filter; no replacement or product deletion. Use shared UoW; warning and confirmation precede atomic delete/unassign; no replacement assignment or stock mutation.

## Source handoff

The feature source and representative passing domain test are supplied. The requester has approved the integrated application for publication. The assigned member publishes the complete code/ tree on the designated branch in the documented sequence.

## Baseline acceptance checks

F: filter A, cancel deletion, confirm deletion with two products; N: Cashier direct filter/delete denied, deleted ID cannot be assigned; transaction failure rolls back both effects; regress lookup.

G1 scope/dependencies/criteria; G2 actual functional and negative results; G3 architecture/permissions; G4 regression on candidate; human decision before integration. For shared criteria record partial versus final verification. See EVIDENCE.md.

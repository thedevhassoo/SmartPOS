# S08 - Resolve CSV duplicates and Replace/Skip decisions

Slice: S08
Assigned member: Nazakat Ali
Branch: feature-nazakat
Dependencies: S07
Requirements: FR-14; NFR-03; NFR-04 (final)
Acceptance criteria: AC-FR-14-06, AC-FR-14-07, AC-FR-14-13, AC-FR-14-14

## Scope

Choose one retained row per duplicate group, then match retained rows to existing barcodes, set Replace/Skip; persist staged choices and complete preview; confirmation eligibility visible but no commit until S14. Resolve within-file duplicates first; only retained rows are matched with existing products. Persist explicit Replace/Skip decisions and detect stale versions; no business writes before S14.

## Source handoff

The feature source and representative passing domain test are supplied. The requester has approved the integrated application for publication. The assigned member publishes the complete code/ tree on the designated branch in the documented sequence.

## Baseline acceptance checks

F: duplicate existing barcode, choose second row, then Replace/Skip; N: invalid retained row, stale version, unresolved decisions block confirmation, Cashier decision denied; no catalog/location mutation.

G1 scope/dependencies/criteria; G2 actual functional and negative results; G3 architecture/permissions; G4 regression on candidate; human decision before integration. For shared criteria record partial versus final verification. See EVIDENCE.md.

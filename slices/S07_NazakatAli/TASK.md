# S07 - Upload CSV and inspect a validation preview

Slice: S07
Assigned member: Nazakat Ali
Branch: feature-nazakat
Dependencies: S03, S05
Requirements: FR-14; NFR-03; NFR-04 (final)
Acceptance criteria: AC-FR-14-01, AC-FR-14-02, AC-FR-14-03, AC-FR-14-04, AC-FR-14-06, AC-FR-14-13, AC-FR-14-15

## Scope

Owner/Manager uploads CSV, sees invalid-row reasons and duplicate groups, staged valid rows and preliminary preview. No product/location writes. Existing match classification is finalized only after S08 duplicate resolution. Exact ordered UTF-8 four-column header, optional BOM; preserve strings. Configurable 5 MB/10,000-data-row initial import limit per DR-39; applies to import workload, not total catalog size. Preview has no product/location writes.

## Source handoff

The feature source and representative passing domain test are supplied. The requester has approved the integrated application for publication. The assigned member publishes the complete code/ tree on the designated branch in the documented sequence.

## Baseline acceptance checks

F: valid file, mixed rows, duplicate groups and cancel; N/EP: XLSX, missing/extra/reordered headers, missing mandatory field, malformed price; Cashier upload denied; product/location counts unchanged.

G1 scope/dependencies/criteria; G2 actual functional and negative results; G3 architecture/permissions; G4 regression on candidate; human decision before integration. For shared criteria record partial versus final verification. See EVIDENCE.md.

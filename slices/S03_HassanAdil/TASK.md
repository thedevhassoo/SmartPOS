# S03 - Register, update and find products

Slice: S03
Assigned member: Hassan Adil
Branch: feature-hassan
Dependencies: S01
Requirements: FR-02, FR-13; NFR-03; NFR-04 (final); NFR-01
Acceptance criteria: AC-FR-02-01, AC-FR-02-02, AC-FR-02-03, AC-FR-02-04, AC-FR-02-05, AC-FR-02-06, AC-FR-13-04

## Scope

Owner/Manager product form and catalog; unique string Barcode, name, selling price, category for manual registration. Checkout barcode keyboard entry/scan and name fallback for all roles; no unsupported record creation; audit price edits. Use opaque string barcodes (including leading zeros), USB HID keyboard input + Enter and the same lookup path for manual input/name fallback; no automatic product creation. Manual registration requires category; imported products may be Uncategorized. Price-change audit must commit with the change.

## Source handoff

The feature source and representative passing domain test are supplied. The requester has approved the integrated application for publication. The assigned member publishes the complete code/ tree on the designated branch in the documented sequence.

## Baseline acceptance checks

F: create and find by scan/manual/name, edit price with audit; N/EP: duplicate barcode, blank required fields, invalid price, unknown barcode/name, Cashier edit denied; leading-zero barcode retained.; actual HID verification recorded separately when hardware is available.

G1 scope/dependencies/criteria; G2 actual functional and negative results; G3 architecture/permissions; G4 regression on candidate; human decision before integration. For shared criteria record partial versus final verification. See EVIDENCE.md.

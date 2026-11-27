# S09 - Prepare, recalculate and explicitly save Draft Bills

Slice: S09
Assigned member: Hassan Adil
Branch: feature-hassan
Dependencies: S03, S05
Requirements: FR-02, FR-03, FR-04, FR-15; NFR-03; NFR-04 (final); NFR-01
Acceptance criteria: AC-FR-02-01, AC-FR-02-02, AC-FR-02-03, AC-FR-02-04, AC-FR-03-01, AC-FR-03-02, AC-FR-03-03, AC-FR-03-04, AC-FR-03-06, AC-FR-04-03, AC-FR-04-04, AC-FR-15-02

## Scope

Checkout users add/remove products and positive quantities, view price and subtotal, explicitly Save; unsaved draft is not persisted; no manual Cashier discount or stock reservation. S12 adds current offers and S13 Push. Dedicated HID scan field + Enter, repeated intentional scans increment quantity, prevent duplicate handling of one terminator, respect dialog focus, fallback to manual and name search. Explicit Save only; no stock reservation or deduction. S12 integrates offers, S13 finalizes sales. Never report a simulated scan as hardware verification.

## Source handoff

The feature source and representative passing domain test are supplied. The requester has approved the integrated application for publication. The assigned member publishes the complete code/ tree on the designated branch in the documented sequence.

## Baseline acceptance checks

F: add/remove/revise quantity, totals, Save and retrieve saved state under approved policy; N/EP: zero/negative quantity, unknown product, unauthorized discount; crash before Save loses draft; stock and sale count unchanged.; rapid repeated scans, one Enter event, dialog focus, unplug/manual fallback; physical test separately.

G1 scope/dependencies/criteria; G2 actual functional and negative results; G3 architecture/permissions; G4 regression on candidate; human decision before integration. For shared criteria record partial versus final verification. See EVIDENCE.md.

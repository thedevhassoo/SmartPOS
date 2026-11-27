# S14 - Confirm CSV import, retry failed rows and view outcomes

Slice: S14
Assigned member: Nazakat Ali
Branch: feature-nazakat
Dependencies: S06, S08, S10, S13
Requirements: FR-14; NFR-03; NFR-04 (final); NFR-01; NFR-02
Acceptance criteria: AC-FR-14-01, AC-FR-14-05, AC-FR-14-08, AC-FR-14-09, AC-FR-14-10, AC-FR-14-11, AC-FR-14-12, AC-FR-14-14, AC-FR-14-15, AC-FR-14-16, AC-FR-14-17, AC-FR-14-18

## Scope

Explicitly confirm immutable choices; bounded durable worker processes each row through Catalog/Locations with same-transaction success marker; revalidate stale match; up to 3 retries after initial attempt; report all outcome classes. No stock mutation. Use the approved configurable file/row limits, not the old unbounded-import wording. New products use Uncategorized; replacement preserves category. Persist progress and success atomically, pause after permission revocation, detect stale rows, retry initial + up to three attempts after failure, and never change stock.

## Source handoff

The feature source and representative passing domain test are supplied. The requester has approved the integrated application for publication. The assigned member publishes the complete code/ tree on the designated branch in the documented sequence.

## Baseline acceptance checks

F: confirmed new/replace/skip with blank and normalized locations, inspect outcomes; N: unauthorized confirm, cancelled/unresolved/stale preview, failure injection; BVA: initial+3 retries then Failed; replay successful row no repeat; 5 MB/10,000-row boundary, one over the limit, and checkout contention.

G1 scope/dependencies/criteria; G2 actual functional and negative results; G3 architecture/permissions; G4 regression on candidate; human decision before integration. For shared criteria record partial versus final verification. See EVIDENCE.md.

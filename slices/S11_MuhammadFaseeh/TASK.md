# S11 - Create, edit and cancel scheduled store-wide offers

Slice: S11
Assigned member: Muhammad Faseeh
Branch: feature-faseeh
Dependencies: S01
Requirements: FR-13, FR-16; NFR-03; NFR-04 (final); NFR-02
Acceptance criteria: AC-FR-13-04, AC-FR-16-01, AC-FR-16-02, AC-FR-16-03, AC-FR-16-04, AC-FR-16-05, AC-FR-16-11, AC-FR-16-12, AC-FR-16-13, AC-FR-16-14, AC-FR-16-15, AC-FR-16-16

## Scope

Owner/Manager offers screen with percentage/fixed amount, PKT schedule, overlap-safe writes, active edits and cancellation, status derived from server time and audit. Use PKT display with UTC instants; enforce start-inclusive/end-exclusive non-overlap transactionally even under concurrent requests. Permit adjacent intervals; audit offer changes.

## Source handoff

The feature source and representative passing domain test are supplied. The requester has approved the integrated application for publication. The assigned member publishes the complete code/ tree on the designated branch in the documented sequence.

## Baseline acceptance checks

F: create both types, edit scheduled and active offers, cancel; N: Cashier write, start >= end, overlap, simultaneous conflicting creates; BVA: adjacent intervals, T-1/T and E-1/E; previous sale snapshots unaffected once S13 exists.

G1 scope/dependencies/criteria; G2 actual functional and negative results; G3 architecture/permissions; G4 regression on candidate; human decision before integration. For shared criteria record partial versus final verification. See EVIDENCE.md.

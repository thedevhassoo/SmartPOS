# S12 - Apply current offers to Draft Bill totals

Slice: S12
Assigned member: Muhammad Faseeh
Branch: feature-faseeh
Dependencies: S09, S11
Requirements: FR-03, FR-16; NFR-03; NFR-04 (final); NFR-01
Acceptance criteria: AC-FR-03-02, AC-FR-03-04, AC-FR-16-06, AC-FR-16-07, AC-FR-16-08, AC-FR-16-09, AC-FR-16-12, AC-FR-16-13, AC-FR-16-14, AC-FR-16-15, AC-FR-16-16

## Scope

Billing queries Offers at server calculation time, displays applicable terms and capped discount; update on recalculation/offer changes, reject client-submitted discount override. Use integer minor units or exact decimals and round-half-up; percentage or capped fixed discount once per bill, no stacking. Server clock authoritative; S13 re-evaluates at Push.

## Source handoff

The feature source and representative passing domain test are supplied. The requester has approved the integrated application for publication. The assigned member publishes the complete code/ tree on the designated branch in the documented sequence.

## Baseline acceptance checks

F: percent and fixed offers, recompute after edit/cancel; BVA: start/end, fixed discount equal/above subtotal; N: inactive, expired or cancelled offer never applies; spoofed client clock/discount ignored.

G1 scope/dependencies/criteria; G2 actual functional and negative results; G3 architecture/permissions; G4 regression on candidate; human decision before integration. For shared criteria record partial versus final verification. See EVIDENCE.md.

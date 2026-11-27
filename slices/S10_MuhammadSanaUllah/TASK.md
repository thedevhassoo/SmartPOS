# S10 - Reconcile stock discrepancies and audit adjustments

Slice: S10
Assigned member: Muhammad Sana Ullah
Branch: feature-sana
Dependencies: S04
Requirements: FR-05, FR-13; NFR-03; NFR-04 (final); NFR-02
Acceptance criteria: AC-FR-05-02, AC-FR-05-03, AC-FR-05-04, AC-FR-05-05, AC-FR-13-04

## Scope

Owner/Manager compares Recorded Stock with entered physical count, confirms chosen adjustment with reason; Inventory updates under shared transaction with audit; no auto-correction. Use atomic audited adjustments, positive/zero permitted balances, reject negative or stale conflicting updates. Record actor, reason, previous/new values, timestamp. Never auto-correct discrepancies.

## Source handoff

The feature source and representative passing domain test are supplied. The requester has approved the integrated application for publication. The assigned member publishes the complete code/ tree on the designated branch in the documented sequence.

## Baseline acceptance checks

F: discrepancy shown and confirmed adjustment with old/new audit values; N: Cashier denied, negative result rejected, stale adjustment conflict; BVA: resulting stock 0 vs -1; cancel leaves data unchanged.

G1 scope/dependencies/criteria; G2 actual functional and negative results; G3 architecture/permissions; G4 regression on candidate; human decision before integration. For shared criteria record partial versus final verification. See EVIDENCE.md.

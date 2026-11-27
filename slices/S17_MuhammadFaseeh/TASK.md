# S17 - Approve, reject and record externally completed refunds

Slice: S17
Assigned member: Muhammad Faseeh
Branch: feature-faseeh
Dependencies: S15
Requirements: FR-08, FR-11, FR-13; NFR-03; NFR-04 (final); NFR-02
Acceptance criteria: AC-FR-08-06, AC-FR-11-07, AC-FR-11-08, AC-FR-11-10, AC-FR-13-03, AC-FR-13-04, AC-FR-13-08

## Scope

Owner/Manager approves up to reserved remaining limit (may reduce amount) or rejects and releases reservation; only after external refund confirmation transition Approved to Refunded. Retain linked status, audit and approved report treatment. Preserve original sale. Pending->Approved->Refunded only after external confirmation; Pending->Rejected releases reservations. Failed/uncertain external refund remains Approved for reconciliation. No payment gateway, no repeated completion; expose committed facts through a public read contract for S16.

## Source handoff

The feature source and representative passing domain test are supplied. The requester has approved the integrated application for publication. The assigned member publishes the complete code/ tree on the designated branch in the documented sequence.

## Baseline acceptance checks

F: Pending->Approved->Refunded, Pending->Rejected and reservation release; N: Cashier approval, invalid transition, excessive amount, repeat confirmation; simulate interrupted local commit; original sale unchanged, committed refund read contract reconciles; rerun reporting checks in S16.

G1 scope/dependencies/criteria; G2 actual functional and negative results; G3 architecture/permissions; G4 regression on candidate; human decision before integration. For shared criteria record partial versus final verification. See EVIDENCE.md.

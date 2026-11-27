# S15 - Submit eligible full or partial refund requests

Slice: S15
Assigned member: Muhammad Faseeh
Branch: feature-faseeh
Dependencies: S13
Requirements: FR-11, FR-13; NFR-03; NFR-04 (final); NFR-02
Acceptance criteria: AC-FR-11-01, AC-FR-11-02, AC-FR-11-03, AC-FR-11-04, AC-FR-11-05, AC-FR-11-06, AC-FR-11-09, AC-FR-11-10, AC-FR-13-03

## Scope

Cashier matches receipt to Completed Sale, selects eligible quantities and amount, submits Pending. Reserve remaining amount and selected units atomically; reject duplicate/excess/ineligible requests. Use authoritative server time: eligible strictly before 168 hours; at or after boundary ineligible. Reserve pending/approved units and value; Refunded consumes and Rejected releases. Use original discounted sale snapshots and receipt identifier.

## Source handoff

The feature source and representative passing domain test are supplied. The requester has approved the integrated application for publication. The assigned member publishes the complete code/ tree on the designated branch in the documented sequence.

## Baseline acceptance checks

F: eligible full and partial requests; N: invalid receipt, repeat units, amount over remaining, concurrent requests; BVA: 167h59m59s, 168h, 168h+1s (exactly 168h is ineligible); exact remaining amount vs one minor unit above.

G1 scope/dependencies/criteria; G2 actual functional and negative results; G3 architecture/permissions; G4 regression on candidate; human decision before integration. For shared criteria record partial versus final verification. See EVIDENCE.md.

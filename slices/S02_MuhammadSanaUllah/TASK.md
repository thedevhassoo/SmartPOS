# S02 - Owner manages staff accounts and resets passwords

Slice: S02
Assigned member: Muhammad Sana Ullah
Branch: feature-sana
Dependencies: S01
Requirements: FR-01; NFR-03; NFR-04 (final)
Acceptance criteria: AC-FR-01-04

## Scope

Owner creates and manages accounts and resets passwords; roles are constrained to the three defined roles. Store Manager and Cashier cannot administer users. Deactivate accounts and invalidate sessions on reset/deactivation. Never expose password hashes; use an environment-controlled bootstrap for the first Owner, not a committed password.

## Source handoff

The feature source and representative passing domain test are supplied. The requester has approved the integrated application for publication. The assigned member publishes the complete code/ tree on the designated branch in the documented sequence.

## Baseline acceptance checks

F: create staff account and sign in; N: Manager/Cashier direct create/reset rejected, duplicate username rejected; after reset old password fails; regression login.

G1 scope/dependencies/criteria; G2 actual functional and negative results; G3 architecture/permissions; G4 regression on candidate; human decision before integration. For shared criteria record partial versus final verification. See EVIDENCE.md.

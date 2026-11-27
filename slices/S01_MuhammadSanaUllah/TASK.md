# S01 - Sign in and enforce role access

Slice: S01
Assigned member: Muhammad Sana Ullah
Branch: feature-sana
Dependencies: Verified initialization
Requirements: FR-01, FR-08, FR-10; NFR-03; NFR-04 (final)
Acceptance criteria: AC-FR-01-01, AC-FR-01-02, AC-FR-01-03, AC-FR-01-05, AC-FR-01-06, AC-FR-08-02, AC-FR-10-05

## Scope

Login for all three roles, server session, explicit logout, role-aware home/navigation; server authorization guard denies protected reads and commands as each route is added. No automatic idle logout. Use persistent PostgreSQL-backed sessions, Argon2id or bcrypt, server-owned permissions, HTTP-only cookies, CSRF protection, rate limiting, session invalidation and no mandatory inactivity logout. Implement the minimal audit append interface when first required; defer the full history UI to S13. Test role denial through actual endpoints as they become available.

## Source handoff

The feature source and representative passing domain test are supplied. The requester has approved the integrated application for publication. The assigned member publishes the complete code/ tree on the designated branch in the documented sequence.

## Baseline acceptance checks

F: valid credentials for each role; N/EP: unknown user, wrong password, unauthenticated and Cashier direct protected request; verify idle does not auto-lock; regress authorization on every later slice.; test session invalidation, CSRF and login throttling.

G1 scope/dependencies/criteria; G2 actual functional and negative results; G3 architecture/permissions; G4 regression on candidate; human decision before integration. For shared criteria record partial versus final verification. See EVIDENCE.md.

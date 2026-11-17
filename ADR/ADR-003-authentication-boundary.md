# ADR-003 — Central Authentication and Server-Enforced Role Authorization

**Status:** Proposed  
**Date:** 2026-11-10  
**Decision scope:** Security trust boundary, identity, role-based permissions and protected API access  
**ASRs / drivers:** ASR-02 (NFR-03); FR-01, FR-13–FR-16; FR-03, FR-05, FR-08–FR-10.

## Context

The POS uses **exactly three roles**: Business Owner, Store Manager and Cashier. These roles differ significantly in whether they can create accounts, adjust stock, change prices, import CSV products, manage storage locations or offers, view analytics/AI Insights, and view Audit Records. The PRD requires that prohibited operations be denied—not merely hidden from the interface. A workstation or its web UI must therefore not be trusted to decide its own privileges.

The PRD does not require external SSO. The PRD requires login when the system starts and does not require an automatic inactivity lock or logout; password and lockout policy is recorded as unnecessary in the stated LAN-only context, subject to OQ-27. Some permission and audit-deletion details remain unresolved (OQ-02, OQ-04 and related questions).

## Alternatives considered

| Alternative | Benefits | Costs / risks |
|---|---|---|
| **Central application API with one Identity & Access authorization boundary** | Uniform permission enforcement; sensitive data and database credentials remain server-side; clear test point. | Server dependency; shared permission policy requires careful maintenance. |
| **UI-only role-based hiding** | Minimal initial backend effort. | Direct requests or modified clients can bypass UI restrictions; fails the security requirement. |
| **Permission checks independently coded in every feature** | Allows local feature development. | Policy drift, gaps and difficult auditability as modules grow. |
| **Direct workstation-to-database access with database privileges** | Fewer server layers. | Leaks data boundary into clients and complicates consistent fine-grained business authorization. |

## Decision

Place the **authentication and authorization trust boundary at the central application API**. The backend's **Identity & Access module** validates user identity and enforces a centrally defined role/permission policy for every protected action and sensitive read. UI visibility can reflect permissions for usability, but **hiding a button is never authorization**.

- **Business Owner:** retains full business-function access and sole user-account/password-reset authority as specified; the disputed Audit Record deletion policy remains unresolved.
- **Store Manager:** may manage products, inventory, locations, CSV imports and offers, approve or reject refund requests, and view permitted reports and audits; cannot administer users or reset their passwords.
- **Cashier:** may perform permitted billing (including Push of a paid Draft Bill, which all three roles may do), submit eligible refund requests, and view a product's assigned location during lookup; cannot approve or reject refunds, import products, change/manage locations, change offer schedules, alter prices or stock, or access analytics, AI Insights or Audit Records.

All requests that read or change protected resources pass through a server-side permission check; critical operations are also authorized by their owning business module. No workstation receives broad direct database-write access. Audit-relevant changes are attributed to the authenticated acting user and recorded through the Audit module.

Authentication mechanism and credential/session format are **not decided by this ADR**; they must be chosen consistently with the remaining PRD decisions and actual deployment environment. The PRD requires no automatic inactivity timeout. No external identity provider is presumed.

## Authorization of durable import work

For CSV imports, the **upload, duplicate-choice, Replace/Skip decision, and final confirmation** endpoints must check the authenticated actor's permissions. A confirmed job records **server-authenticated actor attribution, server-generated job/row identity and immutable user decisions**. The internal worker executes only already-confirmed work through a constrained internal capability; it does not authenticate itself as a Cashier/Manager via client-supplied role strings and does not gain arbitrary Catalog or Inventory write privileges. Owner/Manager authorization to initiate/confirm is mandatory.

**Policy explicitly unresolved:** If the initiating user's account is disabled or permissions are revoked after confirmation, the team's continuation/revalidation/cancellation policy must be specified before implementation. This ADR does not silently grant an ongoing right or require cancellation. Audit and negative-permission tests must cover the selected policy once approved.

The Cashier's ability to **view current product location** through product lookup must not imply permission to use **filter-by-location** or location management. Sensitive read checks apply to composed API query handlers as well as direct module endpoints.

## Rationale

A single authoritative policy reduces inconsistent enforcement among billing, imports, locations and offers. It protects role-sensitive data even if users manually craft requests and creates an explicit, testable security boundary. Keeping database credentials on the server limits exposure when a shop workstation is misconfigured or compromised.

**Important interface:** workstation UI → authenticated application API → authorization decision → capability module → approved repository operation. Access rules apply to both interactive requests and background import work, which must retain a verifiable initiating user's authorization context and must not become an unrestricted privilege bypass.

## Trade-offs / consequences

**Positive:** Consistent RBAC, stronger data integrity and confidentiality boundaries, traceable actions, centralized negative-access testing, and fewer authorization defects when features are added.

**Negative:** API and policy infrastructure require additional development and regression testing; server unavailability affects all user roles; broad Owner rights increase the need to resolve audit safeguards carefully.

**Architectural constraints / safeguards:**

- Do not rely on client-side role flags for security.
- Test forbidden access by issuing requests directly against the API, not only by checking hidden UI controls.
- Apply authorization equally to imported product updates, deletion of locations, modifications of active offers and access to reports.
- Keep unresolved password/lockout confirmation (OQ-27), Owner audit deletion and privacy-retention requirements explicitly **open** rather than inventing policy.

## Traceability and related decisions

- **ADR-001:** authenticated API and three-tier client boundary.
- **ADR-002:** server-only database access and durable audit data.
- **ADR-004 / ADR-005:** authorization of import and offers actions.
- Sources: `PRD.md`, `architecture.md`; PRD FR-01, FR-13–FR-16, NFR-03, BR-01–BR-07, §14.

# Individual Context Review — Muhammad Faseeh

**Status:** Human-approved context review; assignment and project decisions remain subject to plan approval and existing decision gates  
**Repository:** `thedevhassoo/SmartPOS`  
**Branch:** `feature-faseeh`  
**Reviewed baseline branch:** `develop`  
**Reviewed baseline HEAD:** [`758ab9f511b2d6104d0648efbba92949ffa579f9`](https://github.com/thedevhassoo/SmartPOS/commit/758ab9f511b2d6104d0648efbba92949ffa579f9)  
**AI session reference:** Not available in this conversation; no task/session UUID or Copilot task URL was provided.

## 1. Purpose and review scope

This review captures the shared Stage 1 context and the proposed member-specific scope for offers, refunds, and returns. It is not an implementation plan, an approval of the assignment, a change to the PRD, or approval of any proposed ADR.

The PRD is authoritative for product behavior and open questions. `architecture.md` defines module boundaries and interfaces. Existing ADRs remain **Proposed** unless separately approved. The assignment remains proposed until the plan is approved.

## 2. Proposed responsibilities

The member-specific assignment stated in the conversation is: **“I am responsible for offers, refunds, returns.”** This is recorded as a proposed assignment, not an approved slice allocation.

Proposed scope:

- **Scheduled Offers (FR-16):** offer management, scheduling, editing, cancellation, overlap validation, and supplying effective offer terms to Billing.
- **Refunds (FR-11):** receipt/sale verification, eligibility, full and partial refund records, links to the original sale and sale lines/units, and refund status transitions.
- **Returns (FR-12):** record returned goods separately from Available Stock and support the final resellability decision and authorized inventory transition.
- Coordinate end-to-end UI/API/service behavior, authorization, audit capture, and tests for these areas after the relevant scope is approved.

Exact slice boundaries, ownership of shared UI/integration work, and the number or order of slices for this member have not been approved in the reviewed material.

## 3. Relevant requirements and guidance

### Product requirements

- **FR-11 — Refund and Partial Refund recording**
  - Acceptance criteria: AC-FR-11-01 through AC-FR-11-10.
  - Related business rules: BR-13 through BR-17.
- **FR-12 — Returned Product and stock-status handling**
  - Acceptance criteria: AC-FR-12-01 through AC-FR-12-06.
  - Related business rule: BR-18.
- **FR-16 — Scheduled Authorized Offers**
  - Acceptance criteria: AC-FR-16-01 through AC-FR-16-16.
  - Related business rules: BR-06 and BR-30 through BR-33.
- Related requirements include **FR-01** (authorization), **FR-03/FR-04** (bill calculation and final Push), and **FR-13** (transaction history and audit).

### Relevant architecture and ADRs

- `architecture.md`: Scheduled Offers, Refunds & Returns, Billing, Inventory, Identity & Access, Audit & Transaction History, and their public service interfaces.
- **ADR-001 — Three-Tier Layered Modular Monolith (Proposed):** logical module boundaries and synchronous in-process coordination.
- **ADR-002 — Central Relational Persistence and Atomic Sale/Stock Commit (Proposed):** ownership-safe transactions and consistency constraints relevant to refund/return workflows.
- **ADR-003 — Central Authentication and Server-Enforced Role Authorization (Proposed):** role enforcement at the authenticated API and unresolved policy boundaries.
- **ADR-005 — Server-Authoritative Time Evaluation for Scheduled Offers (Proposed):** offer eligibility and schedule integrity.
- ADR-004 concerns CSV import and is not a direct domain decision for these responsibilities.

All ADRs remain Proposed; this review does not treat them as formally approved.

### Workflow, UI, and barcode guidance

- `guidelines/development-workflow.md` and `context-baseline.md` describe exactly 20 meaningful end-to-end slices, five per engineer, with context validation, clarification, test definition, approved implementation, verification, human review, and integration. Stage 2 planning is not itself implementation authorization.
- `guidelines/ui-design.md` is a **proposed** visual brief. The DreamsPOS reference is visual inspiration only; do not copy assets or import unapproved features or metrics. Proposed visual guidance calls for accessible contrast and not communicating state by color alone.
- `guidelines/barcode-scanner.md` and the baseline’s barcode requirements concern checkout input rather than offer/refund/return ownership. Integration should preserve the shared scan/manual lookup path, barcode strings including leading zeros, focus behavior, lossless rapid scans, and single submission per scanner terminator. The specific scanner model and related interaction details remain proposed or unresolved.

## 4. Dependencies and coordination

- **Billing:** provide authoritative Completed Sale and sale-line data for refund eligibility and offer-adjusted bill calculations. Billing must re-evaluate the offer at calculation and at Push.
- **Inventory:** owns stock quantities and movements. It exposes the authorized return-to-stock transition; returned items cannot become Available Stock merely because they were recorded as returned.
- **Identity & Access:** all protected commands and sensitive reads require server-side authorization. UI hiding is not security enforcement.
- **Audit:** Refunds & Returns and offer changes need appropriate audit capture. Audit may expose append/read ports, but must not depend on Billing or Refunds & Returns.
- **Transaction History / API composers:** compose reads from the owning Billing, Refunds & Returns, and Audit interfaces; do not make Audit a duplicate owner of sale or refund records.
- **Shared transaction coordination:** use public service contracts and an opaque unit-of-work handle where a multi-module operation must be atomic. Shared database access does not permit unrestricted cross-module table writes.

## 5. Critical rules to preserve

### Offers

- Offers apply **store-wide**, not to selected products.
- Supported discount types are Percentage Discount and Fixed-Amount Discount.
- Only Business Owner and Store Manager may create, edit, schedule, or cancel offers. Cashiers may use the currently applicable offer through billing, but cannot manage or override it.
- Offer intervals cannot overlap; competing schedule writes must be protected transactionally, not just checked in the UI.
- The active interval is start-inclusive and end-exclusive: `start_time <= now < end_time`, unless cancelled.
- Pakistan Standard Time (PKT) is the canonical store timezone; server time is authoritative.
- Billing evaluates the effective offer at calculation and again at Push. Historical Completed Sales retain their applied snapshot and are not repriced by later edits.
- Do not invent currency, tax, rounding, calculation-order, or manual-discount stacking policy where the PRD leaves it open.

### Refunds and returns

- A refund must match a verifiable Receipt/Completed Sale and remain linked to the original sale and relevant sale-line units. Preserve the original sale.
- Refund requests begin as Pending. Cashiers submit eligible requests; Owner/Manager approve or reject them. Cashiers cannot approve or reject.
- Prevent refunding the same returned units twice and respect the refundable amount limit defined by the PRD.
- The eligibility period is 168 hours from the original purchase time, not seven calendar days; exact equality at the cutoff remains unresolved.
- Keep monetary refund state separate from physical return and resellability state.
- The Cashier performs initial inspection. Owner/Manager has final resellability authority.
- Returned units must remain outside Available Stock unless confirmed resellable by Owner/Manager. Inventory changes go through the Inventory module’s public service.
- The POS does not process payments or connect to a payment provider. A refund may be marked Refunded after external money return is confirmed, but the mechanism for handling failed or interrupted external reversals is unresolved.
- Capture required sensitive-action audit information without inventing audit deletion or retention policy.

## 6. Identified ambiguities and unresolved issues

### Refunds and returns

- **OQ-13 / OQ-24:** failed or interrupted external refund reversal, crash recovery, replay, and reconciliation behavior.
- **OQ-14:** report/dashboard treatment of refunds and returns, and timing of their effects.
- **OQ-15:** whether a request exactly 168 hours after purchase is eligible.
- **OQ-35:** refund-specific Transaction History permissions.
- **OQ-40:** which fields constitute a Receipt match.
- Refund flow details still needing clarification include who confirms completion of the external money return and the exact mechanics for moving from Approved to Refunded.
- Return-condition criteria, disputed/damaged-item handling, and the timing/transaction relationship between a resellability decision and stock update are not fully specified.
- The PRD contains wording that the Cashier can “process” an eligible refund independently as well as the more specific rule that a Cashier submits a request and Owner/Manager approves or rejects it. The specific FR-11 role/status flow should guide behavior; any remaining conflict should be raised rather than resolved by assumption.

### Offers

- **OQ-10 / OQ-31 / OQ-50:** manual-discount exceptions/stacking, currency, tax, rounding, and remaining calculation-order details.
- **OQ-51:** server clock synchronization/precision and the boundary-test specification.
- The proposed ADR calls for transactional overlap protection, while the implementation mechanism is not specified; technology or database-specific choices require the project’s decision gate.

### Cross-cutting

- **OQ-02:** complete role/permission matrix beyond permissions already specified.
- **OQ-04:** audit retention, Owner deletion, and integrity safeguards.
- **OQ-27:** final hardware/network/deployment conditions, offline behavior, availability, backup cadence, and RPO/RTO.
- Authentication/session details and formal technology/ADR approval remain open.
- Reporting, transaction-history, and audit details must not be assumed settled merely because the relevant modules are named in the architecture.

## 7. Recommendations from the AI review — not decisions

The following are AI-generated review recommendations only. They are **not** user-confirmed decisions or approved requirements:

1. Treat refund/return and refund/payment status as distinct state dimensions in any future design discussion, so resolving one does not silently resolve the other.
2. Before a slice is approved, explicitly identify its interfaces with Billing, Inventory, Identity & Access, and Audit, plus its transaction boundary and negative authorization cases.
3. Put unresolved cutoff, rounding, reversal-recovery, and return-stock timing decisions into an explicit readiness gate or obtain human decisions before implementing behavior that depends on them.
4. Include tests for duplicate refund attempts, partial quantities and refundable limits, role-denied operations, offer overlap/concurrency and time boundaries, active-offer edits/cancellation, and returned stock remaining unavailable until confirmation.
5. Keep UI proposals limited to the approved PRD behavior; use accessible status indicators and avoid invented dashboard metrics.

These recommendations should be accepted, revised, or rejected by the human reviewer; none should be treated as approved merely by appearing here.

## 8. Human clarifications and feedback recorded

### Clarifications recorded in the Stage 1 `context-baseline.md`

The baseline records these human clarifications as shared project context:

- The three-tier layered modular monolith architecture is retained.
- `ADR/` is the canonical ADR directory; references to `ADRs/` are an identified documentation inconsistency.
- Strict TypeScript is confirmed. Other listed technologies are proposed for Stage 2 evaluation, not approved by implication.
- Physical USB HID barcode scanners, manual barcode entry, and name lookup are required; barcodes are opaque strings preserving leading zeros.
- DreamsPOS is a visual-only reference.
- The intended context is one shop, central LAN hosting, and multiple authorized workstations; several deployment details remain unresolved.
- All five existing ADRs remain Proposed pending explicit approval.
- Unresolved rules must be addressed in Stage 2 or explicitly deferred to slice readiness.
- The project expects 20 end-to-end slices, five per engineer, and genuine contribution/review evidence.
- Stage 2 validation and planning may proceed; implementation and file generation require explicit authorization.

### Statements made directly by the member in this conversation

- The member stated the proposed responsibility area: **“I am responsible for offers, refunds, returns.”**
- The member requested verification and context review, asked that proposed assignments remain unapproved until plan approval, and explicitly instructed: **“Do not code or edit files.”**
- The member confirmed creation of `feature-faseeh`; that branch was created from `develop` at the reviewed HEAD. This confirms the branch action only; it does **not** approve the assignment, plan, product rules, ADRs, or implementation.
- The member explicitly approved this context-review document and confirmed that `feature-faseeh` must be used for its commit. This approves the document content for recording; it does not approve the assignment, plan, unresolved product rules, proposed ADRs, or implementation.
- No substantive member feedback changing the PRD rules, accepting the AI recommendations, resolving an open question, or approving a plan has been provided in this conversation.

## 9. Review and approval state

- This context-review document was explicitly approved by the member for committing on `feature-faseeh`.
- No authoritative requirement, ADR, plan, or source file has been changed.
- No implementation work has started.
- The member-specific assignment remains proposed until plan approval.
- Human review and explicit approval are required before implementation of the proposed scope.

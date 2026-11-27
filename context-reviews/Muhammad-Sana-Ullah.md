# Individual Context Review — Muhammad Sana Ullah

**Status:** Draft context review for human review; not an approved plan or implementation assignment  
**Repository:** [`thedevhassoo/SmartPOS`](https://github.com/thedevhassoo/SmartPOS)  
**Review branch:** `feature-sanaullah`  
**Reviewed `develop` HEAD:** [`673b312adbb068ffe11f373aaa7624f3ccbb2a10`](https://github.com/thedevhassoo/SmartPOS/commit/673b312adbb068ffe11f373aaa7624f3ccbb2a10)  
**Context-baseline source commit:** [`60f94d86cc4446cad0d18da68065f746848acba0`](https://github.com/thedevhassoo/SmartPOS/commit/60f94d86cc4446cad0d18da68065f746848acba0)  
**AI session reference:** Not available in the conversation metadata; none is fabricated.  
**Identity/access verification:** The session login is `mughalmuhammadsanaullah`; repository permissions were verified as pull and push. Local configured Git author name/email could not be independently verified.

## 1. Purpose and status

This document records a proposed individual context review for authentication, staff, batches, stock adjustments, and sales. It does not change `PRD.md`, `architecture.md`, any ADR, or the project plan. Responsibilities and slice allocation remain proposed until the plan is approved.

No product requirement, technology choice, or architecture decision is approved by this review. All five existing ADRs remain **Proposed**. The requested work here is documentation only; no application code or authoritative requirements were changed.

## 2. Proposed responsibilities

These areas are based on the user's stated responsibility, not an approved slice allocation:

### Identity & Access / staff — FR-01

- Authentication, the three-role policy, server-side authorization, and Owner-only account administration/password resets.
- Staff-related workflows should use the Identity & Access module and its public policy boundary; staff/account operations must not be delegated to UI-only checks.

### Product Batches and stock adjustments — FR-05 and FR-06

- Inventory & Expiry owns Recorded Stock/Available Stock rules, stock balances and movements, Product Batches, batch quantities, Expiry Dates and per-unit purchase costs.
- The Business Owner and Store Manager are the Authorized Inventory Users permitted to manage inventory and make Manual Stock Adjustments. Cashiers cannot manually adjust stock.
- Keep separate batches for incoming stock, including when the same product has different expiry dates or purchase costs.

### Billing and sales — FR-03 and FR-04

- Billing owns Draft Bills, Completed Sales, sale lines, stable logical-Push identity, and immutable sale/offer/price snapshots.
- Support draft preparation and explicit Save separately from authoritative sale completion at Push.
- Coordinate final product/price reads, current offer evaluation, Inventory deduction, and required Audit append through public interfaces.

The project requires exactly 20 meaningful end-to-end slices, five per engineer. This review does not assign particular slices to Muhammad Sana Ullah.

## 3. Relevant requirements and dependencies

### Identity & Access / staff

**Requirements:** FR-01, AC-FR-01-01–AC-FR-01-06, BR-01–BR-03 and BR-07; NFR-03. Related sensitive reads/actions are covered by FR-05, FR-13, FR-14, FR-15 and FR-16.

**Dependencies:**

- The central authenticated application API and Identity & Access permission policy.
- Each owning module must also protect critical business operations; the UI is not a trusted authorization boundary.
- Audit capture for sensitive committed changes, subject to the unresolved audit policy.

### Batches and stock adjustments

**Requirements:** FR-05 and AC-FR-05-01–AC-FR-05-05; FR-06 and AC-FR-06-01–AC-FR-06-06; BR-05, BR-11, BR-12; NFR-02/NFR-03 where consistency and authorization apply.

**Dependencies:**

- Identity & Access for Owner/Manager permissions and Cashier denial.
- Product Catalog for product identity, accessed through its public interface; Catalog does not own stock quantities.
- Inventory & Expiry as the authoritative owner of stock quantities, movements, batches and expiry/cost data.
- Audit for required stock-adjustment traceability (actor, time, action and applicable prior/new values).
- Reporting & Stock Alerts may consume committed inventory facts but must not write authoritative stock.

### Sales

**Requirements:** FR-03 and AC-FR-03-01–AC-FR-03-06; FR-04 and AC-FR-04-01–AC-FR-04-09; BR-08–BR-10; NFR-01/NFR-02/NFR-03. Related requirements include FR-13 for traceability and FR-16 for active offer calculations.

**Dependencies:**

- Identity & Access for authorization. Business Owner, Store Manager and Cashier may Push a paid Draft Bill.
- Product Catalog for authoritative product/pricing reads.
- Scheduled Offers for server-time eligibility and discount terms at calculation and Push.
- Inventory for stock checks and deduction within the Push transaction.
- Audit for required transactional traceability.
- Transaction History reads from Billing's public read interface; it does not become an alternative owner of sale records.

## 4. Critical requirements and architectural constraints

- The system has exactly three roles: Business Owner, Store Manager, and Cashier. “Authorized Inventory User” means Owner or Manager, not another role.
- Only the Business Owner manages user accounts and resets passwords. Store Managers cannot do so.
- Enforce authorization on the server for every protected command and sensitive read. Hiding UI controls alone is not security.
- Retain the three-tier layered modular monolith as the confirmed project context. The ADR decision records are still Proposed, and the proposed technologies remain subject to Stage 2 evaluation/approval.
- The server is the trust boundary. Workstations use the authenticated API and never access the database directly or contain database credentials.
- Preserve module ownership and explicit service interfaces. A shared database/transaction does not permit unrestricted cross-module writes. Inventory owns stock; Billing orchestrates Push; Audit does not depend cyclically on Billing or Refunds.
- Push is the only authoritative Completed Sale boundary. Payment is received and checked outside the POS; no payment processing/provider integration is in scope.
- A Draft Bill is not a Completed Sale, does not reserve or deduct stock, and is persisted only on explicit Save. An unsaved draft is lost on a crash.
- A successful Push must commit the Completed Sale, corresponding stock deduction, applicable price/offer snapshot, and required traceability atomically and exactly once. Use concurrency controls and one stable identity per logical Push across retries/reloads. Never make a background job the authority for sale completion or stock deduction.
- Insufficient Available Stock blocks Push without a Completed Sale or deduction and leaves the Draft Bill unchanged. Concurrent attempts to sell the last available unit must allow only a safe outcome.
- Keep Recorded Stock and Available Stock distinct until OQ-34 is resolved. A returned unit is not Available Stock until the Business Owner or Store Manager confirms it resellable.
- NFR-01 retains a three-second target for barcode recognition, item addition, Draft Bill recalculation and Push, each measured at 95% of operations with five concurrent users on documented equipment.
- Offers are store-wide, non-overlapping, and evaluated server-side using the start-inclusive/end-exclusive interval at calculation and Push. PKT is canonical; a Completed Sale keeps its final snapshot. Do not rely on workstation time or a client “active” flag.

## 5. Workflow, UI and barcode guidance

- **Development workflow:** validate context; clarify acceptance criteria/open decisions; define tests; implement only approved scope; verify positive, negative and integration behavior; obtain human Accept/Revise/Reject review; integrate accepted work; maintain required plan/evidence. Stage 2 planning is not authorization to implement.
- **UI guideline:** the DreamsPOS reference is visual inspiration only. Use original components; do not copy source assets or treat the reference as an approved feature source. Proposed palette/layout tokens are not verified extracted CSS or approved product requirements. Do not invent dashboard metrics. Use accessible contrast and do not communicate state by color alone.
- **Barcode guideline:** support physical USB HID scanning, manual entry and product-name lookup using a shared lookup path. Treat barcodes as opaque strings and preserve leading zeros. Unknown codes fall back to name search; never create a product automatically. Handle scanner terminators once, repeated intentional scans losslessly, and do not steal focus from dialogs or quantity editors. Specific scanner model, suffix, timing and verification evidence remain proposed/unresolved.

## 6. Identified ambiguities and unresolved issues

### Authentication and staff

- **OQ-02:** complete role/permission matrix for permissions not already explicitly specified.
- Authentication/session format and credential policy are not selected. The PRD says login is required when the application starts and does not require automatic inactivity logout/lock; do not invent session behavior that changes this.
- Worker behavior after role revocation or account deactivation is open for any durable work encountered in integrations.

### Batches and stock adjustments

- **OQ-34:** Recorded Stock versus Available Stock relationship and associated stock-adjustment safeguards, including negative quantities and concurrency behavior.
- **OQ-08/OQ-39:** expiry-date validation, date changes, and the Approaching Expiry warning period.
- Batch-specific edge cases beyond the defined separate quantity/expiry/cost records must not be turned into new rules without a decision.

### Sales

- **OQ-24:** detailed crash recovery/reconciliation beyond the atomicity and exactly-once invariants.
- Stable idempotency-token transport and persisted logical-Push identity details are unresolved.
- **OQ-10/OQ-31/OQ-50:** manual discount stacking, currency, tax, rounding and remaining bill calculation-order rules. Scheduled offers are defined as non-overlapping and not stacked with another scheduled offer; broader manual-discount exceptions remain open.
- **OQ-51:** server clock synchronization/precision and boundary-test specification for PKT offers.
- Final hardware/network, offline behavior, availability, backup cadence, RPO/RTO remain unresolved under **OQ-27**.
- Audit deletion/retention safeguards remain unresolved under **OQ-04**.

These open decisions must be settled in Stage 2 or explicitly assigned to a named slice-readiness gate before they affect implementation. Do not silently choose a behavior.

## 7. Recommendations — AI-generated, not human decisions

The following are planning recommendations only, not approvals or requirements:

1. Map any proposed slices to FRs and acceptance criteria, including role-denial tests, stock/sale atomicity, retry/recovery, and end-to-end evidence.
2. Before implementation, identify which open questions block each slice and obtain human decisions or explicitly defer them to a named readiness gate.
3. Test authorization through direct API requests for each role, not just role-aware UI presentation.
4. Exercise Push with insufficient stock, concurrent last-unit attempts, interrupted responses, repeated logical requests and offer boundary changes; verify one sale and one corresponding deduction or no committed effects.
5. Test batch separation and authorized adjustment traceability while avoiding assumptions about negative stock, Recorded/Available Stock reconciliation or expiry thresholds.
6. Keep UI/browser validation and barcode handling separate from trusted server rules; preserve barcode strings and test scan/manual equivalence, leading zeros, unknown-code fallback, duplicate registration, rapid scans and focus behavior.
7. Keep proposed stack and all ADR decisions unapproved until the project’s formal decision process confirms them.

## 8. Actual human clarifications and instructions recorded

### Explicitly stated by the user in this conversation

- The user stated: **“I am responsible for authentication, staff, batches, stock adjustments, sale.”** This establishes the user's proposed area of responsibility, not approved slices.
- The user explicitly directed that assignments remain proposed until plan approval.
- The user requested verification of HEAD, Git identity and access, review of the baseline/guidance, and no coding or file edits for the prior review task. This document request now explicitly authorizes creating and committing this context-review document only.
- The user requested the document be committed on branch `feature-sanaullah` under their Git identity.

No further product rule, plan approval, slice assignment, technology choice or ADR approval was explicitly confirmed by the user in this conversation.

### Human clarifications recorded by the repository baseline

The Stage 1 `context-baseline.md` records the following project-level human clarifications. They are reported here as repository baseline context; this review does not claim that Muhammad Sana Ullah personally originated or newly confirmed each item:

- Retain the three-tier layered modular monolith; `ADR/` is the canonical ADR directory, and inconsistent `ADRs/` references should be addressed during Stage 2 validation.
- Strict TypeScript is required. The listed frontend, backend, database and supporting technologies are proposed for Stage 2 evaluation, not approved selections.
- Physical USB HID barcode scanners, manual barcode entry, name lookup, string barcodes preserving leading zeros, unknown-code fallback and no automatic product creation are required; device specifics and validation remain open.
- DreamsPOS is visual-only inspiration, not a feature, metric, asset or sample-data source.
- The intended scope is one shop with central LAN hosting and multiple authorized workstations; details such as hardware, network, offline support, availability and recovery objectives remain open.
- Exactly 20 meaningful end-to-end slices, five per engineer, are required, with genuine AI/Git evidence.
- Stage 2 validation and planning may proceed; implementation and file generation require explicit confirmation.

## 9. Review record

**Review status:** Draft for human review.  
**Plan/assignment status:** Not approved by this document.  
**ADR status:** All five existing ADRs remain Proposed.  
**Code changes:** None.  
**Git identity note:** The session login and repository write access were available; local Git author configuration was not independently inspected. This document was committed through the connected GitHub integration, which uses its authenticated GitHub commit identity.

## 10. Sources reviewed

- [`context-baseline.md`](https://github.com/thedevhassoo/SmartPOS/blob/673b312adbb068ffe11f373aaa7624f3ccbb2a10/context-baseline.md)
- [`AGENTS.md`](https://github.com/thedevhassoo/SmartPOS/blob/673b312adbb068ffe11f373aaa7624f3ccbb2a10/AGENTS.md)
- [`PRD.md`](https://github.com/thedevhassoo/SmartPOS/blob/673b312adbb068ffe11f373aaa7624f3ccbb2a10/PRD.md)
- [`architecture.md`](https://github.com/thedevhassoo/SmartPOS/blob/673b312adbb068ffe11f373aaa7624f3ccbb2a10/architecture.md)
- [`ADR/ADR-001-architecture-style.md`](https://github.com/thedevhassoo/SmartPOS/blob/673b312adbb068ffe11f373aaa7624f3ccbb2a10/ADR/ADR-001-architecture-style.md)
- [`ADR/ADR-002-data-persistence.md`](https://github.com/thedevhassoo/SmartPOS/blob/673b312adbb068ffe11f373aaa7624f3ccbb2a10/ADR/ADR-002-data-persistence.md)
- [`ADR/ADR-003-authentication-boundary.md`](https://github.com/thedevhassoo/SmartPOS/blob/673b312adbb068ffe11f373aaa7624f3ccbb2a10/ADR/ADR-003-authentication-boundary.md)
- [`ADR/ADR-004-csv-import-recovery.md`](https://github.com/thedevhassoo/SmartPOS/blob/673b312adbb068ffe11f373aaa7624f3ccbb2a10/ADR/ADR-004-csv-import-recovery.md)
- [`ADR/ADR-005-scheduled-offer-eligibility.md`](https://github.com/thedevhassoo/SmartPOS/blob/673b312adbb068ffe11f373aaa7624f3ccbb2a10/ADR/ADR-005-scheduled-offer-eligibility.md)
- [`guidelines/development-workflow.md`](https://github.com/thedevhassoo/SmartPOS/blob/673b312adbb068ffe11f373aaa7624f3ccbb2a10/guidelines/development-workflow.md)
- [`guidelines/ui-design.md`](https://github.com/thedevhassoo/SmartPOS/blob/673b312adbb068ffe11f373aaa7624f3ccbb2a10/guidelines/ui-design.md)
- [`guidelines/barcode-scanner.md`](https://github.com/thedevhassoo/SmartPOS/blob/673b312adbb068ffe11f373aaa7624f3ccbb2a10/guidelines/barcode-scanner.md)

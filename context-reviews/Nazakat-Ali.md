# Context Review — Nazakat Ali

**Status:** Draft for human review; not approved as a plan or implementation assignment  
**Repository:** [`thedevhassoo/SmartPOS`](https://github.com/thedevhassoo/SmartPOS)  
**Review scope:** CSV import, Stock Alerts, and AI Insights  
**Branch:** `feature-nazakat`, created from `develop`  
**Reviewed `develop` HEAD:** `758ab9f511b2d6104d0648efbba92949ffa579f9`  
**Context-baseline source commit:** `60f94d86cc4446cad0d18da68065f746848acba0`  
**AI session reference:** Not available in the conversation metadata provided.  
**Git identity:** Session login shown as `i253029-maker`; configured Git author name/email were not independently verified.

## 1. Purpose and status

This document captures a proposed individual context review for CSV import, Stock Alerts, and AI Insights. It does not change `PRD.md`, `architecture.md`, any ADR, or the project plan. Responsibilities and slice allocation remain proposed until the human-approved plan establishes them.

No implementation work or file edits were performed for this review.

## 2. Proposed responsibilities

These are proposed areas of responsibility, based on the user's stated scope—not approved slice assignments.

### CSV Product Import — FR-14

- Support authorized CSV upload, schema and row validation, staging, preview, decisions, explicit confirmation, durable progress, recovery, and final outcome reporting.
- Coordinate product changes through Catalog and location operations through Storage Locations.
- Cover relevant UI, API/service behavior, persistence boundaries, authorization, error paths, and tests as end-to-end slices if assigned in the approved plan.

### Stock Alerts — FR-07

- Present Out of Stock and configured manual Low Stock alerts.
- Support Approaching Expiry alerts and AI-suggested Low Stock thresholds only after their criteria are resolved.
- Consume inventory and expiry facts without taking ownership of authoritative stock records.

### AI Insights — FR-10

- Provide Owner/Manager-facing, advisory recommendations based on available, committed sales and stock evidence.
- Explain supporting evidence and uncertainty; report Insufficient Data when evidence is inadequate.
- Keep AI read-oriented and isolated from checkout, inventory mutation, and purchasing decisions.

The project baseline requires exactly 20 meaningful end-to-end slices, five per engineer. Which of those slices, if any, belong to Nazakat is not established by this document.

## 3. Relevant requirements and dependencies

### CSV import

**Relevant requirements:** FR-14, including FR-14.1–FR-14.6 and AC-FR-14-01–AC-FR-14-18; related FR-01, FR-02, FR-05, FR-13, and FR-15; NFR-01–NFR-03.

**Dependencies:**

- Identity & Access for Owner/Manager authorization at upload, decision, confirmation, and protected reads.
- Product Catalog for product matching, creation, and replacement.
- Storage Locations for canonical lookup, creation, and assignment.
- Audit for traceability of sensitive committed actions.
- Central persistence and transaction coordination for durable staging and atomic row-level effects.
- Presentation UI for the preview, decision, confirmation, progress, and outcome workflows.

### Alerts

**Relevant requirements:** FR-07 and its acceptance criteria; related FR-05 and FR-06 for stock and batch/expiry facts; FR-08–FR-10 where alerts or AI suggestions use reporting and sales evidence.

**Dependencies:**

- Inventory & Expiry owns stock, movements, batches, and expiry data.
- Reporting & Stock Alerts provides read-oriented alert and reporting views.
- AI Insights may provide an advisory threshold suggestion, but cannot replace the manual threshold or authoritative stock facts.
- Owner/Manager authorization applies to alert-management/reporting access described in the PRD.

### AI Insights

**Relevant requirements:** FR-10 and AC-FR-10-01–AC-FR-10-06; related FR-07–FR-09 and NFR-03.

**Dependencies:**

- Reporting & Stock Alerts provides an evidence/read interface.
- Catalog, Inventory, and Billing remain owners of product, stock, and completed-sale facts.
- Identity & Access restricts AI Insights to permitted roles; Cashier access is denied.
- Any external model/provider would require human approval and an appropriate ADR; none is selected or required by the current architecture.

## 4. Critical rules and architectural constraints

### CSV

- Accept `.csv` only and require the exact ordered header:
  `product_name,barcode,selling_price,storage_location`.
- Product name, Barcode, and selling price are required per row; the location value may be blank or omitted.
- Reject a malformed header as a whole-file error; reject invalid rows individually with reasons.
- Resolve within-file duplicate Barcodes by an explicit user choice **before** matching retained rows against existing products.
- Existing product matches require explicit Replace or Skip. Replace updates the four CSV fields; a blank location leaves the product Unassigned. Skip leaves the existing product unchanged.
- Make no Product or Storage Location changes during preview. Require all decisions and explicit final confirmation before applying changes.
- Process confirmed rows through Catalog and Locations public services. Each row’s product/location changes and durable success marker must commit atomically.
- Persist one authoritative CSV Import job/row state, confirmed decisions, and actor attribution. Retry unexpected failures up to three times after the initial attempt; do not repeat already committed effects.
- Revalidate existing-product identity and Barcode uniqueness at commit. A stale preview must not silently overwrite a different product.
- Never alter stock through CSV and do not invent a fixed row-count cap or throughput guarantee.

### Alerts and AI

- Out of Stock means zero Available Stock; do not conflate Recorded Stock and Available Stock while OQ-34 remains unresolved.
- Low Stock alerts use the manually configured product-specific threshold. An AI-suggested threshold, if implemented after its criteria are approved, must remain distinct and advisory.
- Recommendations must use available evidence, explain uncertainty, and report Insufficient Data rather than fabricate facts.
- AI does not place supplier orders, make the Owner’s purchasing decision, write authoritative sale or stock data, or block/roll back checkout.
- Reporting, alerts, and AI are read-oriented and may not become authorities for transactional sale or inventory updates.
- Enforce role permissions server-side on protected commands and sensitive reads; UI hiding alone is insufficient.
- Preserve the proposed three-tier layered modular monolith and explicit module/service ownership. Do not introduce a model provider, cloud dependency, message broker, microservice, or separate database without human approval and an ADR.

### Shared quality and workflow constraints

- NFR-01 retains a three-second target for barcode recognition, item addition, Draft Bill recalculation, and Push, measured at 95% of operations with five concurrent users on a documented development machine. Separate report, alert, and AI response targets are not yet specified.
- Keep background work durable, restartable, idempotent, and resource-bounded so it does not starve checkout.
- The workflow calls for end-to-end vertical slices, context validation, clarified criteria/open decisions, tests, implementation only after approval, verification, human review, and integration.
- The proposed stack in `context-baseline.md` is for Stage 2 evaluation, not settled architecture. Strict TypeScript is recorded as confirmed in that repository baseline.
- Treat all five ADRs as Proposed; do not infer acceptance from their presence or the architecture summary.

## 5. Identified ambiguities and unresolved issues

### CSV import

- Exact product-name, Barcode, and price validation formats are unspecified.
- Representative file sizes, workload conditions, and throughput/performance benchmarks are unspecified.
- The precise user-facing handling of stale preview conflicts is open.
- Policy for a confirmed worker job after the initiating user's account is disabled or permissions are revoked is open.
- The technology and worker implementation choices remain subject to Stage 2 evaluation and approval.

### Alerts and AI

- **OQ-08/OQ-39:** expiry-date validation and the Approaching Expiry warning period.
- **OQ-09:** AI-suggested Low Stock threshold method/evidence and alert priority.
- **OQ-16–OQ-21/OQ-42:** reporting periods, measures, trends, demand/profitability formulas, and approved dashboard figures that may provide AI evidence.
- **OQ-22/OQ-43:** AI minimum evidence, method/provider, recommendation timing, correctness criteria, and whether exact restock quantities may be suggested.
- **OQ-23:** response-time targets for reporting, alerts, and AI Recommendations.
- Refund/return treatment in reports and rankings remains open under **OQ-14** and may affect the evidence used by recommendations.
- **OQ-34:** relationship between Recorded Stock and Available Stock.
- Technology selection and formal ADR approval remain open. No AI model/provider has been selected.

### Other context-level unresolved issues

The baseline also identifies unresolved role permissions (**OQ-02**), audit retention/deletion (**OQ-04**), deployment/network/offline and recovery objectives (**OQ-27**), and server-clock precision (**OQ-51**). These should not be decided implicitly as part of CSV, alerts, or AI work.

## 6. Recommendations — AI-generated, not human decisions

The following are recommendations for planning discussion only:

1. Map any proposed slices to FRs and acceptance criteria, including negative authorization, failure/retry, and end-to-end evidence.
2. Identify which unresolved decisions block each slice and obtain human decisions or explicitly defer them to a named readiness gate before implementation.
3. For CSV slices, include tests for the exact header, row-level rejection, duplicate-resolution order, Replace/Skip, no preview writes, cancellation, stale matches, retries/restarts, role denial, and unchanged stock.
4. For alert and AI slices, avoid inventing thresholds, dashboards, performance promises, models, or predictions while their criteria remain open. Test insufficient evidence and checkout isolation.
5. Keep the module ownership boundaries explicit in slice design: CSV Import coordinates Catalog/Locations; Alerts and AI consume authorized read interfaces rather than writing source facts.

These recommendations are not approvals, assignments, or changes to requirements.

## 7. Human clarifications and feedback recorded

### Explicitly stated by the user in this conversation

- The user stated: “I am responsible for CSV, alerts, AI.”
- The user directed that assignments remain proposed until plan approval.
- The user requested no coding or file edits for the context-review task.
- The user confirmed creation of `feature-nazakat` after being asked for confirmation.

These statements do not approve a plan, implementation, technology choice, or change to product behavior.

### Clarifications recorded in `context-baseline.md`

The repository's Stage 1 context baseline records these human clarifications as project context:

- The three-tier layered modular monolith is retained as the project baseline, while ADRs remain Proposed pending approval.
- `ADR/` is the standard ADR directory; references to `ADRs/` are recorded as an inconsistency to resolve during Stage 2 context validation.
- Strict TypeScript is required; the listed frontend, backend, database, and supporting technologies are proposed for Stage 2 evaluation.
- Physical USB HID barcode scanners, manual barcode entry, name lookup, string Barcodes preserving leading zeros, unknown-code fallback, and no automatic product creation are recorded requirements. Specific scanner model, suffix, timing, and verification evidence remain open.
- The DreamsPOS reference is visual inspiration only; it is not an approved source of functionality, metrics, assets, or sample data.
- The project scope is one shop with intended central LAN hosting and multiple authorized workstations; several deployment and recovery details remain unresolved.
- The project requires 20 meaningful end-to-end slices, five per engineer, and genuine AI/Git evidence.
- Stage 2 validation and planning may proceed; implementation and file generation remain prohibited until explicit confirmation.

This section reports what the baseline document records; it does not claim that every clarification was personally made by Nazakat or newly confirmed in this review.

## 8. Source documents

- [`context-baseline.md`](https://github.com/thedevhassoo/SmartPOS/blob/develop/context-baseline.md)
- [`AGENTS.md`](https://github.com/thedevhassoo/SmartPOS/blob/develop/AGENTS.md)
- [`PRD.md`](https://github.com/thedevhassoo/SmartPOS/blob/develop/PRD.md)
- [`architecture.md`](https://github.com/thedevhassoo/SmartPOS/blob/develop/architecture.md)
- [`ADR/ADR-001-architecture-style.md`](https://github.com/thedevhassoo/SmartPOS/blob/develop/ADR/ADR-001-architecture-style.md)
- [`ADR/ADR-002-data-persistence.md`](https://github.com/thedevhassoo/SmartPOS/blob/develop/ADR/ADR-002-data-persistence.md)
- [`ADR/ADR-003-authentication-boundary.md`](https://github.com/thedevhassoo/SmartPOS/blob/develop/ADR/ADR-003-authentication-boundary.md)
- [`ADR/ADR-004-csv-import-recovery.md`](https://github.com/thedevhassoo/SmartPOS/blob/develop/ADR/ADR-004-csv-import-recovery.md)
- [`ADR/ADR-005-scheduled-offer-eligibility.md`](https://github.com/thedevhassoo/SmartPOS/blob/develop/ADR/ADR-005-scheduled-offer-eligibility.md)
- [`guidelines/development-workflow.md`](https://github.com/thedevhassoo/SmartPOS/blob/develop/guidelines/development-workflow.md)
- [`guidelines/ui-design.md`](https://github.com/thedevhassoo/SmartPOS/blob/develop/guidelines/ui-design.md)
- [`guidelines/barcode-scanner.md`](https://github.com/thedevhassoo/SmartPOS/blob/develop/guidelines/barcode-scanner.md)

## 9. Review record

**Human review status:** Awaiting Nazakat Ali's review and edits/feedback.  
**Commit status:** Not committed.  
**Approval status:** No plan, assignment, requirement change, or ADR decision is approved by this document.

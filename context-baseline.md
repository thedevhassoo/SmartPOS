# SmartPOS — Confirmed Project Context Baseline

**Status:** Stage 1 baseline confirmed; Stage 2 validation and planning are not yet authorization to implement.  
**Repository:** `thedevhassoo/SmartPOS`  
**Source repository commit:** [`60f94d86cc4446cad0d18da68065f746848acba0`](https://github.com/thedevhassoo/SmartPOS/commit/60f94d86cc4446cad0d18da68065f746848acba0)  
**Baseline branch:** `develop`

## 1. Confirmed product context

SmartPOS is an AI-powered in-store POS and inventory system for **one retail shop**. It combines checkout, product lookup and maintenance, stock and expiry management, refunds and returns, storage locations, scheduled store-wide offers, CSV product import, reports, stock alerts, audit/history and advisory AI insights.

### Intended users

- **Business Owner:** Full business access; sole authority to manage user accounts and reset passwords; final purchasing authority.
- **Store Manager:** Billing, product and inventory management, location and CSV import management, offer management, reports/audits and refund approval/rejection. Cannot manage user accounts or reset passwords.
- **Cashier:** Billing and Push of a paid Draft Bill, manual or scanned lookup, name search, and submission of eligible refund requests. Cannot approve or reject refunds, adjust stock, change prices, manage locations/offers, import products, or access analytics, AI Insights or Audit Records.
- **Customer:** Supplies products or a receipt/Returned Product; has no account or loyalty functionality.

`Authorized Inventory User` means Business Owner or Store Manager, not a fourth role.

### Confirmed product objectives

- Complete accurate and fast in-store billing.
- Distinguish Draft Bills from Completed Sales and prevent drafts from reserving or deducting stock.
- Keep sale records and corresponding inventory effects consistent.
- Provide product, batch, expiry, stock and alert information.
- Support CSV product import with preview, decisions and recoverability.
- Maintain at most one current Storage Location per Registered Product.
- Support non-overlapping, store-wide Authorized Offers.
- Process eligible refunds and track returned/resellable product state.
- Provide evidence-based, advisory AI without unsupported certainty or automatic purchasing.
- Preserve role-based access and traceable sensitive actions.

### Explicit non-goals

Out of scope are online/e-commerce sales, multiple branches, supplier/purchase-order management, direct payment processing or payment providers, customer accounts, loyalty schemes, shipping, external notifications, stock reservations and AI purchasing decisions.

## 2. Confirmed functional requirements

The PRD remains authoritative and contains 16 functional requirements:

- **FR-01:** authentication and role-based access.
- **FR-02:** product registration and barcode/name lookup.
- **FR-03:** preparation of a Draft Bill.
- **FR-04:** authoritative Push and atomic Completed Sale/stock-deduction behavior.
- **FR-05:** inventory management and Manual Stock Adjustments.
- **FR-06:** Product Batches and expiry/cost tracking.
- **FR-07:** Out of Stock, Low Stock and Approaching Expiry alerts.
- **FR-08:** Owner/Manager dashboard and Sales Reports.
- **FR-09:** product sales quantity, trend and profitability analysis.
- **FR-10:** explained advisory AI Recommendations.
- **FR-11:** Refund and Partial Refund recording.
- **FR-12:** Returned Product and resellability handling.
- **FR-13:** Transaction History and Audit Records.
- **FR-14:** CSV Product Import.
- **FR-15:** Storage Location management.
- **FR-16:** Scheduled Authorized Offers.

The PRD contains acceptance criteria and business rules for these requirements. Where a criterion is marked Deferred or an Open Question remains, the rule is not resolved merely by this baseline.

## 3. Confirmed non-functional requirements

- **NFR-01:** Barcode recognition, item addition, Draft Bill recalculation and Push have a three-second target for at least 95% of measured operations with five concurrent users on a documented development machine. Analytics/AI latency is not covered by this target.
- **NFR-02:** A successful Push must retain sale/stock consistency, commit exactly once and use interruption-safe retry and concurrency behavior.
- **NFR-03:** protected operations and sensitive reads must be denied unless the current role has an approved permission.
- **NFR-04:** usability testing requires five representative participants across all three roles, one hour of training, and at least 90% successful unaided role-task completion; no task-time limit is imposed.

## 4. Confirmed architecture and module boundaries

The existing three-tier **layered modular monolith** architecture is retained:

1. **Presentation tier:** role-aware web UI for shop workstations.
2. **Business logic tier:** one central authenticated application API with cohesive modules.
3. **Persistence tier:** one central transactional relational database.

The central server is the trust and authorization boundary. Browser/workstation clients must not connect directly to the database or contain database credentials. Modules communicate through explicit application-service interfaces and ownership-safe transaction coordination.

### Required modules

- Identity & Access
- Product Catalog
- CSV Import
- Storage Locations
- Billing / Draft Bills & Completed Sales
- Scheduled Offers
- Inventory & Expiry
- Refunds & Returns
- Reporting & Stock Alerts
- AI Insights
- Audit & Transaction History
- Presentation UI

### Architectural invariants

- Push is the only authoritative Completed Sale boundary.
- Payment is received and checked outside the POS.
- Draft Bills do not reserve or deduct stock and a draft is persisted only by explicit Save.
- Sale, corresponding stock deduction and required traceability commit atomically and exactly once.
- Cross-module work does not permit unrestricted writes to another module's tables.
- Only Catalog writes product records; Locations coordinates assignment/unassignment through Catalog's public contract.
- CSV Import commits product/location changes and its success marker atomically per confirmed row and never changes stock.
- Reporting and AI remain read-oriented and isolated from checkout.
- Audit does not depend cyclically on Billing or Refunds & Returns.
- Offers are store-wide and server-time authoritative.
- Microservices, message brokers, independent databases and distributed sale workflows are not approved.

## 5. Current ADR status

All five existing ADRs remain **Proposed** until explicitly evaluated and approved:

- `ADR/ADR-001-architecture-style.md`
- `ADR/ADR-002-data-persistence.md`
- `ADR/ADR-003-authentication-boundary.md`
- `ADR/ADR-004-csv-import-recovery.md`
- `ADR/ADR-005-scheduled-offer-eligibility.md`

Their status must not be converted to Accepted or Approved during implementation by inference. Formal approval is required before technology or architecture decisions are considered settled.

## 6. Proposed technology stack — for Stage 2 evaluation

The following technologies are proposed, not yet formally approved:

- Frontend: React, TypeScript, Vite, Tailwind CSS, Material UI, Lucide React, Framer Motion, Axios and Recharts.
- Backend: Node.js, Express.js and TypeScript.
- Persistence: PostgreSQL.
- Additional implementation choices to evaluate: Zod, `csv-parse`, `pg`, Vitest, Supertest and Playwright.

**Strict TypeScript is confirmed** for both frontend and backend. Shared typed contracts should be used where useful, and runtime validation is required at trust boundaries.

Stage 2 must evaluate the framework, library, database and testing choices against the architecture, developer capability, deployment environment and maintenance needs. No ADR may be silently overridden by the proposed stack.

## 7. Barcode and physical scanner requirements — confirmed behavior

The implementation must support:

- A physical USB HID barcode scanner.
- Manual barcode entry.
- Product-name lookup.
- Unknown-barcode fallback to name search.
- Barcode values as strings, preserving leading zeros.
- No numeric coercion of barcode values.
- No automatic product creation from an unknown barcode.
- Shared lookup behavior across scan and manual entry.
- Safe scanner handling that does not steal focus from unrelated dialogs or quantity editors.
- Rapid repeated intentional scans with lossless quantity behavior.
- Single submission for one scanner terminator.

The USB HID keyboard-wedge, suffix configuration, actual scanner model, interaction timing and verification evidence are **proposed scanner details** to validate during planning. Automated keyboard-event tests do not replace real hardware validation.

## 8. Visual design baseline — visual inspiration only

DreamsPOS is used exclusively as a visual reference for:

- a minimalist light theme;
- orange accent colors;
- clean sidebar navigation;
- cards and chart/table layouts;
- neutral workspace surfaces;
- compact retail-admin typography and spacing;
- restrained use of emphasis and motion.

This reference is **not** an approved feature source. SmartPOS must not copy its HTML/CSS, paid assets, logos, photos, sample data, menu features or invented dashboard metrics.

The proposed starter palette includes:

- Accent: `#FE9F43`
- Accent strong: `#C65D10`
- Heading: `#092C4C`
- Body: `#344054`
- Muted: `#667085`
- Background: `#F8F9FA`
- Surface: `#FFFFFF`
- Border: `#E6E9EE`
- Success, warning, error and info status colors as defined in `guidelines/ui-design.md`

These are proposed starter tokens, not browser-verified extracted reference CSS. Actual computed colors should be verified if the reference is accessible, and no production metric or chart value may be fabricated.

## 9. Deployment requirement

SmartPOS is for a **single retail shop**. The intended deployment is a central LAN-hosted application server with multiple authorized workstations/browsers connected to the same system and database.

Confirmed scope:

- No cloud runtime dependency.
- No public hosting requirement.
- Centralized server and database.
- Multiple authorized browsers/workstations.

Still unresolved:

- Final hardware and server location.
- Network topology and physical wiring.
- Offline operation.
- Availability targets.
- Backup cadence.
- RPO/RTO.
- LAN/domain authentication details.

These remain Stage 2 or slice-readiness decisions and must not be invented.

## 10. Development workflow and team responsibilities

The project must contain exactly **20 meaningful end-to-end vertical slices**, divided equally as **five slices per engineer**:

- Hassan Adil
- Nazakat Ali
- Muhammad Sana Ullah
- Muhammad Faseeh

All slices must demonstrate observable end-to-end value rather than separate frontend, backend or database-only work.

Development must preserve:

- relevant PRD requirements and acceptance criteria;
- architecture and module boundaries;
- relevant ADR constraints;
- genuine AI chat evidence;
- individual Git contributions;
- human review decisions;
- test commands and outcomes;
- evolution of `plan.md`.

A slice workflow is:

1. validate relevant context;
2. clarify criteria and open decisions;
3. define tests;
4. implement only the approved scope;
5. verify function, negative cases and integration;
6. obtain human Accept/Revise/Reject review;
7. integrate accepted work;
8. update plan/evidence where required.

No implementation, new ADR, `plan.md`, or `README.md` should be generated until the approved Stage 2 gate or later human confirmation explicitly permits it.

## 11. Identified inconsistencies

- `AGENTS.md` and `architecture.md` refer to `ADRs/`, while the repository standard and human clarification specify `ADR/`. This is recorded for Stage 2 context validation and should be corrected consistently during planning, not silently left as conflicting instructions.
- Some supporting documents use proposed structure or teaching-example language. The PRD is the requirements source, architecture defines logical boundaries, and ADRs describe proposed decisions only.
- The initial project structure document proposes a logical layout and test areas, but does not authorize specific technology or implementation scaffolding.
- The DreamsPOS brief proposes starter UI tokens and layout patterns; those values are not verified computed CSS and may not be treated as extracted reference assets.
- The barcode brief proposes USB HID behavior, but scanner suffix, model and hardware verification remain unresolved.
- The workflow guideline refers to AI-conversation and Git evidence, but repository-wide evidence capture must be genuine and must not fabricate sessions or commits.

## 12. Unresolved Stage 2 decisions

The Stage 2 validation must address the relevant unresolved PRD and architecture topics, including:

- OQ-02: complete role/permission matrix.
- OQ-04: Audit Record deletion, retention and integrity safeguards.
- OQ-08/OQ-39: Approaching Expiry warning and expiry-date validation.
- OQ-09: AI-suggested Low Stock threshold method.
- OQ-10/OQ-31/OQ-50: manual discount stacking, tax, currency, rounding and calculation order.
- OQ-13–OQ-15: refund reversals, 168-hour cutoff and reporting/recovery behavior.
- OQ-14: refund/return effect on reports and rankings.
- OQ-16–OQ-21: reporting periods, demand formulas, profitability and trend classifications.
- OQ-22/OQ-43: AI minimum evidence and correctness criteria.
- OQ-23: report/alert/AI response-time targets.
- OQ-24: detailed crash recovery/reconciliation beyond atomicity.
- OQ-27: hardware, network, offline, availability and recovery objectives.
- OQ-34: Recorded/Available Stock relationship and stock-adjustment safeguards.
- OQ-35: refund-specific history permissions.
- OQ-40: Receipt matching fields.
- OQ-42: approved dashboard measures.
- OQ-51: PKT clock synchronization/precision and boundary-test specification.
- CSV field formats and representative workload benchmarks.
- Confirmed technology choices and formal ADR approval.
- Authentication/session format and credential policy.
- Idempotency-token transport and stable Push identity persistence.
- Worker behavior after role revocation or account deactivation.
- Stale import-preview conflict behavior.

A consequential unresolved item may be deferred only to an explicitly identified slice readiness gate; it must not be silently implemented as an assumption.

## 13. Human clarifications in this conversation

The following clarifications supplement the repository and supersede earlier ambiguity:

1. The existing three-tier layered modular monolith architecture is retained.
2. `ADR/` is the standard ADR directory name. References to `ADRs/` must be recorded as an issue for Stage 2 context validation.
3. React/TypeScript/Vite, Tailwind, Material UI, Lucide, Framer Motion, Axios and Recharts; Node.js/Express/TypeScript; and PostgreSQL are the proposed stack to evaluate and formalize in Stage 2.
4. Strict TypeScript is required throughout frontend and backend.
5. Physical USB HID barcode scanners, manual barcode entry and name lookup are explicitly required. Barcodes are opaque strings and preserve leading zeros.
6. DreamsPOS is a visual-only reference. No reference functionality, metric or sample data may enter SmartPOS.
7. The application is for one shop, central LAN hosting and multiple authorized workstations.
8. All five existing ADRs remain Proposed until evaluated and approved.
9. Unresolved business rules and architectural decisions must be addressed in Stage 2 or explicitly deferred to a slice readiness gate.
10. Exactly 20 meaningful slices, five per engineer, are required, with genuine AI interactions and Git history preserved.
11. Stage 1 is complete and the existing context is the baseline for Stage 2.
12. Stage 2 validation and planning may proceed; implementation and file generation remain prohibited until explicit confirmation.

## 14. Authoritative sources

In descending behavioral authority:

1. Human-confirmed clarifications in this conversation.
2. `PRD.md` for product behavior, acceptance criteria and Open Questions.
3. `architecture.md` for logical architecture and module boundaries.
4. The existing ADRs as Proposed architectural decisions.
5. `AGENTS.md` for agent operating constraints.
6. Supporting artefacts and guidelines for implementation guidance, workflow and visual/hardware proposals.
7. Planning examples in `examples/`, used only as structural examples, never as product requirements.

**Source commit:** [`60f94d86cc4446cad0d18da68065f746848acba0`](https://github.com/thedevhassoo/SmartPOS/commit/60f94d86cc4446cad0d18da68065f746848acba0)  
**Repository state at context capture:** only planning/context documents; no source code or application build configuration existed.

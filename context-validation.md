# SmartPOS — Stage 2 Consolidated Context Validation

**Status:** Approved Stage 2 context baseline; implementation has not started.  
**Approval:** Explicit user authorization in the Stage 2 instruction, 2026-11-26 (session date); this records the instruction, not a fabricated meeting or approval.  
**Repository:** `thedevhassoo/SmartPOS`  
**Source develop HEAD reviewed:** `bf6ef4c2f209884871207be0cfcbb418ea623351`  
**Source context baseline:** `context-baseline.md`; the four individual reviews under `context-reviews/`.

## Executive outcome

The approved implementation context retains the three-tier layered modular monolith, explicit module ownership and the rule that sale completion and stock deduction are one synchronous, atomic, idempotent Push. The technology stack, LAN deployment constraints, three-role permission matrix, barcode behavior, UI direction, reporting rules, money rules, offer behavior, inventory rules, CSV rules and refund/return rules are approved as specified by the Stage 2 authorization and are to be reflected in the PRD, architecture, agent guidance and ADRs. All five existing ADRs are to be formally accepted, with their original reasoning and trade-offs preserved. ADR-006 records the approved stack/runtime.

This is a specification/planning approval only. It does **not** mean any software, test, hardware check, backup, restore, performance benchmark or slice has been implemented or verified. All 20 slices start Not Started. Human Accept/Revise/Reject review and integration gates remain mandatory.

## Engineer context reviews

All four independent review documents are present on the reviewed develop baseline:

- Hassan Adil — `context-reviews/hassan-adil.md`: proposed S03/S05/S06/S09/S16; product and location ownership, Draft Bill constraints, barcode integrity and dashboard dependency findings.
- Nazakat Ali — `context-reviews/Nazakat-Ali.md`: proposed CSV, alerts and AI areas; durable import state, no preview writes/stock mutation, evidence-bound advisory outputs.
- Muhammad Sana Ullah — `context-reviews/Muhammad-Sana-Ullah.md`: proposed identity/staff, batches/adjustments and sales areas; server authorization, Inventory ownership, explicit Save and atomic Push.
- Muhammad Faseeh — `context-reviews/Muhammad-Faseeh.md`: proposed offers, refunds and returns; server-time offers, refund linkage and distinct monetary/physical return state.

The user confirms all reviews are complete. Update each review’s status metadata to say **Context review complete; proposed slice ownership is approved by the Stage 2 allocation below; this does not record any individual feedback or human approval beyond that status.** Preserve authored findings and do not invent session identifiers, personal approvals, test results or feedback. Retain the already explicit Faseeh approval of his review content. Do not overwrite that distinction with a claim of per-engineer approval of decisions.

## Approved architecture and ADRs

The approved style is three-tier client-server layered modular monolith: browser UI → central authenticated API and in-process application services → one central PostgreSQL transactional database. Multiple authorized shop workstations access the centralized LAN host; no cloud runtime dependency, offline billing/synchronization, microservices, message broker, separate service databases or payment gateway is included.

Keep module-owned data operations and explicit public service interfaces. Catalog alone writes product rows; Locations invokes Catalog assignment/unassignment ports in a shared opaque unit of work. Billing coordinates Offers, Inventory and Audit for Push. CSV Import calls Catalog and Locations services; Reporting and AI are read-oriented; Audit never imports Billing or Refunds. No browser database connection or raw database client in public module contracts. Critical operations use a shared transaction; async work cannot be the authority for sale/stock correctness.

**ADR-001 through ADR-005: Accepted on 2026-11-26 by explicit Stage 2 instruction.** Preserve the existing context, alternatives, rationale, consequences and constraints; add an approval record without rewriting original rationale. Standardize paths to `ADR/`. Add ADR-006 for the approved stack and LAN runtime. Do not add other ADRs unless a distinct significant engineering choice requires one and is recorded with its alternatives and approval.

## Approved stack

- **Frontend:** React, strict TypeScript, Vite, React Router, Tailwind CSS, Material UI, Lucide React, Framer Motion, Axios and Recharts.
- **Backend:** Node.js LTS, Express.js and strict TypeScript.
- **Persistence:** PostgreSQL, `node-postgres` (`pg`), version-controlled SQL migrations and parameterized queries.
- **Supporting:** Zod, `csv-parse`, Vitest, Supertest, Playwright, Git and GitHub.
- Select compatible stable package versions and an appropriate Node LTS during project initialization; record actual versions and commit the lockfile. Do not fabricate the version selection now.
- Use shared TS types/schemas only for genuine cross-boundary contracts. MUI primarily for forms/dialogs/tables/interactions; Tailwind for layout/spacing/responsive design under one shared theme. Framer Motion is restrained and respects reduced-motion.
- No unnecessary ORM, cloud provider, microservice, external job platform or additional infrastructure.

## Approved product and operational decisions

### Deployment

One retail shop; one central host runs Express and PostgreSQL; multiple authorized workstations connect over LAN. Express may serve the production React build. Normal operation has no internet dependency. PostgreSQL is not exposed to workstations. Offline billing/synchronization is out of scope. On server/network failure, show a clear connection error and do not claim or present unverified transaction completion. Use environment-based configuration/secrets. Provide PostgreSQL backup/restore instructions and perform actual restoration verification before release. Do not claim HA, failover or disaster recovery guarantees without implemented, measured evidence. Record actual host/network details and deployment test results when known.

### Roles and security

Exactly Business Owner, Store Manager and Cashier. Apply the specific role rights in FR-01–FR-16 and the authorized matrix in the user’s Stage 2 instruction; all unspecified operations deny by default. Owner alone manages/deactivates accounts and resets passwords. Manager cannot do either or delete audit records. Cashier can perform permitted lookup, Draft Bill/Push, submit eligible refunds and see task-relevant transaction/refund information, but cannot approve/reject, confirm resellability, change price/stock/location/offer, see management analytics/AI or view audit records. Owner/Manager manage products, stock, batches, locations, imports and offers, access permitted reporting/AI/audit, approve/reject refunds, confirm external refund completion and final resellability.

Backend authorization protects every command and sensitive read; frontend visibility is not security. Use Argon2id or bcrypt password hashing; server-side PostgreSQL-backed sessions; HttpOnly cookies; appropriate SameSite, CSRF, logout/deactivation/credential-change invalidation, login rate limits, parameterized SQL, restricted DB privileges and environment secrets. Automatic inactivity logout is not mandatory and must not be added as a cashier disruption. Audit records are retained through release; prohibit untraceable deletion. If Owner deletion is retained, implement traceable archival/soft deletion with immutable deletion evidence, not physical evidence removal through normal operations.

### Barcode

Explicitly support USB HID keyboard-emulation scanners, manual barcode entry and product-name lookup with a shared authoritative lookup. Barcode values are opaque strings preserving leading zeros. Enter is the default scanner terminator subject to device setup. Maintain designated checkout input focus without intercepting unrelated fields/dialogs. Process rapid intended repeats losslessly; scanning a product already on the Draft Bill increments its quantity; deduplicate one terminator event. Unknown barcode gives clear feedback, allows name search and never auto-registers. Automated keyboard tests do not count as physical hardware verification. Record actual device model, connection, suffix and results when available; mark verification pending until actually done.

### Visual design

DreamsPOS is exclusively a visual reference for minimalist light retail-administration style, orange accent, sidebar/header, typography, spacing, cards, charts and tables. Do not copy its features, metrics, sample data, assets, logo or branding. The approved SmartPOS tokens are: orange `#FE9F43`, navy `#092C4C`, workspace `#F8F9FA`, surface `#FFFFFF`, body `#344054`, secondary `#667085`, success `#28A745`, warning `#F59E0B`, error `#DC2626`. These are SmartPOS tokens, not claims of computed DreamsPOS CSS. Check contrast and accessibility; production screens use real backend data and no fabricated metrics.

### Dashboard, reports and money

Dashboard remains limited to FR-07–FR-10. Approved metrics: Gross Recorded Sales (completed sale amounts after offer, before confirmed refunds), Completed Sales Count, Completed Refund Amount (only externally confirmed Refunded), Net Recorded Sales (gross less completed refunds attributed to refund confirmation date in selected period), and Actual Units Sold. Draft Bills excluded. Pending/Approved/Rejected refunds do not reduce completed refund totals. Returns alone do not reduce revenue unless money refund completed. Sales use sale completion date; refunds use refund confirmation date. PKT periods: Today, last 7 calendar days including today, last 30 calendar days including today, current month, custom date range. Empty periods display actual zero.

Product performance uses net sold quantities and daily velocity, category-relative classification with deterministic documented thresholds, at least three comparable category products and at least 30 days history/10 net units for demand forecast; insufficient data is explicit. Rising demand is at least 20% higher daily velocity than the nonzero preceding comparison period with adequate evidence. Profitability uses historical price and batch cost snapshots, proportional allocation of bill discounts, actual batch allocations and attributable cost of goods sold; returned cost reversals apply when goods are restored as resellable, with periods documented. Gross margin only for positive denominator. Label result as recorded gross profit, not total business net profit; missing costs show unavailable/insufficient data.

Currency PKR, two decimals; exact decimal-safe arithmetic (integer minor units or equivalent); round half up. Subtotal is sum of quantity × recorded selling price. Percentage offer applies to bill subtotal; fixed amount applies once per bill; total discount capped at subtotal; scheduled offers do not overlap and manual discounts do not stack. Cashier cannot edit price/discount. Allocate bill discount deterministically to lines so totals reconcile. Tax is excluded from initial release unless an established requirement requires it; recorded selling price is final retail price. Preserve historical prices/discounts/totals. Reconcile OQ-31 with OQ-10/OQ-50 without dropping its reference.

### Offers

Preserve FR-16/ADR-005. Percentage amount is >0 and ≤100%; fixed amount >0. Use server time, PKT canonical store zone, UTC timestamp persistence, start-inclusive/end-exclusive intervals, no overlapping non-cancelled schedules, adjacent intervals allowed, start < end. Re-evaluate at Draft Bill calculation and Push; preserve snapshots. Use PostgreSQL exclusion constraint or an equivalently reliable transactional mechanism for concurrent schedule writes. No client clock or active flag authority. Injectable clock; test immediately before/at/after boundaries. Document host clock synchronization requirement.

### Inventory, refunds, CSV and AI

Apply the precise additional rules approved in Stage 2 instruction: Available Stock excludes pending-inspection, non-resellable, quarantined and expired units; no negative balances; positive integer sale/batch quantities; valid expiry for expiry-tracked items and explicit non-expiring classification; earliest-expiring eligible batch allocation with deterministic ties; store actual batch allocations/cost snapshots; audited, concurrency-safe stock adjustments; no silent reconciliation. Any expired incoming-stock exception must use a controlled non-sellable path supported by the revised PRD.

Refund eligibility: before 168 hours; exactly 168 hours is ineligible. A verifiable receipt/sale and original lines/quantities/amount are required. Pending/Approved requests reserve units/value; Refunded consumes them; Rejected releases reservations. Cap at amount actually paid less reserved/refunded amounts; line-level limits use discounted sale snapshots. Refund becomes Refunded only after external return confirmation. On failed/uncertain external reversal retain Approved, record reconciliation issue, keep reservation, require authorized verification before retry/completion. No payment processing. Monetary and physical-return state remain separate; only Owner/Manager confirms resellability and then Inventory performs an atomic, duplicate-safe stock transition.

CSV remains exact ordered four-column schema, `.csv` only, string barcodes, optional location value, duplicate-resolution-first, Replace/Skip, no preview mutation, explicit confirmation, durable row outcomes, atomic row effect and bounded retry, no stock effects, Catalog/Locations ownership and stale-state conflict detection. Approved Stage 2 additions: UTF-8 with optional BOM; explicit Uncategorized on new imports and preserve existing category on replace because schema has no category; consistent documented validation limits; configurable initial 5 MB/10,000 rows, subject to workload verification; bounded in-process workers; reauthorize before each new row after revocation, pausing work and requiring authorized resume.

AI is a local explainable statistical/rule engine, not cloud. Thirty-day moving average net daily sold quantities; require 30 days history and 10 net sold units for a demand forecast; otherwise Insufficient Data. Advisory low-stock suggestion uses estimated velocity and approved 7-day coverage, rounded up. Explain inputs, period, evidence, assumptions, uncertainty and suggested threshold. No auto-purchase, authoritative writes, threshold replacement without explicit acceptance or checkout blocking. Evaluate deterministic fixtures, expected outputs, insufficient-data cases and held-out historical periods where possible; report actual error metric; no unsupported accuracy claims. Retrieval target: dashboard/report/alerts 5 seconds and on-demand recommendations 10 seconds under documented representative workloads, as targets not results.

## Approved 20-slice allocation

All slices are meaningful end-to-end UI/API/service/data/test vertical slices, not layer-only tasks. Every slice is **Not Started** and not accepted until actual checks pass and a human Accept is recorded.

| ID | Owner | Slice | Key dependency/order |
|---|---|---|---|
| S01 | Muhammad Sana Ullah | Authentication and server-enforced role access | Foundation; complete matrix/session controls |
| S02 | Muhammad Sana Ullah | Staff accounts/password management | S01 |
| S03 | Hassan Adil | Product registration, maintenance, barcode/name lookup | S01; catalog contract |
| S04 | Muhammad Sana Ullah | Incoming batches, expiry and purchase costs | S01, S03, inventory contract |
| S05 | Hassan Adil | Storage location create/edit and product assignment | S01, S03, Catalog public port |
| S06 | Hassan Adil | Location filter and safe atomic deletion | S05; Catalog unassign port |
| S07 | Nazakat Ali | CSV upload, schema/row validation and preview | S01, S03, S05 |
| S08 | Nazakat Ali | Duplicate barcode decisions and Replace/Skip | S07, S03 |
| S09 | Hassan Adil | Physical scanner workflow and Draft Bills | S01, S03; later S12/S13 integrations |
| S10 | Muhammad Sana Ullah | Inventory reconciliation and audited stock adjustments | S01, S03, S04 |
| S11 | Muhammad Faseeh | Scheduled offer create/edit/cancel | S01 |
| S12 | Muhammad Faseeh | Server-time eligibility and bill calculation | S09, S11, money rules |
| S13 | Muhammad Sana Ullah | Atomic Push, stock deduction, receipts/history | S01, S03, S04, S09, S10, S12; unit of work |
| S14 | Nazakat Ali | Confirmed CSV execution, durable outcomes and retries | S07/S08, S03/S05, S13 concurrency contracts |
| S15 | Muhammad Faseeh | Eligible full/partial refund requests | S01, S13, receipt identity |
| S16 | Hassan Adil | Sales dashboard, reporting and product performance | S13, S17; approved metrics/formulas |
| S17 | Muhammad Faseeh | Refund approval/rejection/external confirmation | S15, audit and refund accounting |
| S18 | Muhammad Faseeh | Returned-item inspection, resellability and stock disposition | S13, S15/S17, Inventory service |
| S19 | Nazakat Ali | Available Stock, Low Stock and expiry alerts | S04, S10, stock/expiry decisions |
| S20 | Nazakat Ali | Explainable AI recommendations and advisory threshold | S16, S19, evidence rules |

S07/S08/S14 are distinct user-visible import steps; S15/S17/S18 are distinct refund/return capabilities. The exact plan must map all FRs, NFRs and existing AC IDs; shared components/interfaces are coordinated and do not create extra slices. Proposed execution order is S01 → S02/S03; S03 → S04/S05; S05 → S06/S07; S07 → S08 → S14; S04 → S10; S11 and S09 in parallel after S01/S03; S11+S09 → S12 → S13; S13 → S15 → S17/S18; S04/S10/S13/S17 → S16/S19 → S20. Adjust only if dependency analysis finds a genuine contradiction and document it.

## Stage 2 artefact deliverables

Generate/update only these requested docs and context files, not code/scaffolding:

- `PRD.md`, `architecture.md`, `AGENTS.md`, `context-baseline.md`
- `ADR/ADR-001` through `ADR-005` approval records preserving original content
- `ADR/ADR-006-technology-stack-and-runtime.md`
- `context-validation.md`, `decision-register.md`, `README.md`, `plan.md`, `traceability.md`, `testing.md`, `workflow-evidence-log.md`, `group-contribution-log.md`
- Relevant workflow/UI/barcode guidelines
- `plan-history/plan-v01.md`, identical in content to initial `plan.md`

All 20 slices are Not Started. Evidence logs have assignments but use Pending/Not Run for work not yet performed; do not fabricate AI task IDs, tests, human decisions, package versions or milestones. Capture actual PKT plan timestamp and actual initialization selections when known. The examples remain structural examples only. Keep the master plan on develop to avoid parallel-edit conflicts.

## Known caveats to preserve while documenting

- “Current date/time PKT” must be the actual write-time, not guessed/backdated. Do not fabricate seconds/time if the integration does not provide it; record date/time only when actually available.
- Initial stack package versions and Node LTS release are to be selected at initialization; do not claim selected versions now.
- The user’s fixed 5 MB / 10,000-row import limit supersedes the older no-fixed-cap PRD rule. Update FR-14 and its ACs explicitly and preserve a performance test gate; do not leave contradictory text.
- The expired incoming-batch exception cannot be specified as a real “non-sellable path” unless the PRD/acceptance criteria define it; make a clear, minimal formal addition or mark the rule as a human decision inconsistency before editing, rather than burying an implied workflow.
- Applying discount rounding/allocation, profitability return-cost reversals and AI category thresholds requires exact deterministic definitions and ACs; include the explicit approved formulas in the PRD or supporting rules.
- “All four reviews complete” does not change author-specific review text that says “draft” without confirmation. The user directly instructs status metadata standardization; update only the factual review-completion field and preserve each document’s statement that assignments/decisions were not individually approved. Stage 2 user approval applies to decisions collectively.
- The branch data API showed the expected paths on develop. Its contents endpoint occasionally returned `main` for omitted `ref`; for writes, explicitly target `develop` and re-check HEAD immediately before commit.

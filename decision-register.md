# SmartPOS — Decision Register

**Status:** Approved Stage 2 planning register.  
**Develop baseline:** `ae19db3b5c6d10d24b6dd0586a73dd78052854eb`  
**Approval authority:** Human Stage 2 instruction, 2026-11-26.  
**Implementation status:** No source code or vertical slice implementation has begun.

## Decision status legend

- **Approved specification:** Recorded human approval and ready for planning.
- **Implementation verification pending:** Specification is approved, but hardware/test evidence does not exist yet.
- **Open / deferred:** Requires future Stage 2 or slice-readiness resolution.

## Stage 2 decisions

| ID | Decision | References | Rationale | Affected artefacts | Responsible owner | Status |
|---|---|---|---|---|---|---|
| DR-01 | Retain three-tier layered modular monolith. | ADR-001; architecture §2 | Centralized consistency, authorization and one-shop simplicity. | architecture.md, AGENTS.md, ADR-001 | All engineers | Approved specification |
| DR-02 | Accept ADR-001–ADR-005. | ADR-001–ADR-005 | Preserve existing rationale and constraints in formally approved records. | ADR/ADR-001–ADR-005 | Coordinator | Approved specification |
| DR-03 | Standardize repository documentation on `ADR/`. | context CV-01 | Matches actual repository directory. | AGENTS.md, architecture.md, supporting docs | Coordinator | Approved specification |
| DR-04 | Adopt React, strict TypeScript, Vite, React Router, Tailwind, MUI, Lucide, Framer Motion, Axios and Recharts. | context CV-03/CV-04 | Suitable for role-aware browser POS with reusable components and restrained visualization. | ADR-006, README.md, plan.md | All engineers | Approved specification |
| DR-05 | Adopt Node.js LTS, Express and strict TypeScript. | ADR-001, context CV-03 | Fits central modular API and synchronous transaction-critical operations. | ADR-006, architecture.md | Sana Ullah | Approved specification |
| DR-06 | Adopt PostgreSQL, `pg`, SQL migrations and parameterized SQL. | ADR-002 | Supports ACID Push, constraints, concurrency and module-owned repositories. | ADR-006, ADR-002, testing.md | Sana Ullah | Approved specification |
| DR-07 | Use Zod, csv-parse, Vitest, Supertest and Playwright. | FR-14, NFR-01–NFR-04 | Appropriate boundary validation and test layers. | ADR-006, testing.md | Nazakat Ali and all engineers | Approved specification |
| DR-08 | One LAN host runs Express and PostgreSQL for one shop. | CV-05, OQ-27, ADR-001 | Matches central shop context and avoids cloud/runtime dependency. | architecture.md, PRD, ADR-006 | Coordinator | Approved specification |
| DR-09 | PostgreSQL and configuration secrets are not exposed to workstations. | NFR-03, architecture §1 | Preserves trust boundary. | architecture.md, AGENTS.md | Sana Ullah | Approved specification |
| DR-10 | Offline billing and synchronization are excluded. | CON-01/CON-09, OQ-27 | No approved offline implementation or synchronization model. | PRD, plan.md | All engineers | Approved exclusion |
| DR-11 | Three roles: Owner, Manager, Cashier. | FR-01, BR-01 | Human-approved complete role model for this release. | PRD, AGENTS.md, ADR-003 | Sana Ullah | Approved specification |
| DR-12 | Deny unspecified operations by default; enforce permissions server-side. | NFR-03, OQ-02 | UI hiding is not authorization. | PRD, ADR-003, testing.md | Sana Ullah | Approved specification |
| DR-13 | Password hashing: Argon2id or bcrypt; PostgreSQL server sessions and HTTP-only/appropriate SameSite cookies. | ADR-003 | Establish secure, LAN-compatible authentication. | ADR-003, S01/S02 | Sana Ullah | Approved specification |
| DR-14 | Add logout/deactivation/credential-change session invalidation and authentication rate limiting. | FR-01, NFR-03 | Protect account and credential changes. | ADR-003, S01/S02 | Sana Ullah | Approved specification |
| DR-15 | No mandatory inactivity logout. | FR-01 AC-FR-01-06 | Preserve cashier workflow. | PRD, AGENTS.md, S01 | Sana Ullah | Approved specification |
| DR-16 | Audit evidence is retained; normal operations cannot physically untraceably delete evidence. | FR-13, OQ-04 | Preserves integrity and accountability. | PRD, ADR-002/003, S01/S13/S17 | Sana Ullah/Faseeh | Approved specification |
| DR-17 | Store barcodes as strings and preserve leading zeros. | FR-02, CV-06/CV-07 | Avoid numeric coercion. | PRD, S03/S09, ADR-006 | Hassan Adil | Approved specification |
| DR-18 | USB HID keyboard-emulation scanners are supported; proprietary drivers/browser permissions are not required. | CV-06/CV-07 | Matches approved scanner mode. | PRD, barcode guideline, S03/S09 | Hassan Adil | Approved specification |
| DR-19 | One shared lookup, unknown-code fallback and repeated-scan quantity increment. | FR-02/FR-03 | Prevent divergent lookup behavior and loss of repeated scans. | S03/S09, testing.md | Hassan Adil | Approved specification |
| DR-20 | DreamsPOS is visual-only; no copied functionality, data, assets or dashboard metrics. | CV-08, user clarification | Avoid out-of-scope feature/data copying. | UI guideline, README, plan | Hassan Adil | Approved specification |
| DR-21 | Dashboard metrics: gross sales, completed-sales count, completed refunds, net sales and actual units sold. | FR-08/09, OQ-14/OQ-42 | Only approved metrics for the release. | PRD, S16, traceability | Hassan Adil | Approved specification |
| DR-22 | Reporting periods: Today, 7 days, 30 days, current month, custom range. | OQ-16 | Human-approved period set. | PRD, S16 | Hassan Adil | Approved specification |
| DR-23 | Use PKT and transaction-event dates for reporting boundaries. | FR-08/16 | Sales on completion date; refunds on confirmation date. | PRD, S16/S17 | Hassan/Faseeh | Approved specification |
| DR-24 | Refund-aware profitability and sales formulas use completed sale and return rules. | FR-09/11/12, OQ-14/19/42 | Prevent fabricated profit or double-counting. | PRD, S16/S17/S18 | Hassan/Faseeh | Approved specification |
| DR-25 | Category-relative demand: three comparable products, 30-day and preceding 30-day comparison, 20% rising threshold. | OQ-17/18/21 | Deterministic category-relative classification. | PRD, S16 | Hassan Adil | Approved specification |
| DR-26 | PKR, two decimals, exact decimal-safe arithmetic and half-up rounding. | OQ-10/OQ-31/OQ-50 | Avoid floating-point money defects. | PRD, implementation contracts | Faseeh/Sana/Hassan | Approved specification |
| DR-27 | Percentage discounts apply to subtotal; fixed amount once per bill; no stacking; fixed/total discount never below zero or above subtotal. | FR-16, OQ-10/OQ-50 | Store-wide offer rules and consistent bill reconciliation. | PRD, S12/S13 | Faseeh/Sana | Approved specification |
| DR-28 | Store-wide offers, PKT, `[start,end)`, adjacent periods, no overlapping non-cancelled periods. | FR-16, ADR-005, OQ-51 | Preserve authoritative time semantics and prevent overlap. | PRD, ADR-005, S11/S12 | Faseeh | Approved specification |
| DR-29 | Use exclusion constraint or equally reliable transactional overlap protection. | ADR-005 | Prevent concurrent schedule overlap. | ADR-005, S11 | Faseeh/Sana | Approved specification |
| DR-30 | Draft Bills do not reserve stock; Push is authoritative. | FR-03/04, ADR-002 | Preserve existing sale/stock invariant. | PRD, ADR-002, S09/S13 | Sana/Hassan | Approved specification |
| DR-31 | Push rechecks paid amount, stock, offer and idempotency in one transaction. | FR-04, NFR-02, OQ-24 | Prevent stale/duplicate/last-unit conflicts. | PRD, ADR-002, S13 | Sana Ullah | Approved specification |
| DR-32 | Recorded Stock is accounted inventory; Available Stock is eligible units. | OQ-34 | Separate source fact from selling eligibility. | PRD, S04/S10/S19 | Sana Ullah | Approved specification |
| DR-33 | Negative stock prohibited; quantities positive integers; batch earliest-expiry allocation. | OQ-34, FR-05/06 | Deterministic inventory integrity and cost allocation. | PRD, S04/S10/S13 | Sana Ullah | Approved specification |
| DR-34 | Refund at least 168-hour inequality: before 168 hours eligible; exactly/after 168 hours ineligible. | FR-11, OQ-15 | Authoritative cutoff. | PRD, S15/S17 | Faseeh | Approved specification |
| DR-35 | Pending/Approved reserve units and value; Refunded consumes; Rejected releases. | FR-11, BR-16/17 | Prevent over-refund and duplicate reservation. | PRD, S15/S17/S18 | Faseeh | Approved specification |
| DR-36 | External refund completion is mandatory before Refunded status. | FR-11/12 | No in-system payment processing. | PRD, S17 | Faseeh | Approved specification |
| DR-37 | Returned units remain unavailable until Owner/Manager resellability confirmation. | FR-12, BR-18 | Protect Available Stock. | PRD, S18 | Faseeh | Approved specification |
| DR-38 | CSV exact ordered header; UTF-8/BOM optional; barcodes strings. | FR-14 | Preserves import format and leading zeros. | PRD, ADR-004, S07/S08/S14 | Nazakat Ali | Approved specification |
| DR-39 | Import limit 5 MB/10,000 data rows subject to workload verification; no fixed product-count limit is replaced? | FR-14.6 | Human-approved initial configurable limit supersedes no-fixed-cap wording and requires rewrite. | PRD, ADR-004, S14 | Nazakat Ali | Approved specification; implementation evidence pending |
| DR-40 | New CSV products use explicit Uncategorized; replacement preserves category. | Manual registration vs four-column CSV | Resolves category absent from CSV. | PRD, S03/S07/S14 | Nazakat Ali | Approved specification |
| DR-41 | Out of stock/Low Stock/30-day expiry alert behavior. | FR-07, OQ-08/09 | Establish approved initial alert thresholds and priority. | PRD, S19 | Nazakat Ali | Approved specification |
| DR-42 | Local explainable AI recommendation engine; no external cloud AI. | FR-10, OQ-22/43 | Avoid provider/data boundary and make evidence deterministic. | PRD, ADR-006, S20 | Nazakat Ali | Approved specification |
| DR-43 | 30-day moving average; 30 days and 10 net units; 7-day coverage threshold. | OQ-18/20/22/43 | Approves transparent demand/threshold method. | PRD, S20 | Nazakat Ali | Approved specification |
| DR-44 | NFR-01 remains 3 seconds/95%/5 users; dashboard 5 seconds and AI 10 seconds as new targets. | NFR-01/ASR-03, CV-18 | Actual tests, machine and workload do not yet exist. | testing.md, plan.md | All engineers | Approved targets; verification pending |
| DR-45 | 20 slices, five per engineer, exact allocation. | Stage 2 instruction | Human-approved allocation and exactly 20/equal ownership. | plan.md, contribution logs | All engineers | Approved specification |

## Deferred implementation-verification items

- Actual Node.js LTS/package versions and lockfile.
- Real USB HID hardware model, suffix and observed test evidence.
- Actual backup and restoration evidence.
- Actual development machine and benchmark workload.
- Real usability participants/test scripts.
- Actual AI held-out metric and deterministic fixture evidence.
- Actual OQ-31 identifier reconciliation and any stale PRD reference repair.
- Final expired-batch controlled non-sellable handling only if product text is updated consistently.
- Session/CSRF configuration details and package-specific implementation choices.

## Document update status

All decisions above are to be reflected in the relevant PRD, architecture, AGENTS, ADR and planning documents. No decision is represented as implementation-verified by this register.

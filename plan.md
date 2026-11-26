# SmartPOS — Initial Implementation Plan

**Plan version:** v01  
**Phase:** Stage 2 — Approved context and implementation planning  
**Plan status:** Not Started  
**Develop baseline:** `ae19db3b5c6d10d24b6dd0586a73dd78052854eb`  
**Creation date/time:** 2026-11-26; PKT actual write time will be recorded by repository tooling if available  
**Approval:** Human Stage 2 authorization  
**Coordinator:** Hassan Adil

## 1. Product objective

Build a central-LAN, single-shop SmartPOS combining checkout, inventory, locations, CSV import, offers, refunds/returns, reporting and explainable advisory AI while preserving atomic sale/stock consistency and server-enforced authorization.

## 2. Scope and exclusions

In scope: the 16 FRs and four NFRs, one shop, three roles, authorized LAN workstations, USB HID scanning and manual/name lookup, no external payment provider and no cloud runtime dependency. Excluded: multi-branch operation, e-commerce, customer accounts, supplier management, purchase orders, shipping, loyalty, external payment processing, offline synchronization and external AI providers.

## 3. Approved technology

React/strict TypeScript/Vite/React Router, Tailwind/MUI, Lucide, Framer Motion, Axios/Recharts; Node/Express/strict TypeScript; PostgreSQL/pg with SQL migrations; Zod/csv-parse/Vitest/Supertest/Playwright. Package versions and Node LTS are pending initialization.

## 4. Architecture

Three-tier layered modular monolith. Central authenticated API; module-owned repositories; explicit public service contracts; opaque unit of work for cross-module transactions. Push is synchronous and atomic; no async sale authority. Catalog owns product writes; Locations invokes Catalog assignment/unassignment; Billing coordinates Offers/Inventory/Audit; Reporting/AI are read-oriented; Audit is acyclic.

## 5. Approved implementation assumptions

- Human-approved role, money, reporting, barcode, offer, inventory and refund rules in the Stage 2 decision register.
- ADR-001–ADR-005 accepted; ADR-006 pending creation and approval record.
- Package versions not selected.
- 5 MB/10,000-row import limit is approved and configurable; preserve row/stock guarantees.
- All NFR targets are targets, not verified results.

## 6. Remaining operational verification

Host/network details, database backup/restoration, scanner hardware, benchmark setup, usability participants, held-out AI evaluation and package versions.

## 7. Implementation sequence

### Foundation

1. S01 Authentication and role policy.
2. S02 Staff account management.

### Catalog/location/checkout foundation

3. S03 Product and lookup.
4. S04 Incoming batches/expiry.
5. S05 Location create/edit/assignment.
6. S06 Location filter/deletion.
7. S09 Scanner checkout and Draft Bills.

### Offers and atomic sales

8. S11 Scheduled offer management.
9. S12 Server-time offer calculation.
10. S10 Inventory reconciliation/adjustments.
11. S13 Atomic Push/receipt/history.

### Import and reporting

12. S07 CSV upload/preview.
13. S08 duplicate and Replace/Skip decisions.
14. S14 confirmed import execution/retries.
15. S15 eligible refund requests.
16. S17 refund approval/completion.
17. S18 returned-product disposition.
18. S16 dashboard/report/product performance.
19. S19 stock/expiry alerts.
20. S20 explainable recommendations.

Dependency-safe parallel work is possible after S01/S03 contracts exist, but only one master develop plan and coordinator integration sequence control integration.

## 8. Twenty-slice table

| Slice | Engineer | Priority | FR/NFR | User outcome | Status |
|---|---|---|---|---|---|
| S01 | Muhammad Sana Ullah | P0 | FR-01, NFR-03 | Login and server-authorized role access | Not Started |
| S02 | Muhammad Sana Ullah | P1 | FR-01, BR-02 | Owner-managed staff accounts/password resets | Not Started |
| S03 | Hassan Adil | P0 | FR-02, NFR-01 | Product maintenance and barcode/name lookup | Not Started |
| S04 | Muhammad Sana Ullah | P1 | FR-06 | Batches with quantity/expiry/cost | Not Started |
| S05 | Hassan Adil | P1 | FR-15 | Create/edit/assign storage locations | Not Started |
| S06 | Hassan Adil | P1 | FR-15 | Filter and atomic location deletion | Not Started |
| S07 | Nazakat Ali | P1 | FR-14 | CSV upload/schema/preview | Not Started |
| S08 | Nazakat Ali | P1 | FR-14 | Duplicate resolution and Replace/Skip | Not Started |
| S09 | Hassan Adil | P0 | FR-02/03, NFR-01 | Scanner/manual checkout and Draft Bills | Not Started |
| S10 | Muhammad Sana Ullah | P1 | FR-05 | Audited stock adjustment/reconciliation | Not Started |
| S11 | Muhammad Faseeh | P1 | FR-16 | Offer create/edit/cancel | Not Started |
| S12 | Muhammad Faseeh | P0 | FR-03/16 | Server-authoritative offer calculation | Not Started |
| S13 | Muhammad Sana Ullah | P0 | FR-04, NFR-02 | Atomic Push/sale/stock/receipt/history | Not Started |
| S14 | Nazakat Ali | P1 | FR-14 | Confirmed durable import execution/retry | Not Started |
| S15 | Muhammad Faseeh | P1 | FR-11 | Eligible full/partial refund requests | Not Started |
| S16 | Hassan Adil | P1 | FR-08/09 | Approved dashboard/report/product performance | Not Started |
| S17 | Muhammad Faseeh | P1 | FR-11/13 | Refund approve/reject/external completion | Not Started |
| S18 | Muhammad Faseeh | P1 | FR-12 | Return inspection/resellability/stock disposition | Not Started |
| S19 | Nazakat Ali | P1 | FR-07 | Available/Low/expiry stock alerts | Not Started |
| S20 | Nazakat Ali | P1 | FR-10 | Explainable recommendation/threshold advice | Not Started |

## 9. Per-slice requirements

Before implementation, each slice must define relevant AC IDs, test scenarios, API/module interfaces, database ownership, UI states, error paths and EP/BVA cases.

## 10. Quality gates

- G1 readiness: relevant FR/AC/OQ/ADR context and dependencies resolved.
- G2 functional: positive and negative behavior passes.
- G3 architecture: ownership, authorization and transaction rules verified.
- G4 regression: affected module/integration suite passes.
- G5 final: end-to-end/NFR evidence for relevant requirements.

All actual test commands/results are Pending/Not Run. Human acceptance is required.

## 11. Plan version history

- v01: Initial approved implementation plan; 2026-11-26; no implementation progress.
- Subsequent numbered snapshot after each successfully integrated slice.



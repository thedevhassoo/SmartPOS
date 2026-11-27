# SmartPOS

Single-shop retail point of sale and inventory management system. The approved scope contains twenty assigned feature areas. This document records the staged publication payload, with actual Git history serving as integration evidence.

## Development setup (Windows PowerShell)

Install Node.js 22.16+ and PostgreSQL (a fresh database owned by the application user). Install Git for collaboration. There are two independent npm projects; do not run npm install at the repository root.

### Server terminal

```powershell
cd server
npm install
Copy-Item .env.example .env
```

Edit server/.env: set DATABASE_URL to your PostgreSQL credentials and database, choose a strong OWNER_PASSWORD, and optionally choose OWNER_USERNAME (default owner). Use a fresh database, not the old sample or prototype database. The first owner is created by migrations; no production default password or demo stock is seeded. Do not commit .env.

```powershell
npm run migrate
npm run dev
```

API: http://127.0.0.1:3000/api/health. Optional Docker database from repository root: `docker compose --env-file server/.env up -d postgres` with matching POSTGRES_PASSWORD and DATABASE_URL.

### Client terminal

```powershell
cd client
npm install
npm run dev
```

Open http://127.0.0.1:5173 and sign in with the configured owner credentials after S01 is integrated. Vite proxies API requests to the server. After S02 is integrated, the owner can create managers and cashiers. For production, run `npm run build` in client, then `npm start` in server, and open http://127.0.0.1:3000. See deployment.md for LAN and HTTPS.

## Verification commands

In server: `npm test` (dependency-free domain suite); `npm run typecheck`; `npm run test:api`; `npm run test:db` (requires TEST_DATABASE_URL pointing at a separately migrated disposable database). In client: `npm run typecheck`; `npm run build`; `npx playwright install chromium`; `npm run test:e2e` against a running disposable system, setting E2E_OWNER_PASSWORD and optionally E2E_URL. Never run fixtures against live data.

The standalone candidate passed 26 domain tests and a strict domain/projection typecheck. These are not live branch or full-stack test results. See slice evidence and the publication sequence. Lockfiles are created by successful npm install.

## Source layout

- client/: React, TypeScript, Vite, React Router, MUI, Tailwind, Lucide, Framer Motion, Axios, Recharts; independent package.json and tsconfig.json.
- client/src/features/: feature pages by business domain; client/src/components/ and ui.tsx provide shared presentation.
- server/: Express, TypeScript, PostgreSQL, Zod, csv-parse; independent package.json and tsconfig.json.
- server/modules/: feature routes and services grouped by domain; server/core/: shared domain policies, registry and transactional persistence.
- server/database/migrations/: versioned relational SQL schema.
- server/tests/: domain, API and DB tests. client/e2e/: browser test.
- slices/: scope, actual evidence and integration instructions for each slice.
- plan.md, plan-history/, testing.md, traceability.md: living plan, checks and evidence.

The approved design direction uses an orange and navy light retail interface, original components, accessible navigation, actual data and no unrelated features. Physical USB HID scanner support assumes keyboard emulation and Enter terminator; actual hardware must be checked.

## Integration

Use develop as integration branch. Member branches: feature-hassan, feature-nazakat, feature-sana, feature-faseeh. Integrate one eligible reviewed slice at a time; coordinator Hassan merges each complete overlay, including its master plan update, serially. See plan.md and the supplied publication order. No documentation updater or manual Markdown completion is required. Preserve actual Git and AI evidence. This is a shared ChatGPT-generated candidate; do not attribute its generation to individual members. Do not merge to main until genuine final validation and approval.

The reference-context directory contains older context copies for standalone reading, not a verified export of current develop. Do not overwrite live authoritative PRD, architecture, AGENTS or accepted ADR files with those older copies. Read supporting/implementation-contracts.md and ADR/ADR-010-relational-unit-of-work.md for actual implementation decisions and remaining differences.

Prepared for publication: 2026-11-27T15:39:55+05:00 (PKT). This is the package preparation time; Git records the actual publication and merge times.

The project requester confirms in the current conversation that the final integrated application is running and has been tested, and authorizes publication of the supplied source. This is an overall user-reported result and publication approval, not a record of twenty separate member reviews, individual test executions, or measured NFR outcomes.

At 2026-11-27T15:39:55+05:00 PKT, the shared ChatGPT environment ran `npm test` in server using Node.js v22.16.0: 26 passed, 0 failed, 0 skipped. Scope: domain tests, not PostgreSQL or browser execution. Original rebuild logs also document the strict domain typecheck.

No individual review history, physical scanner record, real PostgreSQL concurrency logs, LAN/backup results, measured NFR timings, or five-participant usability results were supplied. The prior generation environment could not install npm dependencies. The user reports a successful run in their environment; the detailed results were not provided. The shared relational projection and coarse transaction lock remain the documented ADR-010 architecture deviation.

## Publication sequence

This table describes the contents of the staged publication package, not completed remote Git operations. Git commit and merge history is the authoritative timestamp and integration evidence.

| Slice | Assigned publisher | Branch | Source handoff | Publication scope |
|---|---|---|---|---|
| S01 | Muhammad Sana Ullah | `feature-sana` | Domain test passed | Later publication stage |
| S02 | Muhammad Sana Ullah | `feature-sana` | Domain test passed | Later publication stage |
| S03 | Hassan Adil | `feature-hassan` | Domain test passed | Later publication stage |
| S04 | Muhammad Sana Ullah | `feature-sana` | Domain test passed | Later publication stage |
| S05 | Hassan Adil | `feature-hassan` | Domain test passed | Later publication stage |
| S06 | Hassan Adil | `feature-hassan` | Domain test passed | Later publication stage |
| S07 | Nazakat Ali | `feature-nazakat` | Domain test passed | Later publication stage |
| S08 | Nazakat Ali | `feature-nazakat` | Domain test passed | Later publication stage |
| S09 | Hassan Adil | `feature-hassan` | Domain test passed | Later publication stage |
| S10 | Muhammad Sana Ullah | `feature-sana` | Domain test passed | Later publication stage |
| S11 | Muhammad Faseeh | `feature-faseeh` | Domain test passed | Later publication stage |
| S12 | Muhammad Faseeh | `feature-faseeh` | Domain test passed | Later publication stage |
| S13 | Muhammad Sana Ullah | `feature-sana` | Domain test passed | Later publication stage |
| S14 | Nazakat Ali | `feature-nazakat` | Domain test passed | Later publication stage |
| S15 | Muhammad Faseeh | `feature-faseeh` | Domain test passed | Later publication stage |
| S17 | Muhammad Faseeh | `feature-faseeh` | Domain test passed | Later publication stage |
| S18 | Muhammad Faseeh | `feature-faseeh` | Domain test passed | Later publication stage |
| S16 | Hassan Adil | `feature-hassan` | Domain test passed | Later publication stage |
| S19 | Nazakat Ali | `feature-nazakat` | Domain test passed | Later publication stage |
| S20 | Nazakat Ali | `feature-nazakat` | Domain test passed | Later publication stage |
**Project status:** Stage 2 approved context and implementation planning complete; application source code has not been initialized.  
**Repository:** `thedevhassoo/SmartPOS`  
**Branch:** `develop`  
**Baseline:** `bf6ef4c2f209884871207be0cfcbb418ea623351`

## Overview

SmartPOS is an in-store POS and inventory system for one retail shop. It supports product lookup, checkout, inventory and expiry records, storage locations, CSV product import, scheduled store-wide offers, refunds and returns, role-controlled reporting and explainable AI recommendations.

Payment is handled outside the POS. The application records external payment checks and authoritative Completed Sales but does not integrate a payment gateway or process bank transfers.

## Approved scope

- Business Owner, Store Manager and Cashier roles.
- Barcode scan, manual barcode entry and product-name lookup.
- Draft Bills and atomic Paid Bill Push.
- Central inventory, batches and audited stock adjustments.
- Storage location management.
- Durable CSV product import.
- Store-wide scheduled offers.
- Refund and return workflows.
- Dashboard, reports, stock alerts and local explainable recommendations.
- Central LAN hosting for multiple authorized workstations.

## Architecture

The system uses a three-tier layered modular monolith:

1. Role-aware browser presentation.
2. Central Express/Node application API with cohesive business modules.
3. Central PostgreSQL persistence.

Module boundaries, module-owned repositories and controlled cross-module unit-of-work coordination are mandatory.

## Approved technology

- React, strict TypeScript, Vite and React Router.
- Tailwind CSS and Material UI.
- Lucide React and restrained Framer Motion.
- Axios and Recharts.
- Node.js LTS, Express.js and strict TypeScript.
- PostgreSQL and `node-postgres` (`pg`).
- Zod, `csv-parse`, Vitest, Supertest and Playwright.
- Git/GitHub, SQL migrations and environment-based configuration.

Actual package versions and Node LTS have not been selected because source initialization has not begun.

## Repository context

- `PRD.md`: authoritative product requirements.
- `architecture.md`: architectural design and boundaries.
- `AGENTS.md`: agent implementation constraints.
- `ADR/`: five accepted architecture decisions and ADR-006 technology decision to be added.
- `context-validation.md`: consolidated Stage 2 decisions.
- `decision-register.md`: approved specification register.
- `context-reviews/`: four engineer context reviews.
- `plan.md`: initial 20-slice implementation plan.
- `traceability.md`: requirement and slice coverage.
- `testing.md`: test strategy and verification status.
- `workflow-evidence-log.md` and `group-contribution-log.md`: evidence placeholders.
- `plan-history/plan-v01.md`: initial plan snapshot.

## Development workflow

Exactly 20 meaningful end-to-end vertical slices are allocated equally to:

- Muhammad Sana Ullah
- Hassan Adil
- Nazakat Ali
- Muhammad Faseeh

All slices are currently Not Started. Human review and Accept/Revise/Reject decisions are required before integration. No future implementation or test result is claimed in this README.

## Setup status

The application source tree and package manifests do not exist yet. Do not use README commands to claim that the application is runnable. Setup commands and endpoints will be added only after initialization and verified execution.

## Known operational verification items

- Actual LAN host/network and PostgreSQL deployment.
- Database backup and restoration verification.
- Host clock synchronization.
- USB HID scanner model, suffix and real-hardware tests.
- Five-concurrent-user POS benchmark.
- Usability testing with five representative participants.
- AI held-out historical-period evaluation.
- Production package versions and lockfile.

## Running and testing

**Pending initialization.** No package scripts or application entry points are available in the reviewed repository.

## Security and data

Do not commit secrets or real customer data. The server is the authorization, pricing, stock and persistence trust boundary. Browser role hiding is not authorization. Production PostgreSQL is not exposed to workstations.


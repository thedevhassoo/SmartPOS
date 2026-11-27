# SmartPOS

**Status:** Application implemented across 20 vertical slices; integrated application reported running and tested by the project requester. Release verification and Git integration evidence are recorded separately in the project documents and repository history.

SmartPOS (AI-Powered Smart POS and Inventory Management System) is a single-shop retail web application that combines point-of-sale operations, inventory management, sales reporting and explainable stock recommendations in one centrally hosted system. It is designed for multiple authorized workstations operating over a local area network (LAN).

> **Purpose of this README:** Give a new human developer or AI coding agent a quick orientation to the project and provide practical setup, testing and contribution instructions. Detailed requirements, acceptance criteria and technical decisions belong in the linked project documents rather than being duplicated here.

## Intended users and goals

- **Business Owner:** Manages staff accounts, oversees sales and inventory, reviews business performance and makes final purchasing decisions.
- **Store Manager:** Manages products, stock, locations, CSV imports and scheduled offers; reviews reports and approves authorized refund and return operations.
- **Cashier:** Looks up products, prepares Draft Bills, completes externally paid sales and submits eligible refund requests within assigned permissions.
- **Main goal:** Provide a reliable retail checkout workflow while keeping sales, stock movements and refunds consistent and traceable.
- **First release:** A usable, single-shop POS and inventory system with role-based access, centralized persistence and advisory, data-driven recommendations. Payment processing, supplier ordering, e-commerce, customer accounts, multi-branch operation and offline transaction completion are outside the approved release scope.

## Features (first release)

| Requirement | Feature overview |
| --- | --- |
| FR-01 | Authentication, three-role authorization and Owner-only staff administration. |
| FR-02 | Product registration, maintenance, barcode scanning, manual barcode entry and name lookup. |
| FR-03 | Draft Bill creation, quantity changes, price calculation and explicit saving without stock deduction. |
| FR-04 | Completion of externally paid sales, receipts and atomic stock deduction with retry protection. |
| FR-05 | Inventory visibility, stock reconciliation and authorized, audited adjustments. |
| FR-06 | Incoming stock batches, expiry dates and purchase costs. |
| FR-07 | Out-of-stock, low-stock and expiry alerts. |
| FR-08 | Sales dashboard and reports based on recorded transactions. |
| FR-09 | Product performance, sales trends and recorded profitability analysis. |
| FR-10 | Explainable local recommendations and advisory stock-threshold suggestions. |
| FR-11 | Eligible full and partial refund requests, approval, rejection and external refund confirmation. |
| FR-12 | Returned-product inspection, resellability decisions and controlled restocking. |
| FR-13 | Transaction history and sensitive-action audit records. |
| FR-14 | CSV product import with validation, preview, duplicate resolution, confirmation and retry. |
| FR-15 | Storage location management, assignment, filtering and safe deletion. |
| FR-16 | Scheduled store-wide offers, overlap prevention and server-authoritative price calculation. |

These are feature summaries, not substitutes for `PRD.md`, its business rules or its acceptance criteria. The physical USB HID barcode scanner workflow uses keyboard emulation and preserves barcode strings, including leading zeros. Manual entry remains available. Recommendations are advisory and do not automatically place orders or change stock.

## Technology stack

| Layer | Technology |
| --- | --- |
| Frontend | React 19, strict TypeScript, Vite and React Router |
| UI and styling | Material UI, Tailwind CSS, Lucide React and Framer Motion |
| HTTP and visualization | Axios and Recharts |
| Backend | Node.js 22.16+ and Express 5, with strict TypeScript and tsx |
| Database | PostgreSQL, node-postgres (`pg`) and version-controlled SQL migrations |
| Validation and security | Zod, bcryptjs and server-side authorization |
| CSV processing | csv-parse |
| Testing | Node.js test runner for domain tests; Vitest, Supertest and Playwright for API, database and browser checks |
| Version control | Git and GitHub |
| Deployment | Central Node.js and PostgreSQL host, browser clients over LAN; optional Docker Compose for local PostgreSQL |

Dependency manifests in `client/package.json` and `server/package.json` define the actual package versions and supported commands. The architecture and ADRs are the authoritative sources for technical decisions.

## Architecture overview

SmartPOS follows a three-tier client-server architecture with a layered modular monolith on the backend:

```text
Browser workstation (React UI)
            |
            | HTTP / JSON API
            v
Express application (routes, authorization, domain services)
            |
            | Transactional persistence through pg
            v
Central PostgreSQL database
```

This structure separates presentation, business rules and persistence while avoiding the operational complexity of distributed microservices for a single shop. The server enforces permissions, authoritative prices and transaction rules. Browser clients never connect directly to PostgreSQL.

The implementation uses relational tables and a conservative shared transactional unit of work to coordinate stock, sales, refunds and retry protection. The shared state projection and coarse lock differ from the original fine-grained module-owned repository design; see `ADR/ADR-010-relational-unit-of-work.md` for the proposed implementation decision, trade-offs and verification requirements.

The UI uses an original orange-and-navy light retail design, with a collapsible sidebar, consistent components, role-specific navigation and real recorded business data. The external visual reference is used for design inspiration only, not for product scope or data.

## Project context

Before working on the application, review the current repository documents:

| File or directory | Purpose |
| --- | --- |
| `PRD.md` | Product objectives, scope, functional and non-functional requirements, business rules and acceptance criteria. |
| `architecture.md` | Architectural style, component boundaries, responsibilities and interactions. |
| `AGENTS.md` | Rules, constraints and permitted behavior for AI coding agents. |
| `ADR/` | Architectural decisions, alternatives, consequences and decision status. |
| `decision-register.md` | Resolved and outstanding business and technical decisions. |
| `context-validation.md` | Findings from consolidated project-context validation. |
| `plan.md` | Current implementation sequence, vertical slices, ownership, dependencies and progress. |
| `plan-history/` | Historical numbered plan snapshots retained as the plan evolves. |
| `supporting/` | API contracts, data model, UI and scanner designs, and implementation-specific guidance. |
| `guidelines/` | Shared development workflow, visual design and barcode scanner requirements. |
| `testing.md` | Test scenarios, quality gates and verification strategy. |
| `traceability.md` | Mapping between requirements, acceptance criteria and implementation slices. |
| `slices/` | Slice-specific scope, evidence and integration notes. |
| `workflow-evidence-log.md` | AI-assisted development, testing, review and integration evidence. |
| `group-contribution-log.md` | Assigned responsibilities and recorded individual contributions. |
| `implementation-status.md` | Source coverage, verified results and remaining limitations. |
| `deployment.md` | LAN configuration, production execution, backup and restoration guidance. |
| `verification/` | Available test execution and typecheck logs. |
| `final-project-report.md` | Final product and engineering assessment, including CCP analysis. |
| `submission-checklist.md` | Final artefact and verification checklist. |

Use the latest authoritative files in the repository. If a standalone distribution includes `reference-context/`, those older copies are for reference and must not overwrite newer approved documents.

## Repository structure

```text
SmartPOS/
|-- client/
|   |-- package.json
|   |-- tsconfig.json
|   |-- vite.config.ts
|   |-- src/
|   |   |-- components/
|   |   |-- features/
|   |   |-- api.ts
|   |   |-- main.tsx
|   |   |-- ui.tsx
|   |   `-- style.css
|   `-- e2e/
|-- server/
|   |-- package.json
|   |-- tsconfig.json
|   |-- .env.example
|   |-- index.ts
|   |-- app.ts
|   |-- migrate.ts
|   |-- core/
|   |-- modules/
|   |-- database/migrations/
|   `-- tests/
|-- ADR/
|-- guidelines/
|-- supporting/
|-- slices/
|-- plan-history/
|-- verification/
|-- compose.yaml
|-- PRD.md
|-- architecture.md
|-- AGENTS.md
|-- plan.md
|-- testing.md
|-- traceability.md
|-- deployment.md
`-- README.md
```

The tree highlights major directories rather than listing every file. Frontend feature pages and backend modules are organized by business domain (identity, catalog, inventory, locations, CSV import, billing, offers, refunds, reporting and insights). The client and server are independent npm projects; there is no requirement to install dependencies from the repository root.

## Local setup and run instructions

### Prerequisites

- Node.js 22.16 or later, with npm.
- PostgreSQL and a fresh database owned by the application database user.
- Git for version control.
- A modern web browser and, optionally, a USB HID barcode scanner.
- Docker Compose only if using the optional database container.

### 1. Install and configure the server

Open PowerShell in the repository root:

```powershell
cd server
npm install
Copy-Item .env.example .env
```

Create a fresh PostgreSQL database named `smartpos` and configure `server/.env` with your actual database username and password. For example:

```dotenv
DATABASE_URL=postgresql://smartpos:CHANGE_ME@127.0.0.1:5432/smartpos
OWNER_USERNAME=owner
OWNER_PASSWORD=CHANGE_ME_TO_A_STRONG_PASSWORD
PORT=3000
HOST=127.0.0.1
COOKIE_SECURE=false
```

Replace all example credentials. Never commit `.env`. The first owner is created by the migration process; the application does not seed a production default password or demo stock. Use a fresh database, not the old prototype database.

From the server directory:

```powershell
npm run migrate
npm run dev
```

Health endpoint: <http://127.0.0.1:3000/api/health>.

Alternatively, with a matching `POSTGRES_PASSWORD` and `DATABASE_URL` in `server/.env`, run the optional PostgreSQL container from the repository root before migrating:

```powershell
docker compose --env-file server/.env up -d postgres
```

### 2. Install and run the client

Open a second PowerShell terminal in the repository root:

```powershell
cd client
npm install
npm run dev
```

Open <http://127.0.0.1:5173> and sign in with the configured Owner credentials. The Owner can create Store Manager and Cashier accounts. Vite proxies API requests to the backend. Keep both development terminals running.

### 3. Run tests and build

From `server/`:

```powershell
npm test
npm run typecheck
npm run test:api
npm run test:db
```

`test:db` requires `TEST_DATABASE_URL` pointing to a separately migrated, disposable PostgreSQL database. Do not run test fixtures against business data.

From `client/`:

```powershell
npm run typecheck
npm run build
npx playwright install chromium
npm run test:e2e
```

Browser tests require a running disposable application with `E2E_OWNER_PASSWORD` and optionally `E2E_URL` configured. See `testing.md` for functional, negative, equivalence partitioning, boundary value and integration checks. Dependency lockfiles should be retained after successful installation and review.

### 4. Production build and LAN deployment

Run `npm run build` in `client/`, then from `server/`:

```powershell
$env:NODE_ENV = "production"
npm start
```

The server serves the built frontend and API at <http://127.0.0.1:3000>. For actual LAN deployment, configure the central host and HTTPS reverse proxy, enable secure cookies, restrict network access and keep PostgreSQL inaccessible to workstations. See `deployment.md` for host configuration, backups and restoration. Offline billing is not supported.

## Working with an AI coding agent

1. Load `AGENTS.md`, `PRD.md`, `architecture.md`, relevant ADRs and the latest `plan.md` from the repository.
2. Select one eligible vertical slice, check its dependencies, acceptance criteria and assigned engineer.
3. Resolve consequential ambiguities before implementation; generate supporting designs only when useful.
4. Use bounded AFK (delegated) execution for routine coding, testing and correction; use human-in-the-loop review for material decisions and acceptance.
5. Implement the user-visible capability across the necessary layers while preserving architecture, security and requirement traceability.
6. Run relevant tests, record actual results, and integrate only after genuine review and acceptance.
7. Update `plan.md`, the next numbered plan snapshot, evidence logs, traceability and this README when appropriate. Preserve previous snapshots and Git history.

Git and AI records should accurately distinguish shared AI-generated source, individual engineering work, reviews and actual integration. Do not invent test results, acceptance decisions or historical timestamps.

## Team and contribution workflow

Hassan Adil is the repository coordinator. Each engineer uses the assigned feature branch, synchronizes with `develop` before publishing the next eligible slice and preserves actual review and contribution evidence.

| Engineer | Feature branch | Assigned slices |
| --- | --- | --- |
| Hassan Adil | `feature-hassan` | S03, S05, S06, S09, S16 |
| Nazakat Ali | `feature-nazakat` | S07, S08, S14, S19, S20 |
| Muhammad Sana Ullah | `feature-sana` | S01, S02, S04, S10, S13 |
| Muhammad Faseeh | `feature-faseeh` | S11, S12, S15, S17, S18 |

The integration branch is `develop`; `main` is the release branch. Merge accepted slices serially in dependency order. The supplied publication sequence is S01 through S15, then S17, S18, S16, S19 and S20. Reporting follows refund and return operations because it depends on their recorded effects. Consult `plan.md` for the authoritative dependency graph and current status.

The staged package contains one cumulative documentation update per slice. Integrate these with the corresponding slice rather than publishing all future plan snapshots at once. Never overwrite earlier numbered snapshots. Merge `develop` into `main` only after final release verification.

## Verification status and known limitations

- Source for all 20 assigned feature areas is included in the integrated application and staged handoff.
- The shared generation environment ran 26 domain tests with zero failures on Node.js v22.16.0 on 27 November 2026. Strict domain and relational projection typechecks also passed. See `verification/` for the actual logs.
- The project requester reports that the integrated application runs and has been tested locally and authorizes publication. Detailed local test logs and individual slice acceptance records were not supplied with this README.
- The generation environment could not install external npm dependencies. Its results do not certify the full-stack build, real PostgreSQL integration, browser tests, physical scanner operation, LAN deployment, backup/restore, measured response times or participant usability tests.
- The shared state projection and coarse transaction lock are documented in ADR-010 as a proposed implementation deviation. Database concurrency, throughput and module-boundary review remain important for release verification.

The original publication README's evidence and scope are retained here in consolidated form. The authoritative implementation and remote integration status is determined by `implementation-status.md`, the test evidence and actual Git history, not by the contents of a staged ZIP.

## Current next step

Maintain the integrated application and complete any remaining release checks against the approved requirements and quality gates. Record actual results and integrate the reviewed release into `main` when ready. For subsequent development, select the next approved change from the living plan rather than recreating the project context.

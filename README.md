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
| S01 | Muhammad Sana Ullah | `feature-sana` | Domain test passed | Included through this stage |
| S02 | Muhammad Sana Ullah | `feature-sana` | Domain test passed | Included through this stage |
| S03 | Hassan Adil | `feature-hassan` | Domain test passed | Included through this stage |
| S04 | Muhammad Sana Ullah | `feature-sana` | Domain test passed | Included through this stage |
| S05 | Hassan Adil | `feature-hassan` | Domain test passed | Included through this stage |
| S06 | Hassan Adil | `feature-hassan` | Domain test passed | Included through this stage |
| S07 | Nazakat Ali | `feature-nazakat` | Domain test passed | Included through this stage |
| S08 | Nazakat Ali | `feature-nazakat` | Domain test passed | Included through this stage |
| S09 | Hassan Adil | `feature-hassan` | Domain test passed | Included through this stage |
| S10 | Muhammad Sana Ullah | `feature-sana` | Domain test passed | Included through this stage |
| S11 | Muhammad Faseeh | `feature-faseeh` | Domain test passed | Included through this stage |
| S12 | Muhammad Faseeh | `feature-faseeh` | Domain test passed | Included through this stage |
| S13 | Muhammad Sana Ullah | `feature-sana` | Domain test passed | Included through this stage |
| S14 | Nazakat Ali | `feature-nazakat` | Domain test passed | Included through this stage |
| S15 | Muhammad Faseeh | `feature-faseeh` | Domain test passed | Included through this stage |
| S17 | Muhammad Faseeh | `feature-faseeh` | Domain test passed | Included through this stage |
| S18 | Muhammad Faseeh | `feature-faseeh` | Domain test passed | Included through this stage |
| S16 | Hassan Adil | `feature-hassan` | Domain test passed | Included through this stage |
| S19 | Nazakat Ali | `feature-nazakat` | Domain test passed | Later publication stage |
| S20 | Nazakat Ali | `feature-nazakat` | Domain test passed | Later publication stage |

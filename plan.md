# SmartPOS - Final implementation planning baseline

**Plan version:** v21
**Prepared for publication:** 2026-11-27T15:39:55+05:00 (PKT)
**Coordinator:** Hassan Adil  
**Plan approval:** Approved by the project requester for staged publication.
**Implementation status:** All 20 source areas generated; 18/20 in this cumulative publication stage. Integrated application running and tested, as reported by the requester. Remote integration is evidenced by Git.
**Source:** `develop` plan v01 (its recorded baseline `ae19db3b5c6d10d24b6dd0586a73dd78052854eb`), PRD v3.1, accepted ADR-006 and Stage 2 decision register. Verify current HEAD at integration; this is not a claim that the baseline hash is current HEAD.

## 1. Objective and boundaries

Deliver an integrated single-shop, centrally hosted LAN POS using the approved sixteen functional and four non-functional requirements. Preserve three roles, external payment verification, no offline synchronization, no customer/supplier/e-commerce or payment-gateway scope, and advisory local insights. PRD.md, architecture.md, AGENTS.md, ADR/, decision-register.md and relevant supporting/ documents govern the implementation. Read only relevant context for each slice. The design reference is visual only: DreamsPOS-inspired orange (#FE9F43), navy (#092C4C), light workspace (#F8F9FA), white surfaces, compact sidebar/header, restrained motion, accessible MUI and Lucide components. No reference data, menus or functionality.

## 2. Approved stack and enabling work (not a slice)

React + strict TypeScript + Vite + React Router + Tailwind + MUI + Lucide React + Framer Motion + Axios + Recharts; Node.js LTS + Express + strict TypeScript; PostgreSQL + pg + SQL migrations; Zod, csv-parse, Vitest, Supertest, Playwright. ADR-006 is accepted. Use the existing client/server layout and module-owned repositories. One central server; browser clients never connect directly to the database. Select and record actual compatible package versions at initialization. At 2026-11-27T15:39:55+05:00 PKT, the shared ChatGPT environment ran `npm test` in server using Node.js v22.16.0: 26 passed, 0 failed, 0 skipped. Scope: domain tests, not PostgreSQL or browser execution. Original rebuild logs also document the strict domain typecheck.

Foundation and all feature source are available in the handoff. Publish the foundation first, then the slices in the prescribed order. Preserve existing requirements and Git history.

## 3. Branches, ownership and integration

Four long-lived developer branches: `feature-hassan`, `feature-nazakat`, `feature-sana`, `feature-faseeh`. Each member uses own Git identity. The shared source was prepared in ChatGPT; personal development sessions are not attributed without evidence. Start one slice at a time in the branch, sync accepted develop changes before beginning, do not reset or force-push. Use feature branch source changes in canonical module paths; `slices/` is for task/evidence files, not duplicate deployable applications. The supplied plan and logs are included in each serial publication commit. Hassan merges each slice into develop before the next member copies their overlay. After G5 and release acceptance, merge develop into main. If a feature branch has unaccepted changes, do not merge the whole branch; isolate the accepted commits with a dedicated integration branch or postpone merge until branch contains only accepted work. Preserve original author attribution.

## 4. Twenty-slice backlog

P0 = critical foundation/checkout; P1 = other required scope (not optional). Dependencies below must be accepted and integrated; actual source/contracts are checked at G1.

| Slice | Engineer | Branch | Priority | Requirements | Prerequisites | Status |
|---|---|---|---|---|---|---|
| S01 - Sign in and enforce role access | Muhammad Sana Ullah | `feature-sana` | P0 | FR-01, FR-08, FR-10 | Verified initialization | Source included |
| S02 - Owner manages staff accounts and resets passwords | Muhammad Sana Ullah | `feature-sana` | P1 | FR-01 | S01 | Source included |
| S03 - Register, update and find products | Hassan Adil | `feature-hassan` | P0 | FR-02, FR-13 | S01 | Source included |
| S04 - Receive stock batches and inspect expiry and costs | Muhammad Sana Ullah | `feature-sana` | P1 | FR-05, FR-06 | S03 | Source included |
| S05 - Create, rename and assign storage locations | Hassan Adil | `feature-hassan` | P1 | FR-15 | S03 | Source included |
| S06 - Filter products and safely delete locations | Hassan Adil | `feature-hassan` | P1 | FR-15 | S05 | Source included |
| S07 - Upload CSV and inspect a validation preview | Nazakat Ali | `feature-nazakat` | P1 | FR-14 | S03, S05 | Source included |
| S08 - Resolve CSV duplicates and Replace/Skip decisions | Nazakat Ali | `feature-nazakat` | P1 | FR-14 | S07 | Source included |
| S09 - Prepare, recalculate and explicitly save Draft Bills | Hassan Adil | `feature-hassan` | P0 | FR-02, FR-03, FR-04, FR-15 | S03, S05 | Source included |
| S10 - Reconcile stock discrepancies and audit adjustments | Muhammad Sana Ullah | `feature-sana` | P1 | FR-05, FR-13 | S04 | Source included |
| S11 - Create, edit and cancel scheduled store-wide offers | Muhammad Faseeh | `feature-faseeh` | P1 | FR-13, FR-16 | S01 | Source included |
| S12 - Apply current offers to Draft Bill totals | Muhammad Faseeh | `feature-faseeh` | P0 | FR-03, FR-16 | S09, S11 | Source included |
| S13 - Push paid bills atomically and view receipt/history | Muhammad Sana Ullah | `feature-sana` | P0 | FR-03, FR-04, FR-13, FR-16 | S04, S09, S10, S12 | Source included |
| S14 - Confirm CSV import, retry failed rows and view outcomes | Nazakat Ali | `feature-nazakat` | P1 | FR-14 | S06, S08, S10, S13 | Source included |
| S15 - Submit eligible full or partial refund requests | Muhammad Faseeh | `feature-faseeh` | P1 | FR-11, FR-13 | S13 | Source included |
| S16 - View sales dashboard and product performance | Hassan Adil | `feature-hassan` | P1 | FR-08, FR-09 | S13, S17, S18 | Source included |
| S17 - Approve, reject and record externally completed refunds | Muhammad Faseeh | `feature-faseeh` | P1 | FR-08, FR-11, FR-13 | S15 | Source included |
| S18 - Inspect returns and decide stock disposition | Muhammad Faseeh | `feature-faseeh` | P1 | FR-09, FR-12, FR-13 | S04, S15, S17 | Source included |
| S19 - Monitor stock, low-stock and expiry alerts | Nazakat Ali | `feature-nazakat` | P1 | FR-07 | S04, S10, S13, S18 | Source ready for later publication |
| S20 - View explained AI recommendations and threshold suggestions | Nazakat Ali | `feature-nazakat` | P1 | FR-07, FR-10 | S16, S19 | Source ready for later publication |

## 5. Execution order

Serial integration order: S01 -> S02 -> S03 -> S04 -> S05 -> S06 -> S07 -> S08 -> S09 -> S10 -> S11 -> S12 -> S13 -> S14 -> S15 -> S17 -> S18 -> S16 -> S19 -> S20. S17 and S18 precede S16 because reporting depends on completed refund and disposition facts; S17 does not require the reporting UI.

| Wave | Hassan | Nazakat | Sana | Faseeh |
|---|---|---|---|---|
| 1 | - | - | S01 | - |
| 2 | S03 | - | S02 | S11 |
| 3 | S05 | - | S04 | - |
| 4 | S09 | S07 | S10 | - |
| 5 | S06 | S08 | - | S12 |
| 6 | - | - | S13 | - |
| 7 | - | S14 | - | S15 |
| 8 | - | - | - | S17 |
| 9 | - | - | - | S18 |
| 10 | S16 | S19 | - | - |
| 11 | - | S20 | - | - |

Waves are advisory; begin when all actual dependencies are integrated, not simply when a calendar time passes. Serialize merges and shared migration changes.

## 6. Detailed slice contracts

All mapped criteria retain original IDs. A shared criterion is checked locally where relevant and finally against the integrated flow. NFR verification is cross-cutting; detailed measured results were not supplied. All tasks default to bounded AFK; human acceptance is mandatory.

### S01 - Sign in and enforce role access

**Owner:** Muhammad Sana Ullah | **Branch:** `feature-sana` | **Priority:** P0 | **Prerequisites:** Verified initialization  
**FRs:** FR-01, FR-08, FR-10 | **NFRs:** NFR-03; NFR-04 (final)  
**Task folder:** `slices/S01_MuhammadSanaUllah/` | **Status:** Source included
**Mode:** Bounded AFK; stop on critical contradiction or unresolved security/financial decision.  
**Scope / user outcome:** Login for all three roles, server session, explicit logout, role-aware home/navigation; server authorization guard denies protected reads and commands as each route is added. No automatic idle logout. Use persistent PostgreSQL-backed sessions, Argon2id or bcrypt, server-owned permissions, HTTP-only cookies, CSRF protection, rate limiting, session invalidation and no mandatory inactivity logout. Implement the minimal audit append interface when first required; defer the full history UI to S13. Test role denial through actual endpoints as they become available.

**Acceptance-criterion IDs:** AC-FR-01-01, AC-FR-01-02, AC-FR-01-03, AC-FR-01-05, AC-FR-01-06, AC-FR-08-02, AC-FR-10-05.

**Checks:** F: valid credentials for each role; N/EP: unknown user, wrong password, unauthenticated and Cashier direct protected request; verify idle does not auto-lock; regress authorization on every later slice.; test session invalidation, CSRF and login throttling.

**Evidence:** Shared domain test passed; overall application testing and publication approval reported by requester. Individual gate results and merge history are not asserted. See slice EVIDENCE.md and Git history.

### S02 - Owner manages staff accounts and resets passwords

**Owner:** Muhammad Sana Ullah | **Branch:** `feature-sana` | **Priority:** P1 | **Prerequisites:** S01  
**FRs:** FR-01 | **NFRs:** NFR-03; NFR-04 (final)  
**Task folder:** `slices/S02_MuhammadSanaUllah/` | **Status:** Source included
**Mode:** Bounded AFK; stop on critical contradiction or unresolved security/financial decision.  
**Scope / user outcome:** Owner creates and manages accounts and resets passwords; roles are constrained to the three defined roles. Store Manager and Cashier cannot administer users. Deactivate accounts and invalidate sessions on reset/deactivation. Never expose password hashes; use an environment-controlled bootstrap for the first Owner, not a committed password.

**Acceptance-criterion IDs:** AC-FR-01-04.

**Checks:** F: create staff account and sign in; N: Manager/Cashier direct create/reset rejected, duplicate username rejected; after reset old password fails; regression login.

**Evidence:** Shared domain test passed; overall application testing and publication approval reported by requester. Individual gate results and merge history are not asserted. See slice EVIDENCE.md and Git history.

### S03 - Register, update and find products

**Owner:** Hassan Adil | **Branch:** `feature-hassan` | **Priority:** P0 | **Prerequisites:** S01  
**FRs:** FR-02, FR-13 | **NFRs:** NFR-03; NFR-04 (final); NFR-01  
**Task folder:** `slices/S03_HassanAdil/` | **Status:** Source included
**Mode:** Bounded AFK; stop on critical contradiction or unresolved security/financial decision.  
**Scope / user outcome:** Owner/Manager product form and catalog; unique string Barcode, name, selling price, category for manual registration. Checkout barcode keyboard entry/scan and name fallback for all roles; no unsupported record creation; audit price edits. Use opaque string barcodes (including leading zeros), USB HID keyboard input + Enter and the same lookup path for manual input/name fallback; no automatic product creation. Manual registration requires category; imported products may be Uncategorized. Price-change audit must commit with the change.

**Acceptance-criterion IDs:** AC-FR-02-01, AC-FR-02-02, AC-FR-02-03, AC-FR-02-04, AC-FR-02-05, AC-FR-02-06, AC-FR-13-04.

**Checks:** F: create and find by scan/manual/name, edit price with audit; N/EP: duplicate barcode, blank required fields, invalid price, unknown barcode/name, Cashier edit denied; leading-zero barcode retained.; actual HID verification recorded separately when hardware is available.

**Evidence:** Shared domain test passed; overall application testing and publication approval reported by requester. Individual gate results and merge history are not asserted. See slice EVIDENCE.md and Git history.

### S04 - Receive stock batches and inspect expiry and costs

**Owner:** Muhammad Sana Ullah | **Branch:** `feature-sana` | **Priority:** P1 | **Prerequisites:** S03  
**FRs:** FR-05, FR-06 | **NFRs:** NFR-03; NFR-04 (final); NFR-02  
**Task folder:** `slices/S04_MuhammadSanaUllah/` | **Status:** Source included
**Mode:** Bounded AFK; stop on critical contradiction or unresolved security/financial decision.  
**Scope / user outcome:** Owner/Manager enters incoming Product Batch quantity, expiry and purchase cost; Inventory owns stock changes; show batch-specific quantities/dates/cost and Recorded Stock. Cashier cannot alter expiry. Use the approved Recorded/Available Stock distinction. Positive integer batch quantity, exact PKR cost, valid expiry or explicit non-expiring status; expired items are not sellable. Ensure deterministic FEFO allocation is available to S13; capture actual batch cost.

**Acceptance-criterion IDs:** AC-FR-05-01, AC-FR-06-01, AC-FR-06-02, AC-FR-06-03, AC-FR-06-04, AC-FR-06-06, AC-FR-06-05.

**Checks:** F: receive two batches with distinct dates/costs; verify quantities/cost persist and stock total; N/EP: invalid quantity/date/cost, Cashier denied; BVA: quantity 0 and 1; rollback on injected receipt failure.

**Evidence:** Shared domain test passed; overall application testing and publication approval reported by requester. Individual gate results and merge history are not asserted. See slice EVIDENCE.md and Git history.

### S05 - Create, rename and assign storage locations

**Owner:** Hassan Adil | **Branch:** `feature-hassan` | **Priority:** P1 | **Prerequisites:** S03  
**FRs:** FR-15 | **NFRs:** NFR-03; NFR-04 (final)  
**Task folder:** `slices/S05_HassanAdil/` | **Status:** Source included
**Mode:** Bounded AFK; stop on critical contradiction or unresolved security/financial decision.  
**Scope / user outcome:** Owner/Manager creates or renames normalized locations and assigns/replaces one current location; authorized lookup including Cashier shows location or Unassigned. Catalog alone changes product reference. Canonical normalized location, one assignment or Unassigned; only Catalog writes product references through its own public service. Audit only as required by PRD.

**Acceptance-criterion IDs:** AC-FR-15-01, AC-FR-15-02, AC-FR-15-03, AC-FR-15-04, AC-FR-15-05, AC-FR-15-12.

**Checks:** F: create A/B, assign and move product, rename and see current value in lookup; EP: case/format variants reuse identity, spelling difference distinct; N: Cashier mutation denied; stock/price unchanged.

**Evidence:** Shared domain test passed; overall application testing and publication approval reported by requester. Individual gate results and merge history are not asserted. See slice EVIDENCE.md and Git history.

### S06 - Filter products and safely delete locations

**Owner:** Hassan Adil | **Branch:** `feature-hassan` | **Priority:** P1 | **Prerequisites:** S05  
**FRs:** FR-15 | **NFRs:** NFR-03; NFR-04 (final); NFR-02  
**Task folder:** `slices/S06_HassanAdil/` | **Status:** Source included
**Mode:** Bounded AFK; stop on critical contradiction or unresolved security/financial decision.  
**Scope / user outcome:** Owner/Manager filters by current location and deletes with warning/confirmation; unassign products atomically and clear affected active filter; no replacement or product deletion. Use shared UoW; warning and confirmation precede atomic delete/unassign; no replacement assignment or stock mutation.

**Acceptance-criterion IDs:** AC-FR-15-06, AC-FR-15-07, AC-FR-15-08, AC-FR-15-09, AC-FR-15-10, AC-FR-15-11.

**Checks:** F: filter A, cancel deletion, confirm deletion with two products; N: Cashier direct filter/delete denied, deleted ID cannot be assigned; transaction failure rolls back both effects; regress lookup.

**Evidence:** Shared domain test passed; overall application testing and publication approval reported by requester. Individual gate results and merge history are not asserted. See slice EVIDENCE.md and Git history.

### S07 - Upload CSV and inspect a validation preview

**Owner:** Nazakat Ali | **Branch:** `feature-nazakat` | **Priority:** P1 | **Prerequisites:** S03, S05  
**FRs:** FR-14 | **NFRs:** NFR-03; NFR-04 (final)  
**Task folder:** `slices/S07_NazakatAli/` | **Status:** Source included
**Mode:** Bounded AFK; stop on critical contradiction or unresolved security/financial decision.  
**Scope / user outcome:** Owner/Manager uploads CSV, sees invalid-row reasons and duplicate groups, staged valid rows and preliminary preview. No product/location writes. Existing match classification is finalized only after S08 duplicate resolution. Exact ordered UTF-8 four-column header, optional BOM; preserve strings. Configurable 5 MB/10,000-data-row initial import limit per DR-39; applies to import workload, not total catalog size. Preview has no product/location writes.

**Acceptance-criterion IDs:** AC-FR-14-01, AC-FR-14-02, AC-FR-14-03, AC-FR-14-04, AC-FR-14-06, AC-FR-14-13, AC-FR-14-15.

**Checks:** F: valid file, mixed rows, duplicate groups and cancel; N/EP: XLSX, missing/extra/reordered headers, missing mandatory field, malformed price; Cashier upload denied; product/location counts unchanged.

**Evidence:** Shared domain test passed; overall application testing and publication approval reported by requester. Individual gate results and merge history are not asserted. See slice EVIDENCE.md and Git history.

### S08 - Resolve CSV duplicates and Replace/Skip decisions

**Owner:** Nazakat Ali | **Branch:** `feature-nazakat` | **Priority:** P1 | **Prerequisites:** S07  
**FRs:** FR-14 | **NFRs:** NFR-03; NFR-04 (final)  
**Task folder:** `slices/S08_NazakatAli/` | **Status:** Source included
**Mode:** Bounded AFK; stop on critical contradiction or unresolved security/financial decision.  
**Scope / user outcome:** Choose one retained row per duplicate group, then match retained rows to existing barcodes, set Replace/Skip; persist staged choices and complete preview; confirmation eligibility visible but no commit until S14. Resolve within-file duplicates first; only retained rows are matched with existing products. Persist explicit Replace/Skip decisions and detect stale versions; no business writes before S14.

**Acceptance-criterion IDs:** AC-FR-14-06, AC-FR-14-07, AC-FR-14-13, AC-FR-14-14.

**Checks:** F: duplicate existing barcode, choose second row, then Replace/Skip; N: invalid retained row, stale version, unresolved decisions block confirmation, Cashier decision denied; no catalog/location mutation.

**Evidence:** Shared domain test passed; overall application testing and publication approval reported by requester. Individual gate results and merge history are not asserted. See slice EVIDENCE.md and Git history.

### S09 - Prepare, recalculate and explicitly save Draft Bills

**Owner:** Hassan Adil | **Branch:** `feature-hassan` | **Priority:** P0 | **Prerequisites:** S03, S05  
**FRs:** FR-02, FR-03, FR-04, FR-15 | **NFRs:** NFR-03; NFR-04 (final); NFR-01  
**Task folder:** `slices/S09_HassanAdil/` | **Status:** Source included
**Mode:** Bounded AFK; stop on critical contradiction or unresolved security/financial decision.  
**Scope / user outcome:** Checkout users add/remove products and positive quantities, view price and subtotal, explicitly Save; unsaved draft is not persisted; no manual Cashier discount or stock reservation. S12 adds current offers and S13 Push. Dedicated HID scan field + Enter, repeated intentional scans increment quantity, prevent duplicate handling of one terminator, respect dialog focus, fallback to manual and name search. Explicit Save only; no stock reservation or deduction. S12 integrates offers, S13 finalizes sales. Never report a simulated scan as hardware verification.

**Acceptance-criterion IDs:** AC-FR-02-01, AC-FR-02-02, AC-FR-02-03, AC-FR-02-04, AC-FR-03-01, AC-FR-03-02, AC-FR-03-03, AC-FR-03-04, AC-FR-03-06, AC-FR-04-03, AC-FR-04-04, AC-FR-15-02.

**Checks:** F: add/remove/revise quantity, totals, Save and retrieve saved state under approved policy; N/EP: zero/negative quantity, unknown product, unauthorized discount; crash before Save loses draft; stock and sale count unchanged.; rapid repeated scans, one Enter event, dialog focus, unplug/manual fallback; physical test separately.

**Evidence:** Shared domain test passed; overall application testing and publication approval reported by requester. Individual gate results and merge history are not asserted. See slice EVIDENCE.md and Git history.

### S10 - Reconcile stock discrepancies and audit adjustments

**Owner:** Muhammad Sana Ullah | **Branch:** `feature-sana` | **Priority:** P1 | **Prerequisites:** S04  
**FRs:** FR-05, FR-13 | **NFRs:** NFR-03; NFR-04 (final); NFR-02  
**Task folder:** `slices/S10_MuhammadSanaUllah/` | **Status:** Source included
**Mode:** Bounded AFK; stop on critical contradiction or unresolved security/financial decision.  
**Scope / user outcome:** Owner/Manager compares Recorded Stock with entered physical count, confirms chosen adjustment with reason; Inventory updates under shared transaction with audit; no auto-correction. Use atomic audited adjustments, positive/zero permitted balances, reject negative or stale conflicting updates. Record actor, reason, previous/new values, timestamp. Never auto-correct discrepancies.

**Acceptance-criterion IDs:** AC-FR-05-02, AC-FR-05-03, AC-FR-05-04, AC-FR-05-05, AC-FR-13-04.

**Checks:** F: discrepancy shown and confirmed adjustment with old/new audit values; N: Cashier denied, negative result rejected, stale adjustment conflict; BVA: resulting stock 0 vs -1; cancel leaves data unchanged.

**Evidence:** Shared domain test passed; overall application testing and publication approval reported by requester. Individual gate results and merge history are not asserted. See slice EVIDENCE.md and Git history.

### S11 - Create, edit and cancel scheduled store-wide offers

**Owner:** Muhammad Faseeh | **Branch:** `feature-faseeh` | **Priority:** P1 | **Prerequisites:** S01  
**FRs:** FR-13, FR-16 | **NFRs:** NFR-03; NFR-04 (final); NFR-02  
**Task folder:** `slices/S11_MuhammadFaseeh/` | **Status:** Source included
**Mode:** Bounded AFK; stop on critical contradiction or unresolved security/financial decision.  
**Scope / user outcome:** Owner/Manager offers screen with percentage/fixed amount, PKT schedule, overlap-safe writes, active edits and cancellation, status derived from server time and audit. Use PKT display with UTC instants; enforce start-inclusive/end-exclusive non-overlap transactionally even under concurrent requests. Permit adjacent intervals; audit offer changes.

**Acceptance-criterion IDs:** AC-FR-13-04, AC-FR-16-01, AC-FR-16-02, AC-FR-16-03, AC-FR-16-04, AC-FR-16-05, AC-FR-16-11, AC-FR-16-12, AC-FR-16-13, AC-FR-16-14, AC-FR-16-15, AC-FR-16-16.

**Checks:** F: create both types, edit scheduled and active offers, cancel; N: Cashier write, start >= end, overlap, simultaneous conflicting creates; BVA: adjacent intervals, T-1/T and E-1/E; previous sale snapshots unaffected once S13 exists.

**Evidence:** Shared domain test passed; overall application testing and publication approval reported by requester. Individual gate results and merge history are not asserted. See slice EVIDENCE.md and Git history.

### S12 - Apply current offers to Draft Bill totals

**Owner:** Muhammad Faseeh | **Branch:** `feature-faseeh` | **Priority:** P0 | **Prerequisites:** S09, S11  
**FRs:** FR-03, FR-16 | **NFRs:** NFR-03; NFR-04 (final); NFR-01  
**Task folder:** `slices/S12_MuhammadFaseeh/` | **Status:** Source included
**Mode:** Bounded AFK; stop on critical contradiction or unresolved security/financial decision.  
**Scope / user outcome:** Billing queries Offers at server calculation time, displays applicable terms and capped discount; update on recalculation/offer changes, reject client-submitted discount override. Use integer minor units or exact decimals and round-half-up; percentage or capped fixed discount once per bill, no stacking. Server clock authoritative; S13 re-evaluates at Push.

**Acceptance-criterion IDs:** AC-FR-03-02, AC-FR-03-04, AC-FR-16-06, AC-FR-16-07, AC-FR-16-08, AC-FR-16-09, AC-FR-16-12, AC-FR-16-13, AC-FR-16-14, AC-FR-16-15, AC-FR-16-16.

**Checks:** F: percent and fixed offers, recompute after edit/cancel; BVA: start/end, fixed discount equal/above subtotal; N: inactive, expired or cancelled offer never applies; spoofed client clock/discount ignored.

**Evidence:** Shared domain test passed; overall application testing and publication approval reported by requester. Individual gate results and merge history are not asserted. See slice EVIDENCE.md and Git history.

### S13 - Push paid bills atomically and view receipt/history

**Owner:** Muhammad Sana Ullah | **Branch:** `feature-sana` | **Priority:** P0 | **Prerequisites:** S04, S09, S10, S12  
**FRs:** FR-03, FR-04, FR-13, FR-16 | **NFRs:** NFR-03; NFR-04 (final); NFR-01; NFR-02  
**Task folder:** `slices/S13_MuhammadSanaUllah/` | **Status:** Source included
**Mode:** Bounded AFK; stop on critical contradiction or unresolved security/financial decision.  
**Scope / user outcome:** All three roles Push after external payment check. Billing coordinates Catalog/Offers/Inventory/Audit through opaque UoW, persists receipt/snapshots and stable logical Push ID; receipt and permitted history/audit views, no untraceable audit deletion. Use a stable logical Push identity, same checked-out transaction client behind opaque UoW, historical snapshots, FEFO stock allocation, paid-amount reconciliation and atomic sale/stock/audit effects. Preserve saved draft on failure. Implement permitted receipts/history and audit view; untraceable audit deletion is forbidden.

**Acceptance-criterion IDs:** AC-FR-03-05, AC-FR-04-01, AC-FR-04-02, AC-FR-04-03, AC-FR-04-04, AC-FR-04-05, AC-FR-04-06, AC-FR-04-07, AC-FR-04-08, AC-FR-04-09, AC-FR-13-01, AC-FR-13-02, AC-FR-13-04, AC-FR-13-05, AC-FR-13-06, AC-FR-13-07, AC-FR-13-08, AC-FR-16-10, AC-FR-16-14.

**Checks:** F: paid Push creates one sale and exact deduction; N: shortage leaves draft unchanged, rollback failure, Cashier audit denied; BVA/concurrency: 1 unit two separate Pushes one wins with exact PRD message; same-key replay/mismatch; offer expires between draft/Push; history excludes drafts.

**Evidence:** Shared domain test passed; overall application testing and publication approval reported by requester. Individual gate results and merge history are not asserted. See slice EVIDENCE.md and Git history.

### S14 - Confirm CSV import, retry failed rows and view outcomes

**Owner:** Nazakat Ali | **Branch:** `feature-nazakat` | **Priority:** P1 | **Prerequisites:** S06, S08, S10, S13  
**FRs:** FR-14 | **NFRs:** NFR-03; NFR-04 (final); NFR-01; NFR-02  
**Task folder:** `slices/S14_NazakatAli/` | **Status:** Source included
**Mode:** Bounded AFK; stop on critical contradiction or unresolved security/financial decision.  
**Scope / user outcome:** Explicitly confirm immutable choices; bounded durable worker processes each row through Catalog/Locations with same-transaction success marker; revalidate stale match; up to 3 retries after initial attempt; report all outcome classes. No stock mutation. Use the approved configurable file/row limits, not the old unbounded-import wording. New products use Uncategorized; replacement preserves category. Persist progress and success atomically, pause after permission revocation, detect stale rows, retry initial + up to three attempts after failure, and never change stock.

**Acceptance-criterion IDs:** AC-FR-14-01, AC-FR-14-05, AC-FR-14-08, AC-FR-14-09, AC-FR-14-10, AC-FR-14-11, AC-FR-14-12, AC-FR-14-14, AC-FR-14-15, AC-FR-14-16, AC-FR-14-17, AC-FR-14-18.

**Checks:** F: confirmed new/replace/skip with blank and normalized locations, inspect outcomes; N: unauthorized confirm, cancelled/unresolved/stale preview, failure injection; BVA: initial+3 retries then Failed; replay successful row no repeat; 5 MB/10,000-row boundary, one over the limit, and checkout contention.

**Evidence:** Shared domain test passed; overall application testing and publication approval reported by requester. Individual gate results and merge history are not asserted. See slice EVIDENCE.md and Git history.

### S15 - Submit eligible full or partial refund requests

**Owner:** Muhammad Faseeh | **Branch:** `feature-faseeh` | **Priority:** P1 | **Prerequisites:** S13  
**FRs:** FR-11, FR-13 | **NFRs:** NFR-03; NFR-04 (final); NFR-02  
**Task folder:** `slices/S15_MuhammadFaseeh/` | **Status:** Source included
**Mode:** Bounded AFK; stop on critical contradiction or unresolved security/financial decision.  
**Scope / user outcome:** Cashier matches receipt to Completed Sale, selects eligible quantities and amount, submits Pending. Reserve remaining amount and selected units atomically; reject duplicate/excess/ineligible requests. Use authoritative server time: eligible strictly before 168 hours; at or after boundary ineligible. Reserve pending/approved units and value; Refunded consumes and Rejected releases. Use original discounted sale snapshots and receipt identifier.

**Acceptance-criterion IDs:** AC-FR-11-01, AC-FR-11-02, AC-FR-11-03, AC-FR-11-04, AC-FR-11-05, AC-FR-11-06, AC-FR-11-09, AC-FR-11-10, AC-FR-13-03.

**Checks:** F: eligible full and partial requests; N: invalid receipt, repeat units, amount over remaining, concurrent requests; BVA: 167h59m59s, 168h, 168h+1s (exactly 168h is ineligible); exact remaining amount vs one minor unit above.

**Evidence:** Shared domain test passed; overall application testing and publication approval reported by requester. Individual gate results and merge history are not asserted. See slice EVIDENCE.md and Git history.

### S16 - View sales dashboard and product performance

**Owner:** Hassan Adil | **Branch:** `feature-hassan` | **Priority:** P1 | **Prerequisites:** S13, S17, S18  
**FRs:** FR-08, FR-09 | **NFRs:** NFR-03; NFR-04 (final)  
**Task folder:** `slices/S16_HassanAdil/` | **Status:** Source included
**Mode:** Bounded AFK; stop on critical contradiction or unresolved security/financial decision.  
**Scope / user outcome:** Owner/Manager dashboard and date-filtered reports from Completed Sales; product units, trends and profitability separately, Insufficient Data where facts/costs lacking. Use committed refund/return facts from S17/S18; no draft inclusion. Use only approved PRD/DR-21-25 metrics: gross sales, count, completed refunds, net sales and units; PKT event dates; approved periods; no Draft Bills. Implement refund-aware reporting after S17/S18, cost snapshots and missing-cost handling, category demand/trends per approved thresholds. Reference DreamsPOS only for visuals; no reference data/features.

**Acceptance-criterion IDs:** AC-FR-08-01, AC-FR-08-02, AC-FR-08-03, AC-FR-08-04, AC-FR-08-05, AC-FR-08-06, AC-FR-09-01, AC-FR-09-02, AC-FR-09-03, AC-FR-09-04, AC-FR-09-05, AC-FR-09-06.

**Checks:** F: known fixture totals/units across dates; N: Cashier direct analytics denied, missing costs show unavailable; EP: empty period and sparse history; boundary start/end; regression after refunds/returns under approved policy.; completed versus pending refunds, resellable versus non-resellable returns, missing cost, all approved periods.

**Evidence:** Shared domain test passed; overall application testing and publication approval reported by requester. Individual gate results and merge history are not asserted. See slice EVIDENCE.md and Git history.

### S17 - Approve, reject and record externally completed refunds

**Owner:** Muhammad Faseeh | **Branch:** `feature-faseeh` | **Priority:** P1 | **Prerequisites:** S15  
**FRs:** FR-08, FR-11, FR-13 | **NFRs:** NFR-03; NFR-04 (final); NFR-02  
**Task folder:** `slices/S17_MuhammadFaseeh/` | **Status:** Source included
**Mode:** Bounded AFK; stop on critical contradiction or unresolved security/financial decision.  
**Scope / user outcome:** Owner/Manager approves up to reserved remaining limit (may reduce amount) or rejects and releases reservation; only after external refund confirmation transition Approved to Refunded. Retain linked status, audit and approved report treatment. Preserve original sale. Pending->Approved->Refunded only after external confirmation; Pending->Rejected releases reservations. Failed/uncertain external refund remains Approved for reconciliation. No payment gateway, no repeated completion; expose committed facts through a public read contract for S16.

**Acceptance-criterion IDs:** AC-FR-08-06, AC-FR-11-07, AC-FR-11-08, AC-FR-11-10, AC-FR-13-03, AC-FR-13-04, AC-FR-13-08.

**Checks:** F: Pending->Approved->Refunded, Pending->Rejected and reservation release; N: Cashier approval, invalid transition, excessive amount, repeat confirmation; simulate interrupted local commit; original sale unchanged, committed refund read contract reconciles; rerun reporting checks in S16.

**Evidence:** Shared domain test passed; overall application testing and publication approval reported by requester. Individual gate results and merge history are not asserted. See slice EVIDENCE.md and Git history.

### S18 - Inspect returns and decide stock disposition

**Owner:** Muhammad Faseeh | **Branch:** `feature-faseeh` | **Priority:** P1 | **Prerequisites:** S04, S15, S17  
**FRs:** FR-09, FR-12, FR-13 | **NFRs:** NFR-03; NFR-04 (final); NFR-02  
**Task folder:** `slices/S18_MuhammadFaseeh/` | **Status:** Source included
**Mode:** Bounded AFK; stop on critical contradiction or unresolved security/financial decision.  
**Scope / user outcome:** Cashier records initial inspection; Owner/Manager decides resellable or non-resellable; only approved resellable units enter Available Stock once through Inventory. Keep monetary and stock states separate and update reporting per approved rule. Separate physical and monetary status. Only authorized resellability confirmation changes Available Stock once, through Inventory; non-resellable/expired/disputed goods excluded. Publish committed disposition facts for S16.

**Acceptance-criterion IDs:** AC-FR-09-05, AC-FR-12-01, AC-FR-12-02, AC-FR-12-03, AC-FR-12-04, AC-FR-12-05, AC-FR-12-06, AC-FR-13-04, AC-FR-13-08.

**Checks:** F: pending return excluded, manager confirms resellable increases stock once; non-resellable excluded; N: Cashier disposition, duplicate decision, excess returned quantity, injected failure rolls back; regress refund and stock reconciliation.

**Evidence:** Shared domain test passed; overall application testing and publication approval reported by requester. Individual gate results and merge history are not asserted. See slice EVIDENCE.md and Git history.

### S19 - Monitor stock, low-stock and expiry alerts

**Owner:** Nazakat Ali | **Branch:** `feature-nazakat` | **Priority:** P1 | **Prerequisites:** S04, S10, S13, S18  
**FRs:** FR-07 | **NFRs:** NFR-03; NFR-04 (final)  
**Task folder:** `slices/S19_NazakatAli/` | **Status:** Source ready for later publication
**Mode:** Bounded AFK; stop on critical contradiction or unresolved security/financial decision.  
**Scope / user outcome:** Owner/Manager dashboard for actual stock, zero stock, configurable per-product low-stock threshold and approaching expiry based on approved 30-day default. S20 adds advisory suggested threshold. Use positive Available Stock at or below manual threshold for Low Stock, zero for Out of Stock, 30-calendar-day approaching expiry default, separate expired state; approved alert priority and actual facts only.

**Acceptance-criterion IDs:** AC-FR-07-01, AC-FR-07-02, AC-FR-07-03, AC-FR-07-04.

**Checks:** F: zero-stock and low-stock views, save threshold, date-based expiry alert; EP/BVA: stock threshold-1/threshold/threshold+1, 0; expiry window last/next day; N: Cashier threshold change denied; actual stock with no history.

**Evidence:** Shared domain test passed; overall application testing and publication approval reported by requester. Individual gate results and merge history are not asserted. See slice EVIDENCE.md and Git history.

### S20 - View explained AI recommendations and threshold suggestions

**Owner:** Nazakat Ali | **Branch:** `feature-nazakat` | **Priority:** P1 | **Prerequisites:** S16, S19  
**FRs:** FR-07, FR-10 | **NFRs:** NFR-03; NFR-04 (final)  
**Task folder:** `slices/S20_NazakatAli/` | **Status:** Source ready for later publication
**Mode:** Bounded AFK; stop on critical contradiction or unresolved security/financial decision.  
**Scope / user outcome:** Owner/Manager views evidence-backed local recommendations and suggested thresholds, displays evidence/uncertainty and Insufficient Data; explicit authorized acceptance to change manual threshold, never auto-buy or mutate stock/sales. Use the approved local evidence-based method. Use local explainable 30-day moving average, at least 30 days history and 10 net units; ceil 7-day coverage for suggested threshold; insufficient data is explicit. Human authorization to adopt a threshold; no stock/sales/purchase mutation. Deterministic fixture checks and held-out error metric only when data permits.

**Acceptance-criterion IDs:** AC-FR-07-05, AC-FR-10-01, AC-FR-10-02, AC-FR-10-03, AC-FR-10-04, AC-FR-10-05, AC-FR-10-06.

**Checks:** F: deterministic known-data recommendation with supporting facts, accepted threshold and unchanged stock; EP: sufficient/sparse/missing data; N: Cashier denied, no silent threshold override or supplier order; recommendation failure cannot affect Push.; 29/30 days and 9/10 net units; independent expected threshold; no claim of accuracy without evaluation.

**Evidence:** Shared domain test passed; overall application testing and publication approval reported by requester. Individual gate results and merge history are not asserted. See slice EVIDENCE.md and Git history.

## 7. Publication workflow and evidence

All source was generated as one integrated candidate, then split into dependency-ordered overlays. Copy one code/ tree at a time to the assigned branch after synchronizing with develop. Merge it before proceeding. The requester reports successful testing of the integrated application and approves publication. Domain tests are separately evidenced; individual reviews and Git contributions are not inferred.

## 8. Live plan and evidence

Each publication overlay includes the root plan, cumulative logs, and exactly one new numbered plan snapshot. The snapshot is byte-identical to its plan.md. Keep all earlier snapshots. Prepared timestamps describe the actual packaging, not historical development or merge times. Git history records publication dates and authors. Do not apply overlays out of order.

## 9. Final validation and release

Run actual role-specific end-to-end journeys: Owner creates staff; authorized staff registers product, receives batch and assigns location; CSV preview/confirm and recovery; offers; cashier scans and saves/pushes; atomic stock/receipt/history; refund and return disposition; refund-aware dashboard, alerts and explained recommendations. Test unauthorized direct API access, last-unit race, stable retry, offer time and refund cutoff, import interruption, recovery and no unintended writes. NFR-01: measure each routine POS operation with five concurrent users on documented machine; at least 95% within three seconds per operation. NFR-02: atomic exactly-once sale/stock, rollback and consistency. NFR-03: backend role enforcement. NFR-04: five participants across roles, one hour training and at least 90% unaided completion; define task-level denominator and report participant-level outcomes. Approved additional dashboard/report/alert target five seconds; recommendation ten seconds on documented workload. Physical USB HID scanner model/suffix/observed result is separate from simulated test. Verify actual LAN from multiple browsers, no DB exposure, secure sessions, clock, backup/restore, outages; never claim unrun checks. Complete final project report with implemented scope, challenges, CCP problem/complexity/trade-offs/two alternatives/integration/evaluation/scale/ethical impact, limitations and contribution summary. Document actual access/setup. G5 release check and human acceptance precede main merge.

## 10. Plan history

- v01: Original repository baseline; preserve untouched.
- v02: Final planning baseline.
- v03: Foundation publication.
- v04: S01 publication payload.
- v05: S02 publication payload.
- v06: S03 publication payload.
- v07: S04 publication payload.
- v08: S05 publication payload.
- v09: S06 publication payload.
- v10: S07 publication payload.
- v11: S08 publication payload.
- v12: S09 publication payload.
- v13: S10 publication payload.
- v14: S11 publication payload.
- v15: S12 publication payload.
- v16: S13 publication payload.
- v17: S14 publication payload.
- v18: S15 publication payload.
- v19: S17 publication payload.
- v20: S18 publication payload.
- v21: S16 publication payload.


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

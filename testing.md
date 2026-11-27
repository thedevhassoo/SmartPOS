# SmartPOS - Testing and quality gates (v02)

Status: planned tests only; all results Not Run. Apply functional and important negative checks; EP/BVA only where meaningful. Use Vitest, Supertest and selected Playwright journeys, real PostgreSQL for transaction checks, and actual scanner hardware for hardware claims. Tests may be generated/executed by the agent; team verifies genuine output. Do not count skipped or simulated hardware tests as passed.

| Gate | Timing | Pass condition | If not met |
|---|---|---|---|
| G1 | Before implementation | Relevant scope, ACs, approved decisions, dependencies, test cases | Clarify or block |
| G2 | After implementation | Positive and negative checks and relevant EP/BVA pass | Revise/retest |
| G3 | Before integration | Architecture, ADR, ownership, authorization, consistency | Correct or approve real change |
| G4 | Before acceptance/integration | Candidate builds and relevant earlier flows pass | Fix and rerun |
| G5 | Final product | End-to-end, edge cases, selected NFRs and release scope | Resolve critical failures; disclose limitations |

For each test retain slice/requirement, type, input/condition, expected result, actual result, pass/fail, command/AI session/commit. Keep failures and retests. Use the EVIDENCE.md in each slice folder. Do not invent results.

## Slice check catalogue

### S01 - Sign in and enforce role access

F: valid credentials for each role; N/EP: unknown user, wrong password, unauthenticated and Cashier direct protected request; verify idle does not auto-lock; regress authorization on every later slice.; test session invalidation, CSRF and login throttling.

Expected: meets the approved ACs and scope in plan.md; invalid action leaves protected data unchanged. Actual: Not Run.

### S02 - Owner manages staff accounts and resets passwords

F: create staff account and sign in; N: Manager/Cashier direct create/reset rejected, duplicate username rejected; after reset old password fails; regression login.

Expected: meets the approved ACs and scope in plan.md; invalid action leaves protected data unchanged. Actual: Not Run.

### S03 - Register, update and find products

F: create and find by scan/manual/name, edit price with audit; N/EP: duplicate barcode, blank required fields, invalid price, unknown barcode/name, Cashier edit denied; leading-zero barcode retained.; actual HID verification recorded separately when hardware is available.

Expected: meets the approved ACs and scope in plan.md; invalid action leaves protected data unchanged. Actual: Not Run.

### S04 - Receive stock batches and inspect expiry and costs

F: receive two batches with distinct dates/costs; verify quantities/cost persist and stock total; N/EP: invalid quantity/date/cost, Cashier denied; BVA: quantity 0 and 1; rollback on injected receipt failure.

Expected: meets the approved ACs and scope in plan.md; invalid action leaves protected data unchanged. Actual: Not Run.

### S05 - Create, rename and assign storage locations

F: create A/B, assign and move product, rename and see current value in lookup; EP: case/format variants reuse identity, spelling difference distinct; N: Cashier mutation denied; stock/price unchanged.

Expected: meets the approved ACs and scope in plan.md; invalid action leaves protected data unchanged. Actual: Not Run.

### S06 - Filter products and safely delete locations

F: filter A, cancel deletion, confirm deletion with two products; N: Cashier direct filter/delete denied, deleted ID cannot be assigned; transaction failure rolls back both effects; regress lookup.

Expected: meets the approved ACs and scope in plan.md; invalid action leaves protected data unchanged. Actual: Not Run.

### S07 - Upload CSV and inspect a validation preview

F: valid file, mixed rows, duplicate groups and cancel; N/EP: XLSX, missing/extra/reordered headers, missing mandatory field, malformed price; Cashier upload denied; product/location counts unchanged.

Expected: meets the approved ACs and scope in plan.md; invalid action leaves protected data unchanged. Actual: Not Run.

### S08 - Resolve CSV duplicates and Replace/Skip decisions

F: duplicate existing barcode, choose second row, then Replace/Skip; N: invalid retained row, stale version, unresolved decisions block confirmation, Cashier decision denied; no catalog/location mutation.

Expected: meets the approved ACs and scope in plan.md; invalid action leaves protected data unchanged. Actual: Not Run.

### S09 - Prepare, recalculate and explicitly save Draft Bills

F: add/remove/revise quantity, totals, Save and retrieve saved state under approved policy; N/EP: zero/negative quantity, unknown product, unauthorized discount; crash before Save loses draft; stock and sale count unchanged.; rapid repeated scans, one Enter event, dialog focus, unplug/manual fallback; physical test separately.

Expected: meets the approved ACs and scope in plan.md; invalid action leaves protected data unchanged. Actual: Not Run.

### S10 - Reconcile stock discrepancies and audit adjustments

F: discrepancy shown and confirmed adjustment with old/new audit values; N: Cashier denied, negative result rejected, stale adjustment conflict; BVA: resulting stock 0 vs -1; cancel leaves data unchanged.

Expected: meets the approved ACs and scope in plan.md; invalid action leaves protected data unchanged. Actual: Not Run.

### S11 - Create, edit and cancel scheduled store-wide offers

F: create both types, edit scheduled and active offers, cancel; N: Cashier write, start >= end, overlap, simultaneous conflicting creates; BVA: adjacent intervals, T-1/T and E-1/E; previous sale snapshots unaffected once S13 exists.

Expected: meets the approved ACs and scope in plan.md; invalid action leaves protected data unchanged. Actual: Not Run.

### S12 - Apply current offers to Draft Bill totals

F: percent and fixed offers, recompute after edit/cancel; BVA: start/end, fixed discount equal/above subtotal; N: inactive, expired or cancelled offer never applies; spoofed client clock/discount ignored.

Expected: meets the approved ACs and scope in plan.md; invalid action leaves protected data unchanged. Actual: Not Run.

### S13 - Push paid bills atomically and view receipt/history

F: paid Push creates one sale and exact deduction; N: shortage leaves draft unchanged, rollback failure, Cashier audit denied; BVA/concurrency: 1 unit two separate Pushes one wins with exact PRD message; same-key replay/mismatch; offer expires between draft/Push; history excludes drafts.

Expected: meets the approved ACs and scope in plan.md; invalid action leaves protected data unchanged. Actual: Not Run.

### S14 - Confirm CSV import, retry failed rows and view outcomes

F: confirmed new/replace/skip with blank and normalized locations, inspect outcomes; N: unauthorized confirm, cancelled/unresolved/stale preview, failure injection; BVA: initial+3 retries then Failed; replay successful row no repeat; 5 MB/10,000-row boundary, one over the limit, and checkout contention.

Expected: meets the approved ACs and scope in plan.md; invalid action leaves protected data unchanged. Actual: Not Run.

### S15 - Submit eligible full or partial refund requests

F: eligible full and partial requests; N: invalid receipt, repeat units, amount over remaining, concurrent requests; BVA: 167h59m59s, 168h, 168h+1s (exactly 168h is ineligible); exact remaining amount vs one minor unit above.

Expected: meets the approved ACs and scope in plan.md; invalid action leaves protected data unchanged. Actual: Not Run.

### S16 - View sales dashboard and product performance

F: known fixture totals/units across dates; N: Cashier direct analytics denied, missing costs show unavailable; EP: empty period and sparse history; boundary start/end; regression after refunds/returns under approved policy.; completed versus pending refunds, resellable versus non-resellable returns, missing cost, all approved periods.

Expected: meets the approved ACs and scope in plan.md; invalid action leaves protected data unchanged. Actual: Not Run.

### S17 - Approve, reject and record externally completed refunds

F: Pending->Approved->Refunded, Pending->Rejected and reservation release; N: Cashier approval, invalid transition, excessive amount, repeat confirmation; simulate interrupted local commit; original sale unchanged, committed refund read contract reconciles; rerun reporting checks in S16.

Expected: meets the approved ACs and scope in plan.md; invalid action leaves protected data unchanged. Actual: Not Run.

### S18 - Inspect returns and decide stock disposition

F: pending return excluded, manager confirms resellable increases stock once; non-resellable excluded; N: Cashier disposition, duplicate decision, excess returned quantity, injected failure rolls back; regress refund and stock reconciliation.

Expected: meets the approved ACs and scope in plan.md; invalid action leaves protected data unchanged. Actual: Not Run.

### S19 - Monitor stock, low-stock and expiry alerts

F: zero-stock and low-stock views, save threshold, date-based expiry alert; EP/BVA: stock threshold-1/threshold/threshold+1, 0; expiry window last/next day; N: Cashier threshold change denied; actual stock with no history.

Expected: meets the approved ACs and scope in plan.md; invalid action leaves protected data unchanged. Actual: Not Run.

### S20 - View explained AI recommendations and threshold suggestions

F: deterministic known-data recommendation with supporting facts, accepted threshold and unchanged stock; EP: sufficient/sparse/missing data; N: Cashier denied, no silent threshold override or supplier order; recommendation failure cannot affect Push.; 29/30 days and 9/10 net units; independent expected threshold; no claim of accuracy without evaluation.

Expected: meets the approved ACs and scope in plan.md; invalid action leaves protected data unchanged. Actual: Not Run.

## Final evidence

- POS performance: log environment, sample count, five concurrent users, timing for barcode recognition/add/recalculate/Push, percentage <=3 s for each operation; retain actual measurements.
- Transaction consistency: two competing last-unit sales, repeated key/mismatched payload, injected failure/rollback, return and import retries.
- Roles: direct API calls and permitted/denied reads/actions for all three roles.
- Usability: five participants across all roles, one hour training, role task script, unaided completion denominator and outcomes; report at least 90% criterion with actual results.
- Dashboard/report/alerts five seconds; recommendation ten seconds; record actual workload and method, not guaranteed performance.
- Physical scanner: model, configured suffix, repeated scans and fallback, date and observations. Pending until actual hardware test.
- LAN: actual host, client browser connections, authorization, outage behavior, DB not exposed, backup/restore and clock check. Pending.

# SmartPOS — Testing Strategy

**Status:** Stage 2 planning; no test suites or test runs exist yet.

## Test layers

- Unit/component: Vitest.
- API integration: Supertest on the Express application.
- End-to-end: selected Playwright flows.
- Database: migrations, constraints and transaction/integrity scenarios.
- Physical hardware: actual USB HID scanner test; keyboard-event simulation is not hardware evidence.

## Slice testing

Each slice must test positive behavior, negative authorization, role denial, invalid data, EP/BVA cases and relevant integration paths. Tests must use real service/module boundaries rather than duplicating business rules in UI tests.

## Critical test families

- Authentication: login, session invalidation, reset, deactivation and direct forbidden API calls.
- Barcode: leading zeros, unknown code, manual equivalence, repeated scans, Enter handling, modal focus and scanner unplugged fallback.
- Location: normalize, assign one location, filter, cancel deletion, atomic unassignment and deleted target rejection.
- Draft Bill: no stock/reservation until Push, Save, quantity editing, offer recalculation and insufficient stock.
- Push: single logical Push, payload mismatch, interruption, retry, last unit, rollback and exactly one sale/deduction.
- Refund/return: sale linkage, 168-hour boundaries, duplicate unit protection, reservations, status transitions, uncertain external reversal and duplicate restock.
- CSV: exact header, row rejection, duplicate order, Replace/Skip, no preview writes, stale conflict, retries, restart and no stock mutation.
- Offer: overlap, concurrency, PKT boundaries, adjacent intervals, edit/cancel and Push re-evaluation.
- Inventory: negative prohibition, batch allocation, expiry, audited adjustment and concurrent adjustment.
- Reports/AI: period boundaries, gross/net/refund rules, insufficient cost/history, deterministic formulas and no checkout blocking.

## Verification status

- Five-concurrent-user 95%-under-three-second POS profile: **Not Run**.
- Dashboard 5-second target: **Not Run**.
- Recommendation 10-second target: **Not Run**.
- Physical USB HID test: **Pending**.
- Backup/restoration: **Pending**.
- Usability: **Pending**.


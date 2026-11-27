# SmartPOS — Module and Component Design

**Status:** Approved design guidance; source structure is not implemented. Keep the initial implementation minimal and expand only to support an approved slice.

## Client

- `client/src/app`: React Router setup, role-aware route presentation and shared shell.
- `client/src/api`: Axios client, session handling, typed response/error mapping. No database access or trusted authorization.
- `client/src/features`: domain-aligned screens for catalog, locations, billing, inventory, imports, offers, refunds/returns, reports and AI. Implement only as slices are accepted.
- Shared UI/theme helpers are presentation-only. Do not move domain rules into components.

## Server

- `server/src/api`: Express app, route registration, authentication/authorization middleware, Zod request parsing, response/error mapping. Routes remain thin.
- `server/src/infrastructure`: PostgreSQL pool, SQL migration runner, opaque unit-of-work/transaction coordinator, server clock, environment schema and logger. Infrastructure imports no business module.
- `server/src/modules/<capability>`: public port/types, owning service and repository. No cross-module private repository imports or foreign-table writes.
- `shared/contracts`: only genuinely shared TypeScript contracts/Zod schemas used across client/server; no generic business utility bucket.

## Module responsibility and dependencies

| Module | Owns | Public dependencies/coordinators |
|---|---|---|
| Identity & Access | Users, role, credential/session, policy | Central API and protected module operations |
| Catalog | Product identity/barcode/name/price/category/location reference | Locations assignment service; Billing/report read interfaces |
| CSV Import | One durable job/row status, staged input, immutable decisions/outcomes | Catalog, Locations, Audit ports; bounded in-process worker |
| Storage Locations | Canonical location records and lifecycle | Catalog assignment/bulk-unassign public port in shared UoW |
| Billing | Draft Bills, sales, sale lines, Push identity and snapshots | Catalog, Offers, Inventory and Audit ports in Push UoW |
| Offers | Offer terms, intervals and cancellation | Billing eligibility read; server clock |
| Inventory & Expiry | Balances/movements, batches, expiry/cost and stock adjustment | Catalog product reads; Billing sale deduction; Refunds authorized return transition |
| Refunds & Returns | Sale-linked refund/return status, unit reservations and disposition | Billing verification, Inventory transition, Audit append |
| Reporting & Alerts | Read models/aggregates/alert views | Public committed reads; never transaction writers |
| AI Insights | Explainable evidence/recommendation output | Reporting/committed read contract; no operational writes |
| Audit | Append-only sensitive action records and authorized reads | Called by business modules; never imports Billing/Refunds |
| API read composers | Product Search and Transaction History composition only | Public module read ports; no new domain owner/storage |

## Shared boundaries

- Express serves the browser API and may serve the Vite build in production; PostgreSQL is server-only.
- Auth middleware establishes actor identity; owning service rechecks critical permissions. Deny by default.
- Zod validates HTTP, CSV and environment trust boundaries. Shared type inference must not replace runtime validation.
- All transaction operations acquire one `pg` client, begin/commit/rollback on that client and pass only an opaque UoW reference through public interfaces.
- Centralized error handler returns the API contract’s stable error shape and request ID, while logging technical details safely.
- Configuration is validated at boot; secrets come only from environment/deployment configuration and are never committed.
- Reporting/AI may be stale or fail without blocking/rolling back a valid Push.


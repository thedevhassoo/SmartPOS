# API Contracts — SmartPOS Stage 3 Supporting Design

**Status:** Approved-design baseline; no endpoint is implemented or verified.  
**Scope:** Only contracts needed by the approved 20 slices. API paths are proposed contract names pending implementation review; they do not add product scope.

## Conventions

- JSON over the central authenticated HTTPS/HTTP LAN API; production transport configuration is a deployment task.
- Responses use UTF-8 JSON. Barcodes are strings, never numbers.
- All protected routes require a server session and server-side authorization. Denied actions return `403`; missing/invalid authentication returns `401`.
- Request bodies and query parameters are parsed with Zod at the API boundary. Do not trust client role, price, offer eligibility, stock, actor, or timestamp fields.
- Shared TypeScript DTOs may be derived from boundary schemas where client/server genuinely share a contract.
- Success responses are resource-oriented. Errors use `{ error: { code, message, details?, requestId } }`; never leak SQL, stack traces, secrets, or credentials.
- Lists use bounded pagination (`limit`, `cursor` or documented page parameters); authorization is applied before returning rows.
- Mutations return `400` for invalid input, `401` unauthenticated, `403` forbidden, `404` absent resource, `409` business/concurrency conflict, `422` semantically invalid state, `429` rate limit, and `5xx` unexpected failure.

## Contracts by slice

| Slice | Method and path | Permission | Owning module / transaction |
|---|---|---|---|
| S01 | `POST /api/auth/login` | Public, rate-limited | Identity & Access; establish server session |
| S01 | `POST /api/auth/logout` | Authenticated | Identity & Access; invalidate session |
| S01 | `GET /api/auth/session` | Authenticated | Identity & Access; current actor/role only |
| S02 | `GET /api/users` | Owner only | Identity & Access |
| S02 | `POST /api/users` | Owner only | Identity & Access; audit account creation |
| S02 | `PATCH /api/users/:userId` | Owner only | Identity & Access; account deactivate/role update and session invalidation |
| S02 | `POST /api/users/:userId/password-reset` | Owner only | Identity & Access; invalidate relevant sessions |
| S03 | `GET /api/products?barcode=...` | Authenticated lookup roles | API composer: Catalog + Locations + permitted Inventory read |
| S03 | `GET /api/products?name=...` | Authenticated lookup roles | API composer: Catalog + Locations + permitted Inventory read |
| S03 | `GET /api/products/:productId` | Authenticated, field-level role projection | Catalog; composed location/stock reads where allowed |
| S03 | `POST /api/products` | Owner/Manager | Catalog; unique string barcode; audit |
| S03 | `PATCH /api/products/:productId` | Owner/Manager | Catalog; price/metadata audit |
| S04 | `GET /api/products/:productId/batches` | Owner/Manager | Inventory & Expiry |
| S04 | `POST /api/products/:productId/batches` | Owner/Manager | Inventory; batch creation and stock receipt in one transaction |
| S05 | `GET /api/locations` | Authenticated; list only allowed where role permits | Locations |
| S05 | `POST /api/locations` | Owner/Manager | Locations; normalize and enforce canonical uniqueness |
| S05 | `PATCH /api/locations/:locationId` | Owner/Manager | Locations; rename/normalization and audit |
| S05 | `PUT /api/products/:productId/location` | Owner/Manager | Locations coordinates Catalog assignment through public port/UoW |
| S06 | `GET /api/products?locationId=...` | Owner/Manager only | API composer over Catalog/Locations public reads |
| S06 | `DELETE /api/locations/:locationId` | Owner/Manager, explicit confirmation token/body | Locations → Catalog bulk-unassign → delete in one UoW |
| S07 | `POST /api/imports` | Owner/Manager | CSV Import; validate size/type, stage immutable upload |
| S07 | `GET /api/imports/:importId/preview` | Initiating authorized Owner/Manager per approved policy | CSV Import; read-only preview |
| S08 | `PUT /api/imports/:importId/duplicate-decisions` | Owner/Manager | CSV Import; persist survivor decisions |
| S08 | `PUT /api/imports/:importId/existing-decisions` | Owner/Manager | CSV Import; Replace/Skip decisions |
| S14 | `POST /api/imports/:importId/confirm` | Owner/Manager | CSV Import; freeze decisions, actor and confirmation; enqueue internal worker |
| S14 | `GET /api/imports/:importId/status` | Authorized Owner/Manager | CSV Import; durable progress/outcomes |
| S09 | `POST /api/draft-bills` | Authenticated checkout roles | Billing; transient draft creation |
| S09 | `GET /api/draft-bills/:draftBillId` | Authorized actor/role policy | Billing |
| S09 | `PUT /api/draft-bills/:draftBillId/lines` | Authenticated checkout roles | Billing; calculate via Catalog/Offers; no stock mutation |
| S09 | `POST /api/draft-bills/:draftBillId/save` | Authenticated checkout roles | Billing; explicit durable save; no reservation |
| S11 | `GET /api/offers` | Owner/Manager management; checkout only active summary | Offers |
| S11 | `POST /api/offers` | Owner/Manager | Offers; overlap-safe transaction |
| S11 | `PATCH /api/offers/:offerId` | Owner/Manager | Offers; recheck overlap and audit |
| S11 | `POST /api/offers/:offerId/cancel` | Owner/Manager | Offers; audit |
| S12 | `POST /api/draft-bills/:draftBillId/recalculate` | Authenticated checkout roles | Billing → Offers at server clock; no stock mutation |
| S13 | `POST /api/draft-bills/:draftBillId/push` | Owner/Manager/Cashier, paid confirmation by actor | Billing coordinates Catalog, Offers, Inventory, Audit in one PostgreSQL transaction; stable `Idempotency-Key` required |
| S13 | `GET /api/sales/:saleId/receipt` | Authenticated, permitted sale details | Billing/read composer |
| S13 | `GET /api/transactions` | Role-filtered authorized history | API composer over Billing, Refunds, Audit public reads |
| S15 | `POST /api/refund-requests` | Cashier | Refunds; sale verification, 168h rule, unit/value reservation and audit transaction |
| S15 | `GET /api/sales/:saleId/refund-eligibility` | Cashier/Owner/Manager | Refunds + Billing read ports; do not expose unauthorized data |
| S17 | `GET /api/refund-requests` | Owner/Manager; Cashier’s permitted status view only | Refunds |
| S17 | `POST /api/refund-requests/:id/approve` | Owner/Manager | Refunds; reserve is already effective; audit |
| S17 | `POST /api/refund-requests/:id/reject` | Owner/Manager | Refunds; release reservation; audit |
| S17 | `POST /api/refund-requests/:id/confirm-external-refund` | Owner/Manager | Refunds; require external reference/evidence; transition Approved→Refunded once |
| S18 | `POST /api/returns/:returnId/inspection` | Cashier | Refunds & Returns; inspection, not stock availability |
| S18 | `POST /api/returns/:returnId/resellability` | Owner/Manager | Refunds & Returns → Inventory; atomic authorized stock transition |
| S16 | `GET /api/reports/dashboard?period=...` | Owner/Manager | Reporting; committed facts only |
| S16 | `GET /api/reports/sales?from=...&to=...` | Owner/Manager | Reporting |
| S16 | `GET /api/reports/products?from=...&to=...` | Owner/Manager | Reporting; approved demand/profit formulas |
| S19 | `GET /api/stock-alerts` | Owner/Manager | Reporting & Stock Alerts; read-only |
| S19 | `PUT /api/products/:productId/low-stock-threshold` | Owner/Manager | Inventory/alert configuration; manual threshold only |
| S20 | `GET /api/ai/recommendations` | Owner/Manager | AI Insights; advisory read-only evidence |
| S20 | `POST /api/ai/threshold-suggestions/:productId/accept` | Owner/Manager | Inventory threshold change only after explicit acceptance and audit |

## Shared TypeScript contract examples

```ts
export type Barcode = string & { readonly __brand: 'Barcode' };
export type Role = 'business_owner' | 'store_manager' | 'cashier';
export type MoneyMinor = number & { readonly __brand: 'MoneyMinor' };

export interface ProductLookupResult {
  productId: string;
  barcode: Barcode;
  name: string;
  sellingPriceMinor: MoneyMinor;
  category: string;
  storageLocation: { id: string; displayName: string } | null;
  availableStock?: number;
}

export interface ApiError {
  error: { code: string; message: string; details?: unknown; requestId: string };
}
```

The `availableStock` field is present only where the requesting role and query contract permit it. The API remains authoritative for all values.

## Idempotency and transaction contracts

- S13 requires one stable logical Push key across reload/retry. Bind key to actor, bill intent and request digest. Same key/same intent returns the committed result; same key/different digest returns `409` and performs no write.
- All sale, line, batch deduction, price/offer snapshot and required audit writes use the same checked-out `pg` transaction client. Commit all or none.
- S06 location deletion and Catalog product-unassignment share one UoW; no Locations SQL against Catalog tables.
- S14 each row’s Catalog mutation, Locations mutation and durable success marker share one transaction. Retry only after checking committed row outcome.
- S17/S18 state transition, reservation or release, inventory change and audit record share an appropriate transaction. External bank transfer remains outside the system.


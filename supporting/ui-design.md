# SmartPOS — UI and Interaction Design

**Status:** Stage 2 approved visual direction; no UI implementation exists.  
**Reference:** DreamsPOS retail POS page as visual inspiration only: https://dreamspos.dreamstechnologies.com/retail-pos/html/index.html

## Visual boundary

Use original SmartPOS components. The reference supplies only visual cues: minimalist light theme, orange accents, compact sidebar/header, typography, spacing, white cards, charts and tables. Do not copy its functionality, menu, metrics, sample data, assets, brand or proprietary CSS. SmartPOS feature scope comes only from approved PRD requirements.

## Tokens

| Token | Value |
|---|---|
| Primary orange | `#FE9F43` |
| Dark navy | `#092C4C` |
| Workspace | `#F8F9FA` |
| Surface | `#FFFFFF` |
| Primary text | `#344054` |
| Secondary text | `#667085` |
| Success | `#28A745` |
| Warning | `#F59E0B` |
| Error | `#DC2626` |
| Border | `#E6E9EE` |

These are approved SmartPOS tokens, not claims about computed styles on the external reference. Verify contrast in implementation; never communicate status by color alone.

## Shell and role-aware navigation

- Desktop-first, responsive shell. White collapsible sidebar, approximately 240–256 px; compact header with page context, breadcrumb, authenticated identity and logout; light-gray content workspace.
- Use original SmartPOS branding only. Use Lucide consistently, keyboard-visible focus, reduced motion and semantic labels.
- Render only PRD-approved routes and actions permitted by backend-authoritative roles. Cashier defaults to checkout; no analytics/AI/audit/staff admin.
- Navigation groups: Overview, POS, Inventory, Sales, Reports/AI and Staff only when the corresponding approved slice/role permits them. Do not render decorative or unimplemented menu actions.

## Requirement-traceable screens

| Screen | Requirements/slices | Interaction and required states |
|---|---|---|
| Login/session | FR-01, S01 | Login validation, invalid credentials, loading, rate limit, session expired/revoked; no invented inactivity logout |
| Staff | FR-01, S02 | Owner-only list/create/deactivate/reset; validation, confirmation and error states |
| Catalog and lookup | FR-02, S03 | Dedicated scan/manual string field, name search, selectable exact result, unknown barcode fallback, no auto-create, duplicate registration errors |
| Locations | FR-15, S05/S06 | Canonical location list/create/rename/assign/filter; warning and explicit confirmation before delete; cancellation preserves state; deleted filter clears |
| Batches/stock | FR-05/06, S04/S10 | Batch expiry/cost/quantity, recorded/available separation, adjustment reason and audit confirmation, concurrency conflict |
| CSV wizard | FR-14, S07/S08/S14 | Upload → validate/preview → duplicate decisions → Replace/Skip → confirm → progress/outcome; invalid row/header, conflict, cancel, retry and resume states |
| POS Draft Bill | FR-02/03/16, S09/S12 | Product search/scan, line items and quantities, server-calculated totals/offer, explicit Save, no stock change before Push; unknown, insufficient stock and network states |
| Push/receipt | FR-04/13, S13 | Confirm external payment check, authoritative final total, processing/duplicate retry, success receipt, insufficient/concurrent stock and safe retry states |
| Offers | FR-16, S11/S12 | Owner/Manager schedule/edit/cancel; PKT times; overlap/conflict errors; effective status from server, not client clock |
| Refund/return | FR-11/12/13, S15/S17/S18 | Verifiable sale, eligible units, Pending/Approved/Rejected/Refunded, external confirmation, inspection and resellability; no simulated payment |
| Dashboard/reporting | FR-07/08/09, S16/S19 | Only approved metric cards/charts, PKT period boundaries, zero-sales empty state, stock/expiry; no Draft Bills in sales |
| AI Insights | FR-10, S20 | Evidence, period, uncertainty, assumptions, insufficient-data and advisory labels; no purchase action |
| Audit/history | FR-13, S13/S17 | Role-allowed committed facts only; preserve sale/refund ownership; append-only audit presentation |

## POS layout

Use a checkout-focused workspace: prominent dedicated barcode/search input; searchable product results with product name, barcode, selling price, available stock and permitted current location; Draft Bill lines with quantity controls, line totals, subtotal, authorized offer and total; explicit Save Draft and a separate Push action after external payment verification. Do not show cashier price/discount mutation controls. Avoid focus stealing in modal forms and quantity editors.

## Dashboard and charts

Only the five approved measures from `decision-register.md` may appear: Gross Recorded Sales, Completed Sales Count, Completed Refund Amount, Net Recorded Sales and Actual Units Sold. Visualizations can include a time-series for approved sales/refund events and product quantity/performance table only using approved formulas and periods. Show recorded zero for empty periods and distinguish unavailable data from zero. No dummy values in production; no unrelated business widgets.

## Shared states and accessibility

All screens define loading, empty, validation, permission-denied, network/server error and success states. Tables remain usable at workstation widths and responsive layouts. Forms use labels, accessible errors, keyboard navigation and visible focus. Respect reduced-motion. Bundle required fonts/icons locally; no CDN/runtime internet requirement.


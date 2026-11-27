# Hassan Adil — Individual Context Review

**Repository:** `thedevhassoo/SmartPOS`  
**Branch:** `feature-hassan`  
**Baseline commit:** `758ab9f511b2d6104d0648efbba92949ffa579f9`  
**Source context commit:** `60f94d86cc4446cad0d18da68065f746848acba0`  
**Status:** Proposed responsibility review; no slice or architectural decision is approved by this document.

## 1. Engineer and proposed slice responsibilities

Hassan Adil is proposed to own the following five meaningful end-to-end slices:

| Slice | Proposed responsibility |
|---|---|
| S03 | Shared product lookup and barcode/product-name search, including exact barcode lookup and fallback behavior |
| S05 | Storage Location visibility and product-location support |
| S06 | Storage Location management and atomic location deletion |
| S09 | Draft Bill preparation, quantity editing, recalculation and explicit Save |
| S16 | Dashboard shell and approved Owner/Manager dashboard metrics |

These assignments are proposed only. They do not become approved implementation scope until the consolidated Stage 2 plan is reviewed and approved.

## 2. Relevant requirements

### Confirmed functional requirements

- **FR-02 — Product registration and lookup:** barcode scanning, manual barcode entry and product-name search must work; scanned unknown barcodes fall back to name search.
- **FR-03 — Draft Bills:** authorized users may add registered products and quantities, view prices and calculate the bill without reserving or deducting stock.
- **FR-08 — Dashboard and Sales Reports:** Owner/Manager-only dashboard and recorded-sales reporting. Cashiers are denied analytics access.
- **FR-15 — Storage Locations:** Owner/Manager may view, create, rename, assign, filter and delete locations; Cashiers may view locations during authorized lookup but cannot manage or filter.
- **NFR-01 — Routine POS response:** barcode recognition, item addition and Draft Bill recalculation have separate three-second targets in the five-concurrent-user test profile.
- **NFR-03 — Role authorization:** every protected operation and sensitive read must be denied at the server when the role lacks permission.
- **NFR-04 — Usability:** role-specific tasks must support the documented five-participant, one-hour-training usability profile.

### Supporting requirements

- **FR-04:** Push validates stock and re-evaluates final pricing. This is outside S09's Draft Bill scope but is required at its integration boundary.
- **FR-16:** active scheduled offers affect Draft Bill and final-bill calculation.
- **FR-05/FR-07:** Available Stock and stock-status values may appear in lookup and later dashboard views.
- **FR-13:** sensitive location or catalog changes require traceability where applicable.
- **FR-01:** exactly three roles and server-side role enforcement.

## 3. Existing architecture and module boundaries

The confirmed architectural style is a three-tier layered modular monolith:

1. A role-aware presentation tier.
2. A central authenticated modular application API.
3. A central transactional relational persistence tier.

The relevant module boundaries are:

- **Product Catalog:** product identity, barcode, name, selling price, metadata and lookup. It does not own stock quantities.
- **Storage Locations:** canonical location records, normalization, assignment policy, filtering and deletion.
- **Billing:** Draft Bill state, calculations, explicit Save and authoritative Push orchestration.
- **Offers:** server-authoritative store-wide offer calculation and scheduling.
- **Inventory:** authoritative stock quantities and availability.
- **Reporting & Stock Alerts:** dashboard and reporting reads.
- **Identity & Access:** authentication and server-side authorization.
- **Audit:** sensitive-action traceability.

For Catalog and Locations:

- Catalog owns product rows and is the only module that may write product data.
- Locations owns location records and invokes Catalog's public assignment or bulk-unassignment contract.
- Locations must not issue SQL directly against Catalog tables.
- Location deletion and product unassignment must commit atomically.

For product lookup:

- An API-level composer may combine public Catalog and Locations read ports.
- Cashiers may see a product's current location in permitted lookup.
- Cashiers may not use location filtering or location management.

For Draft Bills:

- A Draft Bill does not reserve or deduct stock.
- A saved Draft Bill remains uncommitted billing state.
- The browser must not calculate or enforce authoritative inventory, offer or role policy.
- Push is the separate Billing/Inventory/Offers/Audit transactional boundary.

## 4. Relevant acceptance criteria

### FR-02 product lookup

- `AC-FR-02-01`: an exact known Barcode may be found by scanner.
- `AC-FR-02-02`: manual entry of the known Barcode finds the same product.
- `AC-FR-02-03`: product-name search returns a selectable match.
- `AC-FR-02-04`: if a scanned Barcode is unknown, name search remains available.
- `AC-FR-02-05`: manual registration requires name, Barcode, selling price and Category.
- `AC-FR-02-06`: duplicate Barcode registration is rejected.

### FR-03 Draft Bills

- `AC-FR-03-01`: authorized users can add products and quantities to a Draft Bill.
- `AC-FR-03-02`: recalculation reflects quantities and recorded prices.
- `AC-FR-03-03`: editing a Draft Bill creates neither a Completed Sale nor a stock deduction.
- `AC-FR-03-04`: unauthorized manual discounts are not applied.
- `AC-FR-03-05`: insufficient stock blocks Push and preserves the Draft Bill.
- `AC-FR-03-06`: explicit Save persists a draft; an unsaved crash loses it.

### FR-08 dashboard

- `AC-FR-08-01`: Owner/Manager dashboard behavior remains deferred until reporting measures are approved.
- `AC-FR-08-02`: Cashiers are denied analytics.
- `AC-FR-08-03`: periods with no Completed Sales display recorded zero sales.
- `AC-FR-08-04`: Draft Bills are excluded from Completed Sales reports.
- `AC-FR-08-05` and `AC-FR-08-06`: reporting periods, filters and refund treatment remain deferred.

### FR-15 locations

- `AC-FR-15-01`: Unassigned is visible for products without a location.
- `AC-FR-15-02`: authorized lookup displays the current location.
- `AC-FR-15-03`: assignments reference exactly one existing location.
- `AC-FR-15-04`: moving a product replaces its current location without location history.
- `AC-FR-15-05`: Cashiers cannot change/create/delete locations or use the management-only filter.
- `AC-FR-15-06`: location filters show only products currently assigned to it.
- `AC-FR-15-07`: deletion warns about products becoming Unassigned.
- `AC-FR-15-08`: confirmed deletion removes the location and unassigns products without deleting them.
- `AC-FR-15-09`: cancelled deletion changes nothing.
- `AC-FR-15-10`: deleting the active filter clears it.
- `AC-FR-15-11`: deleted locations cannot become assignment targets.
- `AC-FR-15-12`: location changes do not change stock or unrelated product fields.

## 5. Dependencies on other modules and engineers

### Module dependencies

- **Identity & Access:** protected lookup, management and dashboard routes require server permissions.
- **Inventory:** lookup may display Available Stock; Draft Bill Push integration depends on inventory ownership.
- **Billing:** S09 uses Draft Bill state and delegated calculation interfaces.
- **Offers:** Draft Bill and Push calculations depend on server-authoritative offer eligibility.
- **Reporting & Stock Alerts:** S16 requires approved, committed dashboard facts.
- **Audit:** sensitive catalog/location and approved business actions require traceable audit capture.
- **Refund/Transaction modules:** dashboard refund-aware figures must await their approved reporting treatment.

### Cross-engineer dependencies

- **Identity/PRD rollout engineer:** authentication, role checks and protected-route contracts.
- **Inventory/expiry engineer:** stock quantity, Available Stock and stock-status contracts.
- **Billing/Push engineer:** stable Draft Bill state, offer/Push integration and atomic Checkout behavior.
- **Offers engineer:** effective offer data for bill recalculation.
- **Reporting engineer:** dashboard query contracts and approved metrics.
- **Refund/return engineer:** refund-aware reporting data, if approved.
- **CSV/import engineer:** must not conflict with Catalog or Locations ownership and must revalidate stale product/location state.

## 6. Ambiguities and missing decisions

- The exact manual product-registration field rules beyond name, barcode, selling price and Category need confirmation.
- `OQ-40` and receipt-specific behavior do not directly block basic lookup, but dashboard/refund integration may.
- Location normalization is agreed to cover capitalization and minor formatting differences, but exact canonical display rules and the permitted set of formatting replacements require testable examples.
- Location-management UI details, including rename behavior and confirmation-copy requirements, need a final interaction contract.
- Draft Bill behavior for unsaved crash/reload, Save/Resume and confirmation is not fully specified.
- Repeated-scan quantity behavior is proposed, not yet an approved final interaction rule.
- Actual USB HID suffix, scanner model and physical workstation configuration are not established.
- The dashboard has no approved measures. Several PRD metrics remain deferred.
- `OQ-16–OQ-21/OQ-42` affect dashboard period, filter and metric choices.
- `OQ-10/OQ-31/OQ-50` affect subtotal and discount calculation.
- `OQ-34` affects whether displayed stock is Recorded or Available Stock.
- `OQ-51` affects server-time and offer testing relevant to the Draft Bill boundary.
- The repository documents refer inconsistently to `ADR/` and `ADRs/`; `ADR/` is the confirmed standard.
- Technology choices remain proposed rather than formally approved.
- No application manifests or source directories exist yet.

## 7. Open questions and PRD references

Relevant remaining Open Questions include:

- **OQ-02:** complete role-permission matrix.
- **OQ-08:** Approaching Expiry warning threshold.
- **OQ-09:** AI-suggested Low Stock threshold method.
- **OQ-10:** separate manual-discount stacking exceptions.
- **OQ-16:** supported Sales Report periods and filters.
- **OQ-17:** Product Demand category/overall comparisons.
- **OQ-18:** demand formulas and minimum AI/prediction history.
- **OQ-19:** profitability formula and refund treatment.
- **OQ-20:** whether AI Recommendations may include restocking quantities.
- **OQ-21:** fast-selling/slow-moving/rising-demand definitions and comparison periods.
- **OQ-22:** minimum evidence for AI recommendations.
- **OQ-23:** analytics, Stock Alert and AI response targets.
- **OQ-24:** interrupted recovery and reconciliation.
- **OQ-34:** Recorded versus Available Stock and stock-adjustment safeguards.
- **OQ-35:** refund-history viewing permissions.
- **OQ-40:** Receipt matching fields.
- **OQ-42:** required dashboard measures and refund treatment.
- **OQ-50:** currency, tax, rounding and remaining calculation order.
- **OQ-51:** server-clock precision and offer boundary testing.

Additional planning gates:

- exact barcode validation formats;
- current-location assignment presentation;
- stable Push identity and idempotency-token transport;
- scanner suffix and real-hardware verification;
- dashboard period and metric approval.

## 8. Recommended resolutions — engineering recommendations, not human approvals

1. **Keep a shared exact-lookup contract:** both scanners and manual barcode entry should submit the same opaque string value to one server lookup endpoint.
2. **Preserve barcode strings:** use strict string types and database string uniqueness; do not coerce to numbers or trim leading zeros.
3. **Separate UI lookup from authoritative stock:** lookup may display Available Stock only through a server-provided inventory contract.
4. **Implement location selection by canonical location ID:** do not use free-text reassignment when a location exists.
5. **Make location deletion an atomic workflow:** locations orchestrates catalog unassignment and location removal in one unit of work.
6. **Keep `Save Draft` separate from Push:** no stock change or Completed Sale occurs until the explicit finalization workflow is approved.
7. **Do not implement dashboard figures that are deferred:** initially produce only the shell and metrics that are explicitly approved.
8. **Record repeated-scan behavior explicitly:** the approved interaction should increment a Draft Bill quantity losslessly and prevent duplicate submission for one terminator.
9. **Keep NFR-01 testable:** define a real five-user scenario and measure barcode lookup, item addition and recalculation separately.
10. **Create one shared typed Product/Location/Lookup contract:** avoid role-based, client-side or module-specific copies of domain state.
11. **Use strict server-side authorization on every lookup and location-management route:** hiding navigation is insufficient.
12. **Add boundary tests:** barcode leading zeros, unknown lookups, location deletion/cancellation, filter clearing, Draft Bill editing and role denial.

These recommendations require human approval or formal plan readiness gates before implementation.

## 9. Implementation risks and constraints

- Unauthorized assumptions may hard-code unresolved permissions or dashboard measures.
- Numeric barcode coercion would corrupt leading zeros.
- Scanner global keyboard handling may steal focus or submit Enter repeatedly.
- Rapid scans may be dropped or incorrectly debounced.
- Location writes outside Catalog could bypass ownership boundaries.
- Draft Bill UI logic could mistakenly reserve or deduct stock.
- Dashboard values could invent, double-count or misclassify refunds.
- Offer data that is stale or client-derived could produce incorrect Draft Bills.
- A location filter could expose management-only data to Cashiers.
- Location deletion could silently reassign or remove products if not atomic.
- Browser-only role checks could permit direct unauthorized API requests.
- S16 could become scope creep if reference-website widgets or metrics are copied.
- NFR-01 claims must not be made without execution under the approved test profile.

## 10. Actual human feedback and clarifications

The following human-confirmed clarifications from this conversation apply:

- The existing three-tier layered modular monolith architecture is retained.
- `ADR/` is the standard ADR directory name.
- References to `ADRs/` are an inconsistency to be recorded and resolved during Stage 2.
- The proposed stack includes React, TypeScript, Vite, Tailwind CSS, Material UI, Lucide React, Framer Motion, Axios and Recharts on frontend; Node.js, Express.js and TypeScript on backend; PostgreSQL for central persistence.
- Strict TypeScript is required across frontend and backend.
- Physical USB HID barcode scanners, manual barcode entry and name lookup are explicitly required.
- Barcode values must be strings so leading zeros remain intact.
- DreamsPOS is visual inspiration only and must not supply features, sample data or dashboard metrics.
- The system is intended for one retail shop with central LAN hosting and multiple authorized workstations.
- All existing ADRs remain Proposed until evaluated and explicitly approved.
- Exactly 20 end-to-end vertical slices are required, five per engineer.
- Genuine AI interactions and individual Git contributions must be preserved.
- Stage 1 context is confirmed, but implementation has not been authorized.
- The proposed responsibility assignments S03/S05/S06/S09/S16 are for this engineer; they remain proposed until plan approval.
- No existing requirement, ADR or other engineer's file may be modified as part of this context review.

## 11. Baseline commit reference

- **Repository baseline commit:** `758ab9f511b2d6104d0648efbba92949ffa579f9`
- **Original planning context commit:** `60f94d86cc4446cad0d18da68065f746848acba0`
- **Target branch:** `feature-hassan`
- **Baseline source state:** the shared context baseline and planning documents exist; no application implementation has been created.

---

**Document classification summary:**

- **Confirmed requirements:** FR-01–FR-04, FR-08, FR-15–FR-16, NFR-01–NFR-04, architecture and role boundaries.
- **Human-confirmed clarifications:** listed in section 10.
- **AI recommendations:** section 8.
- **Unresolved decisions:** section 6 and Open Questions in section 7.

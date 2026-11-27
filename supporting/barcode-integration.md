# SmartPOS — USB HID Barcode Integration Design

**Status:** Approved design; physical scanner evidence is pending actual hardware availability.  
**Requirements:** FR-02, FR-03; slices S03 and S09, with S13 stock/Push integration.

## Approved behavior

- Support a physical USB HID keyboard-emulation scanner without proprietary drivers or browser hardware permissions for ordinary operation.
- Also support manual barcode entry and product-name lookup.
- Treat barcode as an opaque string throughout browser, shared contracts, API, CSV and PostgreSQL `text`; preserve leading zeros and do not coerce to numeric types.
- Use one authoritative product lookup contract for scan and manual entry. Unknown barcode shows clear feedback and permits name search; never auto-create a product.
- Enter is the default scanner terminator, subject to the actual scanner configuration.
- Repeated intentional scans of an already-added product increment Draft Bill quantity. Do not debounce away distinct scans; prevent duplicate handling of the same terminator event.
- Scanner handling is scoped to the dedicated input and must not intercept keys in dialogs, forms, text fields or quantity editors.
- Draft Bill scan/add never reserves/deducts stock. Push alone validates stock and commits sale/deduction atomically.

## Responsibility by slice

- **S03:** Catalog’s exact string lookup, manual barcode entry, product-name search, unknown-code response, duplicate registration validation and current-location lookup composition.
- **S09:** dedicated checkout scanner input, safe focus/terminator handling, lossless repeated scan quantity increment, Draft Bill line update/recalculation and explicit Save.
- **S12:** server offer re-evaluation in bill calculations; scanner cannot make offer state authoritative.
- **S13:** final stock validation, logical Push idempotency and exactly-once transaction. Failed stock/connection cases retain the saved Draft Bill and do not claim success.

## Verification

Automated tests: known scan/manual equivalence, leading-zero barcode, unknown code/name fallback, duplicate product barcode, rapid repeated scans, one terminator once, modal and quantity-editor focus, scanner unplugged/manual fallback, draft stock unchanged, insufficient stock, concurrent last unit, rollback and retry.

**Physical verification checklist (Pending):** record scanner manufacturer/model, USB connection, suffix/terminator configuration, workstation/OS/browser, date, valid/unknown/leading-zero/repeated scan results, focus behavior and manual fallback. Keyboard event simulation is not physical hardware verification. Never mark hardware testing passed unless performed on the actual device.


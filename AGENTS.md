# AGENTS.md — Instructions for AI Coding Agents

These instructions govern AI coding agents working on the **AI-Powered Smart POS and Inventory Management System**. Follow them for all implementation, refactoring, testing, documentation and dependency changes.

## 1. Product Intent and Source of Truth

The product is an in-store POS and inventory-management system for **one retail shop**. Its three system roles are Business Owner, Store Manager and Cashier. It supports product lookup and maintenance, Draft Bills and Completed Sales, inventory/expiry, eligible refunds and returns, CSV product import, current product storage locations, scheduled store-wide offers, reports, stock alerts, audit/history and advisory AI Insights.

Before changing behavior, read:

- `PRD.md` — authoritative product requirements, business rules, acceptance criteria and Open Questions. Use the repository-root `PRD.md` as the single canonical requirements baseline.
- `architecture.md` — the consolidated proposed architecture, component responsibilities, interfaces, invariants and unresolved decisions.
- `ADRs/ADR-001-architecture-style.md` through `ADRs/ADR-005-scheduled-offer-eligibility.md` — decision context, alternatives, rationale and consequences.

The PRD is authoritative for product behavior and unresolved requirements. ADRs describe the proposed architectural choices. The ADRs supplied with the project have **Proposed** status; do not represent them as formally approved. Do not silently resolve a PRD Open Question in code, tests, comments or documentation.

## 2. Architecture to Preserve

The selected proposed architecture is a **three-tier client–server, layered modular monolith**:

1. Presentation: role-aware web POS and management UI.
2. Business logic: one central authenticated application API and modular application/domain services.
3. Persistence: one central transactional relational database, accessed only by the server through controlled module-owned data interfaces.

The logical tiers may share a physical host; that does not remove their responsibility boundaries. The backend is one deployment unit, but it must remain a set of cohesive modules with explicit contracts.

### 2.1 Required module boundaries

Preserve these responsibilities and do not merge them into an undifferentiated business-logic layer:

- **Identity & Access:** authentication, three-role policy, server-side authorization and Owner-only user administration.
- **Product Catalog:** product identity, barcode, name, selling price, product lookup and product metadata. It does not own stock quantities.
- **CSV Import:** upload, schema/row validation, staging, duplicate and Replace/Skip decisions, confirmation, durable progress, retries and outcome reporting. It calls Catalog and Locations through their service interfaces.
- **Storage Locations:** canonical location records, normalization, current assignment rules, filtering and safe deletion/unassignment.
- **Billing (Draft Bills & Completed Sales):** bill preparation/calculation, explicit Draft Bill Save and authoritative Push orchestration. It coordinates Offers, Inventory and required Audit capture.
- **Scheduled Offers:** store-wide offer terms, schedules, cancellation, overlap protection and server-time eligibility.
- **Inventory & Expiry:** stock balances/movements, manual adjustments, Product Batch information (quantity, Expiry Date, purchase cost per unit) and authorized sale/return stock transitions.
- **Refunds & Returns:** refund eligibility, sale/line linkage, partial-unit tracking, refund statuses and returned-product/resellability state.
- **Reporting & Stock Alerts:** read-oriented reporting, product performance, dashboard and alert views based on committed facts/derived read models.
- **AI Insights:** advisory, evidence-linked recommendations, advisory Low Stock threshold suggestions and insufficient-data handling. It is not a purchasing or transaction authority.
- **Audit & Transaction History:** durable sensitive-action audit capture and controlled history views over authoritative sale/refund records.
- **Presentation UI:** interaction and transient view state only; it is not a trusted policy or persistence layer.

## 3. Dependency and Interface Rules

1. The UI communicates with the central application through the authenticated API. It must never connect directly to the database, contain database credentials, or be trusted to enforce permissions.
2. Business modules communicate through explicit application-service interfaces. Do not add direct dependencies that bypass a module's owning service or write directly to another module's tables.
3. A module owns its business invariants and data operations. Other modules request changes through its interface.
4. Keep database access behind server-side repositories/data interfaces with logical module ownership. A shared database does not mean unrestricted shared-table access.
5. Use synchronous in-process service calls for transaction-critical operations. Use durable background jobs only for workflows explicitly suited to asynchronous execution, such as confirmed CSV row processing and non-critical report/AI refreshes.
6. Background jobs must be durable, restartable and idempotent. They must not become the source of truth for sale completion, stock deduction or scheduled-offer eligibility.
7. Do not introduce a message broker, microservices, separate service databases, external integration or distributed transaction pattern without human approval and a new/updated ADR.

### 3.1 Explicit contracts following the architecture review

- **Catalog vs Locations:** Catalog owns the product record and its nullable `storage_location_id` reference; Locations owns canonical location records, normalization and location lifecycle/assignment policy. Locations invokes **Catalog's public assign/bulk-unassign contract** within a shared unit of work. **Never** execute `UPDATE catalog.products ...` from Locations, even if the database transaction can technically span schemas; only Catalog's repository edits Catalog tables.
- **Product-search composition:** An application/API-level read handler combines Catalog lookup and Locations current-location queries through **public read interfaces**. Cashiers may view the location in authorized product lookup; filter-by-location remains Owner/Manager only. This composer is **not** a separate deployable module or new database.
- **Audit vs Transaction History:** Billing and Refunds & Returns may call Audit's append port, but **Audit does not import Billing or Refunds**. Compose Transaction History using their public read interfaces in an API/application read handler, keeping the domain dependency graph acyclic.
- **Transaction context:** A cross-module coordinator may pass an **opaque unit-of-work reference**, not a raw database client or unrestricted SQL executor. Each owning repository joins the transaction via its own authorized adapter. Public contracts must not expose vendor-specific SQL access.
- **One logical Push:** Generate/retain one stable identity for the logical Push across retries and reloads; server binds that identity to the same actor, bill intent and committed outcome. A replay with changed payload must not make a second sale. The user-facing shortfall/payment resolution remains open.
- **Import job state:** CSV Import owns durable confirmed decisions, per-row attempt/progress and final result. A generic `platform/jobs` abstraction must not maintain an independent competing *business* job state; introduce a general job engine only if justified by actual workloads. Persist server-attested actor identity; never trust role strings supplied with a queued payload. Resolve the policy for job continuation after user revocation before implementing it.
- **Resource isolation:** NFR-01's **3-second target already exists** for each of four checkout operations, verified at 95% of measured operations with five concurrent users on a documented development machine. Bound import/report workers' CPU, memory and DB connection consumption; do not claim a passed latency test until it has been run under that profile.
- **No speculative scaffolding:** Do not mandate a schema-per-module database layout, generic money layer, full five-folder internal skeleton for each module, new test/lint/migration packages or persisted Draft Bills beyond the explicit Save behavior just because they appear in an agent-generated tree. First justify the need, avoid conflicting with OQ-31/OQ-50, and obtain approval for material technology choices.

## 4. Non-Negotiable Business and Architectural Invariants

### 4.1 Roles and authorization

- Exactly three system roles exist: **Business Owner**, **Store Manager**, and **Cashier**. “Authorized Inventory User” means Business Owner or Store Manager; it is not a fourth role.
- Enforce authorization on the server for every protected command and sensitive read. UI hiding is only a usability measure.
- Only the Business Owner manages user accounts and resets passwords.
- Cashiers may perform permitted billing (all three roles may Push a paid Draft Bill), submit eligible refund requests (the Owner/Manager approves or rejects them), and may view a product's current storage location during lookup. They may not import products, manage/change locations, manage offers, manually adjust stock, change prices, or access analytics, AI Insights or Audit Records.
- Owner/Manager permissions for CSV import, storage-location management and offer management are defined in FR-14–FR-16. For other incomplete permission details, consult the PRD Open Questions; do not guess.

### 4.2 Billing and inventory consistency

- **Push is the authoritative Completed Sale boundary.** Payment is received and checked outside the POS before Push.
- A Draft Bill is not a Completed Sale, is not included as a Completed Sale in Transaction History, and does not reserve or deduct stock.
- A successful Push must create the Completed Sale, apply its corresponding stock deduction exactly once, retain the applicable price/offer snapshot, and persist required traceability in one database transaction (or a single unit of work with equivalent atomic guarantees).
- Commit all required effects together or none. Use a stable unique operation identifier/idempotency key so retrying an interrupted Push cannot create a duplicate sale or stock deduction.
- Use database concurrency controls for competing stock updates. Insufficient stock rejects the Push with no Completed Sale or deduction and leaves the Draft Bill unchanged; for concurrent last-unit pushes only one commits and the other cashier is told: "This product is currently being sold in another transaction. Please refresh the stock and try again." (PRD FR-04).
- Stable Push identity is **per logical paid-bill finalization**, not per HTTP attempt. A duplicate-key check is insufficient if retries generate a new key; an existing key must not be accepted for different bill contents or actor context. Never silently re-run the write on a payload mismatch.
- Persist a Draft Bill only when the Cashier explicitly clicks Save; an unsaved draft is lost on a crash. A saved draft is still not a Completed Sale and does not reserve stock. Do not invent Resume/Confirm behavior beyond that.
- Never move the authoritative sale/stock commit to a background worker or eventual-consistency process.

### 4.3 CSV Product Import

- Accept `.csv` only and require the exact ordered header: `product_name,barcode,selling_price,storage_location`.
- `product_name`, `barcode` and `selling_price` are mandatory per row; `storage_location` is optional per row. A malformed header rejects the whole file; invalid rows can be rejected individually with reasons.
- Resolve duplicate Barcodes within the file first. The authorized user chooses the retained row for each duplicate group before retained rows are matched to existing products.
- Existing Barcode matches require an explicit **Replace** or **Skip** choice. Replace updates the four CSV fields; a blank location makes the product Unassigned. Skip leaves the existing product unchanged.
- Do not mutate products or locations during preview. Require explicit final confirmation after all decisions are resolved.
- Process confirmed rows through Catalog and Locations services. Persist job/row progress and commit each row's product mutation, optional location creation/assignment and success marker together.
- Retry an unexpected failed row up to three times after its initial attempt. Do not repeat already committed effects. Continue other eligible rows where possible and report final outcomes/reasons.
- CSV import must never change stock quantities. Do not impose a fixed product-count cap; do not invent an unapproved throughput guarantee.
- Re-check the intended existing-product match/identity and Barcode uniqueness at row commit after user confirmation; stale previews may not silently overwrite changed or different products. Keep the conflict UI behavior open if not specified.
- For background work, retain server-generated immutable job/row identity, confirmed decisions and actor attribution. Worker execution has only a scoped internal permission path to apply confirmed rows; the job may not elevate permissions based on client-supplied role fields. Revocation/deactivation after confirmation is a pending policy decision, not a default allow/deny assumption.
- Keep one authoritative import job/row status model; if generic infrastructure leases are used, they are execution mechanics only. A success marker and all row mutations must be committed in the **same transaction**. Limit worker resource use so checkout remains responsive.

### 4.4 Storage Locations

- Each Registered Product has zero or one current Storage Location. Unassigned is valid.
- Normalize capitalization and minor formatting differences deterministically. Do not fuzzy-match or autocorrect genuine spelling differences.
- Only Owner/Manager can create, rename, delete, assign or filter locations/products by location. Cashier can view the current location or Unassigned status during normal product lookup.
- Confirmed location deletion must atomically unassign associated products and delete the location. Preserve the products; do not choose a replacement or create movement history.
- Product-row updates belong to **Catalog's repository only**; Locations must call its public unassignment/assignment service within the shared unit of work, not issue foreign-table SQL. Filter-by-location and Cashier location viewing require separate authorization contracts.

### 4.5 Scheduled Authorized Offers

- Offers are **store-wide**, not product-specific. Supported types are Percentage Discount and Fixed-Amount Discount.
- Only Owner/Manager can create, edit, schedule or cancel offers. Cashiers can only use an offer that is effective during billing.
- No scheduled offer intervals may overlap. Serialize concurrent schedule writes and validate overlaps transactionally.
- Determine effective eligibility on the server using the start-inclusive/end-exclusive interval `start_time <= now < end_time`, unless cancelled. Do not rely on client clocks, a UI active flag or a timer job to determine eligibility.
- Re-evaluate the offer at Draft Bill calculation and again at Push. A Completed Sale retains the offer/price snapshot used at finalization; later edits never reprice historical sales.
- Pakistan Standard Time (PKT) is the canonical store timezone. A Percentage Discount is calculated from the bill subtotal and a Fixed-Amount Discount is subtracted from it, never exceeding the subtotal. Clock precision, tax, rounding, currency and calculation order remain open. Do not choose them without a product decision.

### 4.6 Refunds, returns, audit and AI

- Refunds must link to a verifiable Completed Sale and respect the 168-hour eligibility window. Prevent refunding the same returned units twice.
- Preserve the original sale. Keep Pending Refund/Completed Refund state separate from Returned Product/Resellable Product state.
- A returned unit must not enter Available Stock until the Business Owner or Store Manager confirms it resellable; the Cashier performs only the initial inspection. Do not invent handling for failed/interrupted external refund reversals or report treatment while OQ-13/OQ-14 remain open.
- Refund requests are submitted by the Cashier and start as Pending; the Owner/Manager approves or rejects them (Pending → Approved → Refunded, or Pending → Rejected). The approvable amount never exceeds the original amount actually paid minus amounts already Pending, Approved or Refunded; rejected requests release their reserved amount.
- Audit sensitive committed actions with actor, timestamp, action and relevant previous/new values. Do not implement Owner deletion or retention behavior beyond what the PRD resolves.
- AI Recommendations are advisory, evidence-based and uncertainty-aware. Report insufficient data rather than fabricate facts. AI must not block or roll back checkout, write authoritative stock/sales records, or place supplier orders.

## 5. Quality Attributes and Performance

- Preserve ASR-01/NFR-02: atomic, idempotent sale-and-stock consistency.
- Preserve ASR-02/NFR-03: centralized server-enforced role authorization.
- Preserve ASR-03/NFR-01: barcode recognition, adding an item, Draft Bill recalculation and Push have a recorded maximum response target of **three seconds each**, verified when at least 95% of measured operations meet it with five concurrent users on a documented development machine. Do not claim the target has been met without running that test.
- NFR-04/usability remains required: five participants across all three roles, one hour of training, and at least 90% completing their role's tasks without assistance; no task-time limit is imposed.
- Keep product lookup and checkout queries appropriately indexed and the synchronous Push path bounded. Do not invent concurrency, throughput, capacity or availability targets beyond the NFR-01 test profile.

## 6. Technologies and Deployment

The five architectural ADRs specify a layered modular monolith with centralized transactional relational persistence; they do **not** mandate a programming language, framework, ORM, specific database vendor, cloud platform, AI model, scanner protocol or hardware. Material technology selections require an explicit project decision and must not be inferred from a sample folder structure.

- Do not add a framework, runtime, database, ORM, hosted AI provider, external identity provider, cloud service or other material dependency without human approval and an ADR explaining the need and trade-offs.
- A central server and controlled shop network/LAN are provisional deployment assumptions only. Offline operation, final network/hardware, high availability, backup cadence, RPO and RTO remain open under OQ-27.
- No payment gateway, supplier service, e-commerce, customer account, external SSO, email/SMS or other third-party integration is required by current scope.

## 7. Project Structure and Coding Conventions

The architecture defines logical modules and boundaries, not a mandatory filesystem layout or language-specific naming convention.

- First inspect the existing repository and follow its established language, framework, naming, formatting, test and build conventions where they do not conflict with this document or an approved ADR.
- Keep source code grouped by the logical module responsibilities in `architecture.md`. Do not scatter a module's business rules across unrelated UI, API and persistence code.
- **Canonical documentation layout for this handoff:** repository root `PRD.md`, `architecture.md`, `AGENTS.md` and `ADRs/`. Do not duplicate the canonical PRD under a second file name. A `docs/` layout is allowed only if every internal link/instruction is changed coherently.
- A logical module boundary does **not** require one database schema per module, a full layered folder template, or a separate service/process. Keep physical layout minimal and testable.
- Keep transport/API handlers thin: authenticate/authorize, validate the request shape, call the owning application service, and map the result. Put business invariants in the owning module/service, not in UI components or route handlers.
- Keep persistence mapping and queries behind data-access interfaces. Avoid leaking database-specific objects into the presentation layer or unrelated modules.
- Name domain concepts using the PRD glossary: Draft Bill, Completed Sale, Recorded Stock, Available Stock, Returned Product, Resellable Product, Pending Refund, Completed Refund, Authorized Offer, Storage Location and AI Recommendation. Do not use “Pending Bill” or “Reserved Stock” for excluded workflows.
- Add or update automated tests at module boundaries for authorization, transactional consistency, idempotency, import recovery, location deletion, offer time boundaries and refund/return rules when defined.
- Do not create a new top-level architectural layer, module, service or shared utility that bypasses module ownership without documenting the boundary and obtaining review.

### 7.1 Initial project structure and public interfaces

The canonical repository layout is given in `architecture.md` Section 12. Keep root `PRD.md`, `architecture.md`, `AGENTS.md` and `ADRs/` together. Separate `client/` from `server/`, expose protected use cases from `server/api/routes/`, and use only the two application-level read composers (`product-search`, `transaction-history`) where needed. Within `server/modules/`, keep the eleven capability modules defined in Section 2.1.

A module should start with only the necessary **public interface**, **service** and **repository** responsibilities. A new shared utility, generic job runner, module-level database schema or folder hierarchy is not required by this architecture. The `infrastructure/` layer is business-rule-free and does not depend on business modules. Only a module's own repository may write its data; never expose a database driver or SQL client through public service contracts.

## 8. Human Approval Required

Stop and request human/product-owner approval before:

- Changing an ADR decision or changing an ADR's status.
- Introducing a new language/framework, database, ORM, cloud platform, external service, AI provider/model, message broker, microservice or separate data store. No technology-stack ADR is part of the five recorded architectural decisions.
- Changing module ownership, introducing cross-module direct database writes, changing the API/database trust boundary, or changing the modular-monolith deployment model.
- Changing role definitions, permissions, authentication/session policy, or audit deletion/retention behavior where unresolved.
- Changing the Push transaction boundary, sale/stock consistency, retry/idempotency semantics or Draft Bill behavior.
- Changing CSV schema, duplicate-resolution order, preview/confirmation, retry count, stock isolation or row-commit semantics.
- Changing the one-current-location rule, normalization behavior, or deletion/unassignment semantics.
- Changing store-wide offer applicability, non-overlap, start/end boundary semantics or final Push re-evaluation.
- Deciding unresolved product rules such as expiry thresholds, handling of failed/interrupted refund reversals, monetary rounding/tax/currency, AI correctness, workload targets beyond NFR-01, offline operation, backups or recovery objectives.
- Adding any in-scope or out-of-scope capability that materially changes product scope.

A human approval should be reflected in the PRD and/or an ADR as appropriate before implementation proceeds.

## 9. Ambiguity, Conflicts and Change Handling

When requirements or documents are ambiguous or appear to conflict:

1. Stop before encoding a consequential assumption.
2. Check the relevant PRD requirement, business rule, acceptance criteria and Section 14 Open Question.
3. Check `architecture.md` and the relevant ADR for the architectural intent and decision status.
4. The PRD controls product behavior; an ADR controls its documented architectural decision only within its stated scope. Do not use an architectural preference to silently override a product requirement.
5. If a detailed, later PRD decision explicitly supersedes earlier high-level wording, follow the detailed decision as the PRD states (for example, CSV `storage_location` is optional per row, and offers are store-wide).
6. If the conflict remains, report the exact conflicting statements, affected FR/NFR/ADR and implementation consequence; ask for a human decision. Do not choose whichever option is easiest to code.
7. Do not mark an ADR Accepted/Approved or close an Open Question on behalf of the team.

For non-consequential implementation details that are genuinely unspecified, choose the smallest reversible option consistent with existing repository conventions and module boundaries, document the assumption, and avoid turning it into a new product guarantee.

## 10. Required Working Procedure for Agents

For each task:

1. Identify the affected FR/NFR, acceptance criteria, business rules and relevant Open Questions in the PRD.
2. Identify affected modules, interfaces, data ownership and constraints in `architecture.md`.
3. Read and respect relevant ADRs. If a task changes an ADR decision, request human approval first.
4. Make the smallest change within the owning module. Preserve public contracts and existing behavior outside the task scope.
5. Add/update unit and integration tests, including negative authorization and retry/failure cases where relevant.
6. Check that no forbidden cross-module dependency, direct client/database access, stock mutation from CSV, or asynchronous sale commit has been introduced. In particular: **no Locations→Catalog SQL**, **no Audit↔Billing/Refunds cycle**, **no raw DB client in public contracts**, and **no unapproved libraries or persisted-draft assumptions**.
7. Report files changed, requirements addressed, tests run/results, assumptions, and any unresolved question or decision requiring human input.

## 11. Reference Documents

- `PRD.md` — authoritative requirements, rules, acceptance criteria and open questions.
- `architecture.md` — consolidated proposed architecture.
- `ADRs/ADR-001-architecture-style.md` — three-tier layered modular monolith.
- `ADRs/ADR-002-data-persistence.md` — central relational persistence and atomic sale/stock commit.
- `ADRs/ADR-003-authentication-boundary.md` — central authentication and server-enforced authorization.
- `ADRs/ADR-004-csv-import-recovery.md` — staged, durable, idempotent CSV import.
- `ADRs/ADR-005-scheduled-offer-eligibility.md` — server-authoritative offer-time evaluation.

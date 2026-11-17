# Major Architecture Decisions

**Project:** AI-Powered Smart POS and Inventory Management System  
**Reference:** Final Validated PRD (FR-01 to FR-16 and NFR-01 to NFR-04)  
**Scope:** One retail shop  
**Status:** Initial architectural direction for group review

## 1. Architectural requirements and drivers

The following requirements have the greatest effect on the system structure. Not every functional or non-functional requirement needs a separate architectural decision.

| Source requirement | Why it matters | Main concern |
|---|---|---|
| ASR-01 / NFR-02 | A Completed Sale and its stock deduction must stay consistent, including after a retry or interruption. | Atomic transactions, data integrity and recovery. |
| ASR-02 / NFR-03 | Business Owner, Store Manager and Cashier have different permissions. | Trusted server-side access control. |
| ASR-03 / NFR-01 | Routine checkout operations have a 3-second target (at least 95% of measured operations, five concurrent users). | Responsive lookup, billing and Push operations. |
| FR-14 | CSV imports require preview, validation, duplicate choices and recovery. | Reliable bulk processing without blocking checkout. |
| FR-15 | A product may have one current Storage Location or be Unassigned. | Controlled assignments and safe deletion. |
| FR-16 | Store-wide offers must not overlap or apply outside their scheduled periods. | Accurate time-based pricing. |
| FR-04, FR-11 to FR-13 | Sales, refunds, returns and records must remain traceable. | Defined transaction and data responsibilities. |
| FR-07 to FR-10 | Reports, alerts and recommendations use sales and inventory information. | Read-oriented functions separate from checkout. |
| Single-shop constraints | The system has no online ordering, payment gateway or supplier-ordering feature. | Modest deployment and limited external dependencies. |

## 2. Major architectural choices

| Driver | Alternatives considered | Trade-offs | Selected direction |
|---|---|---|---|
| ASR-01, ASR-02, single-shop scope | Layered modular monolith, microservices, direct database access from clients | Microservices add deployment and coordination complexity. Direct database access makes security harder to enforce. | Three-tier client-server architecture with one modular backend application. |
| ASR-01, FR-04 | Relational database, local files, separate databases | A central database is a dependency, but allows related sales and inventory updates to commit together. | One transactional relational database with controlled module-owned data access. |
| ASR-02, FR-01 | UI-only restrictions, scattered checks, central server authorization | Server checks add shared policy work but protect operations even if a user bypasses the interface. | Authentication and role permissions enforced by the application server. |
| FR-14, ASR-03 | Process the whole CSV in one request, or preview and process confirmed rows in the background | Staging needs progress records but improves recovery and keeps checkout responsive. | Dedicated CSV Import module with preview, confirmation and recoverable row processing. |
| FR-15 | Free-text locations, or shared normalized location records | Normalized records need controlled relationships but prevent inconsistent assignments. | Separate Storage Locations module with canonical locations and optional current product assignment. |
| FR-16 | Client clock, scheduled active flag, or server-time eligibility checks | Checking effective time during billing adds a small amount of work but avoids stale offer status. | Offers checked using server-controlled time during bill calculation and again at Push. |
| ASR-03, FR-07 to FR-10, FR-14 | Run all work during checkout, or separate noncritical work from checkout | Isolating noncritical work requires coordination but protects the checkout path. | Keep checkout processing short; run imports and reporting work without blocking sales. |

## 3. Main components and responsibilities

The system has three tiers: presentation, business logic and persistence. The business logic is divided into the following modules within one backend application.

| Component | Main responsibility |
|---|---|
| Presentation UI | Screens for the Business Owner, Store Manager and Cashier. |
| Identity and Access | Login, roles, account management and permission checks. |
| Product Catalog | Product identity, barcode, name, selling price, category and product lookup. |
| CSV Import | Upload, validation, preview, user choices, confirmation and import results. |
| Storage Locations | Location names, normalization, assignment, filtering and deletion. |
| Billing and Sales | Draft Bill calculation and Save, Push and Completed Sale records. |
| Inventory and Expiry | Stock records, adjustments, stock movements, and product batches with expiry date and purchase cost. |
| Scheduled Offers | Offer schedules, discount terms and time-based eligibility. |
| Refunds and Returns | Sale-linked refunds, approval status, returned units and resellability handling. |
| Reporting and Alerts | Sales and stock reports, product analysis and alerts. |
| AI Insights | Advisory recommendations and suggested Low Stock thresholds based on available evidence. |
| Audit and History | Sensitive-action records and controlled transaction-history views. |

## 4. Boundaries, interfaces and data ownership

- The UI sends requests to an authenticated application interface. It does not read or write the database directly.
- Each business module exposes a public service interface. Other modules cannot update its private tables or internal data directly.
- Product Catalog owns product records, including the current location reference. Storage Locations manages location rules and requests product assignment changes through Catalog's interface.
- CSV Import calls Catalog and Storage Locations after the user confirms the import. It cannot change stock quantities. Each successful row and its completion record must be committed consistently.
- Billing obtains product information, effective offers and stock changes through the owning modules. A Completed Sale, its stock deduction and required audit record commit together. A Draft Bill does not deduct or reserve stock and is stored only when the Cashier explicitly saves it. A Push with insufficient stock is rejected and leaves the Draft Bill unchanged.
- Refunds and Returns uses existing sale records and Inventory interfaces. The Cashier submits refund requests and the Business Owner or Store Manager approves or rejects them. The Cashier inspects returned products first; they do not become Available Stock until the Business Owner or Store Manager confirms them as resellable.
- Transaction History brings together authorized sale, refund and audit information without allowing the Audit module to change other modules' records.
- Reporting and AI Insights read operational information but cannot modify sales, stock or purchases. Checkout must not wait for these functions.
- Only Business Owner and Store Manager can manage Storage Locations, import products or change offer schedules. Cashiers may view a product's location during permitted lookup but cannot filter the inventory list by location.

## 5. External systems and constraints

- Payment is received and verified outside the POS. The system does not connect to a payment gateway.
- The system is for one retail shop, not an online store or a multi-branch platform.
- Supplier ordering, customer accounts and automatic purchasing are outside the scope.
- A message broker, separate service databases and independent microservices are not needed for the current scope.
- No specific programming language, framework, database vendor or deployment platform is selected by these decisions.

## 6. Matters requiring later clarification

The PRD leaves some details open, including the Approaching Expiry warning period, the method for AI-suggested Low Stock thresholds, handling of failed or interrupted external refund reversals, report treatment of refunds and returns, detailed crash recovery, currency, tax and rounding rules, server clock precision, the relationship between Recorded Stock and Available Stock, remaining role permissions, audit deletion and retention, and final deployment and recovery conditions. These should not be treated as decided until their requirements are clarified.

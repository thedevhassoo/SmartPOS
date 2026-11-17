# Initial Codebase and Project Structure Proposal

## 1. Purpose

This document proposes an initial repository structure for the
AI-Powered Smart POS and Inventory Management System. The goal is to
check whether the architectural context is sufficiently clear to guide
implementation while preserving the boundaries and responsibilities
defined in the architecture.

The proposal follows the logical repository structure and module
boundaries in the architecture. It does not select a programming
language, framework, database vendor, ORM, or deployment platform
because those decisions are not specified.

## 2. Proposed Repository Structure

``` text
smartpos/
|-- PRD.md
|-- architecture.md
|-- AGENTS.md
|-- ADRs/
|   |-- ADR-001-architecture-style.md
|   |-- ADR-002-data-persistence.md
|   |-- ADR-003-authentication-boundary.md
|   |-- ADR-004-csv-import-recovery.md
|   `-- ADR-005-scheduled-offer-eligibility.md
|-- client/
|   `-- src/
|       |-- app/
|       |-- api/
|       `-- features/
|           |-- billing/
|           |-- catalog/
|           |-- csv-import/
|           |-- inventory/
|           |-- locations/
|           |-- offers/
|           |-- refunds-returns/
|           |-- reporting/
|           `-- shared/
|-- server/
|   |-- infrastructure/
|   |   |-- db/
|   |   |-- unit-of-work/
|   |   `-- clock/
|   |-- api/
|   |   |-- routes/
|   |   `-- composers/
|   |       |-- product-search/
|   |       `-- transaction-history/
|   `-- modules/
|       |-- identity-access/
|       |-- catalog/
|       |-- csv-import/
|       |-- storage-locations/
|       |-- billing/
|       |-- offers/
|       |-- inventory/
|       |-- refunds-returns/
|       |-- reporting-alerts/
|       |-- ai-insights/
|       `-- audit/
`-- tests/
    |-- architecture/
    |-- integration/
    `-- acceptance/
```

The server structure follows the architecture's canonical logical
repository structure. The client feature folders and test subfolders are
organizational suggestions that can be adjusted without changing the
server-side architectural boundaries.

## 3. Responsibility of Each Main Area

### 3.1 Client

The client contains the user interface and presentation logic.

-   `app/` contains application startup, navigation, and role-aware
    presentation.
-   `api/` contains the server request client. It must not access the
    database directly.
-   `features/` contains domain-aligned user interface features such as
    billing, catalog, inventory, locations, offers, CSV import, refunds,
    and reporting.
-   `shared/` contains reusable presentation components and client
    utilities that do not own business rules.

The client may hide or disable actions based on a user's role for
usability. This is not a security boundary. The server must authorize
every protected operation and read.

### 3.2 Server API

The API layer accepts requests, performs authentication and
authorization checks, validates request-level data, and invokes
application services.

-   `routes/` contains thin request handlers.
-   `composers/product-search/` combines Catalog and Locations read
    ports to produce product search responses.
-   `composers/transaction-history/` combines Billing, Refunds, and
    Audit read ports to produce transaction history responses.

Routes and composers should not contain business rules or directly
access module-owned database tables.

### 3.3 Server Infrastructure

Infrastructure provides technical capabilities shared by the
application.

-   `db/` contains shared database connection and transaction plumbing
    only.
-   `unit-of-work/` coordinates an opaque transaction across modules.
-   `clock/` provides a consistent server-side time source for offer
    eligibility.

Infrastructure must not depend on business modules. Public module
interfaces should not expose raw database connections.

### 3.4 Server Modules

Each module owns its business rules and persistence boundary. A module
should initially contain a public interface, a service, and a
repository. Additional internal folders should be introduced only when
justified.

The modules are:

-   `identity-access/`: identity, roles, authentication, and
    authorization boundaries.
-   `catalog/`: product information and product-related business rules.
-   `csv-import/`: import jobs, row decisions, progress, and recovery
    state.
-   `storage-locations/`: canonical storage locations and
    product-location assignment.
-   `billing/`: bill calculation and sale completion.
-   `offers/`: scheduled offers and offer eligibility.
-   `inventory/`: stock records, deductions, and authorized stock
    adjustments.
-   `refunds-returns/`: sale-linked refunds and return-condition
    handling.
-   `reporting-alerts/`: reporting and alert read models.
-   `ai-insights/`: advisory insights based on reporting evidence.
-   `audit/`: append and read interfaces for audit records.

## 4. Important Module Boundaries

Modules must communicate through public interfaces. A module must not
import another module's private repository, issue SQL against another
module's tables, or pass unrestricted database connections through
public interfaces.

### 4.1 Billing and Inventory

A completed sale requires Billing to coordinate the required work with
Catalog, Offers, Inventory, and Audit.

``` text
Client
  |
  v
API Route
  |
  v
Billing Service
  |---- Catalog public read port
  |---- Offers public read port
  |---- Inventory deduction port
  `---- Audit append port
           |
           v
      Unit of Work
           |
           v
      Database transaction
```

The sale record, stock deduction, and required audit record must commit
atomically. The Push operation must be idempotent so that retries do not
create duplicate sales or deductions.

### 4.2 Locations and Catalog

Locations owns location records and assignment behavior. Catalog owns
product records.

Locations may call a Catalog public port to assign or bulk-unassign
products. Catalog remains the only module that writes product rows.
Deleting a location and unassigning its products must happen in the same
unit of work.

### 4.3 CSV Import

CSV Import owns durable import job and row state. It coordinates product
creation or replacement through Catalog and location resolution or
assignment through Locations.

``` text
CSV Upload
  |
  v
Import Preview
  |
  v
Duplicate and Matching Decisions
  |
  v
Explicit Confirmation
  |
  v
Immutable Confirmed Job
  |
  v
Row Processing
  |
  v
Catalog and Locations public ports
```

Confirmed row effects and the corresponding success marker must be
committed in the same transaction. Processing must be idempotent and
resource-bounded so that imports do not starve synchronous checkout
operations.

An optional in-process worker may execute confirmed immutable jobs. The
architecture does not require a message broker or a second authoritative
import state.

### 4.4 Reporting and AI Insights

Reporting and Alerts reads from the public read contracts of Catalog,
Inventory, Billing, and Refunds. It is read-only.

AI Insights consumes reporting evidence and provides advisory output. It
must not change sales, stock, refunds, or other operational records. It
should be able to report when the available evidence is insufficient.

### 4.5 Audit

Audit provides append and read ports. It must not depend on Billing or
Refunds. Other modules call the Audit append interface when an auditable
event is required.

## 5. Dependency Rules

The intended dependency direction is:

-   Billing may read Catalog and Offers, request Inventory deductions,
    and append Audit records.
-   Locations may call the Catalog public assignment and
    bulk-unassignment interface.
-   CSV Import may call Catalog and Locations public interfaces and
    append Audit records for sensitive product changes.
-   Refunds and Returns may verify a sale through Billing, request an
    authorized return-to-stock operation from Inventory, and append
    Audit records.
-   Reporting and Alerts may read Catalog, Inventory, Billing, and
    Refunds through public read contracts.
-   AI Insights may consume Reporting evidence and remains advisory.
-   API composers may combine public read ports but do not own domain
    rules.
-   Audit does not import Billing or Refunds.
-   Infrastructure does not import business modules.
-   The client communicates with the server API and never connects
    directly to the database.

## 6. Key Architectural Constraints

### 6.1 Sale Completion

-   Sale completion and stock deduction must be atomic.
-   A logical Push operation must execute exactly once despite network
    retries or reloads.
-   A reused Push identifier with changed request content must not
    trigger a second write.
-   Database integrity constraints and concurrency controls must protect
    stock and sale consistency.
-   The exact transport mechanism for the idempotency token remains
    undecided.
-   Insufficient stock rejects the Push with no sale or deduction and
    leaves the Draft Bill unchanged. For concurrent pushes of the last
    unit, only one commits.

### 6.2 Draft Bills

A Draft Bill is not a completed sale and must not reserve or deduct
stock.

A Draft Bill is persisted only when the Cashier explicitly saves it; an
unsaved Draft Bill is lost if the system crashes. The architecture does
not prescribe a table design for saved drafts, and Resume behavior
should not be assumed in the initial codebase.

### 6.3 Authorization

The server must authorize every protected operation and read.
Client-side role-aware presentation is for usability only and cannot
replace server-side authorization.

### 6.4 CSV Import

-   The required header is exactly
    `product_name,barcode,selling_price,storage_location`.
-   Rows must be validated before confirmation.
-   Duplicate groups must be resolved before matching existing products.
-   Replace and Skip decisions must be supported.
-   The user must preview and explicitly confirm the import.
-   Confirmed decisions must be immutable and server-attested to the
    actor.
-   Stale previews must be rechecked.
-   Row writes must be idempotent.
-   The retry policy allows up to three retries after the initial
    attempt.
-   CSV import must not change stock.

### 6.5 Storage Locations

-   Location names are normalized into canonical locations.
-   A product has zero or one current location.
-   The product's location reference may be null.
-   Confirmed location deletion unassigns affected products atomically.
-   Deleting a location does not delete products or assign replacement
    locations.
-   Cashiers may view a product location during lookup but cannot filter
    inventory by location.

### 6.6 Offers

-   Offer eligibility is evaluated using server time.
-   The active interval is start less than or equal to now and now less
    than end.
-   Cancelled offers are not eligible.
-   The store timezone is Pakistan Standard Time (PKT), and discounts
    are calculated from the bill subtotal.
-   Overlapping schedule writes require serialization.
-   Eligibility is evaluated during bill calculation and again at Push.
-   The applied offer details must be preserved as an immutable sale
    snapshot.
-   Later offer changes must not retroactively reprice completed sales.

### 6.7 Refunds and Returns

-   Refunds are linked to the original sale.
-   The stated refund eligibility window is 168 hours.
-   The Cashier submits refund requests; the Business Owner or Store
    Manager approves or rejects them (Pending to Approved to Refunded,
    or Pending to Rejected).
-   Duplicate refunded units must be prevented.
-   The original sale remains preserved.
-   Monetary refund status and product return condition or resellability
    are separate concepts.

### 6.8 Reporting and AI

Reporting and Alerts is read-only. AI Insights is advisory and
evidence-linked. AI output must not directly perform operational
changes.

## 7. Testing Structure

The `tests/` directory can be organized into three broad areas.

### 7.1 Architecture Tests

Verify that:

-   Modules do not import other modules' private repositories.
-   Modules do not access another module's tables directly.
-   Infrastructure does not depend on business modules.
-   The client does not access the database.
-   API routes remain thin and use public service interfaces.

### 7.2 Integration Tests

Verify cross-module behavior, including:

-   Sale completion, stock deduction, and audit append in one
    transaction.
-   Push idempotency and retry behavior.
-   Location deletion and product unassignment in one unit of work.
-   CSV row effects and success markers committed together.
-   Refund eligibility and duplicate-unit prevention.
-   Offer eligibility at bill calculation and Push.

### 7.3 Acceptance Tests

Verify the user-visible requirements, including:

-   Product lookup and billing flows.
-   Draft Bill behavior.
-   CSV preview, confirmation, progress, and recovery.
-   Location management.
-   Offer scheduling and application.
-   Refund and return workflows.
-   Reporting and advisory AI behavior.

Performance requirements should be tested against a defined workload and
measurement method. NFR-01 defines this as five concurrent users on a
documented development machine, with at least 95% of measured
operations within three seconds.

## 8. Decisions That Should Not Be Assumed

The architecture and PRD leave several implementation choices open. The
initial codebase should preserve these as decisions to be made rather
than silently choosing values.

Examples include:

-   Programming language and application framework.
-   Database vendor and persistence technology.
-   Authentication and session design.
-   Clock synchronization and precision.
-   Money arithmetic and rounding rules.
-   The precise meaning of Available versus Recorded Stock.
-   Draft Bill storage design beyond explicit Save.
-   Idempotency token transport.
-   Handling of failed or interrupted external refund reversals.
-   Deployment and recovery behavior.
-   Offline behavior and hardware availability.
-   AI provider and model.

The proposed central application and transactional relational database
are architectural direction, but the specific technologies are not
selected. The central shop-hosted deployment on a controlled network is
a working proposal rather than a confirmed deployment decision.

## 9. Architecture Readiness Assessment

The supplied context is sufficient to understand the intended logical
structure, module responsibilities, dependency direction, and important
transaction boundaries. It is also sufficient to propose a
technology-neutral initial repository structure.

It is not yet sufficient to generate a complete technology-specific
implementation without making assumptions. The individual ADR files are
referenced by the architecture, but their contents were not included in
the supplied materials. The ADRs are described as proposed and pending
approval.

## 10. Recommended Next Steps

1.  Confirm that the proposed repository structure reflects the intended
    architecture.
2.  Review and approve the ADRs before treating proposed decisions as
    settled.
3.  Define the public service contracts for the modules involved in
    cross-module workflows.
4.  Resolve implementation-blocking open questions before implementing
    the affected features.
5.  Add architecture tests early so that module boundaries remain
    enforceable.
6.  Select the language, framework, database, and deployment approach
    through explicit decisions rather than assumptions.

## 11. Conclusion

The architecture provides a clear enough foundation for a
technology-neutral project structure and for defining module boundaries.
The most important implementation rule is that business modules own
their data and rules, communicate through public interfaces, and
coordinate multi-module atomic work through an opaque unit-of-work
abstraction.

The next stage should validate the proposed structure and settle the
outstanding architectural decisions before detailed implementation
begins.

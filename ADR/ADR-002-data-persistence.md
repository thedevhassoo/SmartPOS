# ADR-002 — Central Relational Persistence and Atomic Sale/Stock Commit

**Status:** Proposed  
**Date:** 2026-11-10  
**Decision scope:** Data ownership, transactional consistency, concurrency and recovery  
**ASRs / drivers:** ASR-01 (NFR-02), ASR-03 (NFR-01); FR-04, FR-05, FR-11–FR-15, FR-16; CON-06.

## Context

A successful **Push** must create one Completed Sale **and** the associated inventory deduction exactly once. Draft Bills must not reserve or deduct stock, and a Draft Bill is persisted only when the Cashier explicitly saves it. Crash recovery, concurrent checkout, partial refunds, product imports and Storage Location deletion create additional consistency and referential-integrity concerns. Product/reporting data must remain traceable, and the architecture should not require distributed transactions to perform ordinary in-store operations.

The PRD defines last-unit and insufficient-stock handling (FR-04) and the refund status transitions (FR-11), but leaves failed or interrupted external refund reversals (OQ-13), report treatment of refunds/returns (OQ-14), detailed crash recovery (OQ-24) and the relationship of Recorded to Available Stock (OQ-34) unresolved. Those questions do not remove the established requirement for sale/stock consistency.

## Alternatives considered

| Alternative | Benefits | Costs / risks |
|---|---|---|
| **One transactional relational database, module-owned data** | ACID transactions, referential integrity, unique constraints and efficient joined queries. | Central dependency; logical ownership must be actively enforced; backup and recovery needed. |
| **Separate database per service** | Strong isolation and future independent scaling. | Distributed transactions or reconciliation become necessary for sale/stock consistency; more operational effort. |
| **Local files or independent workstation databases** | May reduce central-server dependency in an offline design. | Conflicting copies, hard synchronization and difficult concurrency control; no approved offline requirement. |
| **Eventual-consistency sale event followed by stock update** | Decouples writes and can improve throughput. | Can temporarily or permanently show a sale without its required deduction if recovery fails. |

## Decision

Use **one central transactional relational database**, with each business module assigned **logical ownership** of its tables and repository operations. Cross-module access to business data is coordinated through application services rather than arbitrary writes to another module's tables.

The authoritative **Push** operation is one server-controlled transaction boundary:

1. Verify that the actor may Push and that the intended operation is not already committed.
2. Re-evaluate authoritative product, quantity and offer information for the final bill.
3. In **one database transaction**, record the Completed Sale and sale lines (including applicable price/offer snapshot), apply the corresponding stock deduction once, and record traceability that must be consistent with the commit.
4. Commit all required effects together, or commit none. Associate the request with a stable **unique operation identifier** so an interrupted retry cannot repeat a previously committed sale/deduction.
5. Use transactional concurrency controls for simultaneous attempts affecting the same stock, so that only one concurrent Push for the last available unit commits. If the requested quantity exceeds Available Stock, reject the Push with no Completed Sale or stock deduction and leave the Draft Bill unchanged; the losing cashier of a concurrent last-unit conflict is asked to refresh the stock and retry (PRD FR-04).

Model related data with enforceable references and integrity constraints. For example, each product references **zero or one** current Storage Location; confirmed deletion unassigns referencing products and removes the location **atomically** without deleting the products. CSV import and Refund/Return modules retain their own durable, linked records; an import must not modify stock quantities, and returned units must not become Available Stock before the required resellability decision.

## Ownership-safe transaction contracts

**A shared database transaction does not transfer ownership.** An orchestrating application use case passes an **opaque unit-of-work reference** to the public service interfaces of the affected modules. Only each module's own persistence adapter can use the underlying database connection to read/write its owned tables. In particular, Locations must not directly run SQL against Catalog's product table: for confirmed deletion it invokes the **Catalog bulk-unassign port** within the same unit of work, then deletes its own Location record. Cross-module referential constraints are permitted as integrity safeguards; they do not authorize another module's ad hoc writes.

Billing coordinates Inventory's stock deduction and Audit's mandatory append in the same transaction. A stable **logical-Push identifier** is reused for retries, including retries after lost responses or reloads, and is tied to the **same bill intent and authorized actor**; a repeated identifier with different payload must not perform another commit. The token-transport/persistence method and user-facing conflict response remain detailed-design or product-decision gates, respectively. Audit must expose a write port with **no reverse import of Billing/Refunds**; authorized Transaction History is composed through application-level read ports to avoid cyclic dependencies.

A Draft Bill is persisted only on an explicit Cashier Save, as the PRD specifies; its physical schema, selection of a specific relational database vendor, physical schema-per-module and a concrete SQL library are **not decisions of ADR-002**. The project technology-approval process remains the relevant decision gate.

## Rationale

Central relational transactions fit a single-store system and directly protect ASR-01. They prevent partial Completed Sale commits, support reliable reconciliation after interruption, and make uniqueness and foreign-key constraints enforceable. Explicit module data ownership retains maintainability without incurring multi-database transaction complexity. Having the application server own database credentials also aligns with ADR-003.

**Data ownership boundaries (logical):** Identity & Access → users/roles; Catalog → products/barcodes/prices; Inventory → quantities/expiry; Locations → normalized location records; Billing → Draft Bills/Completed Sales/sale lines; Offers → schedules/discount terms; CSV Import → staging and row outcomes; Refunds & Returns → linked refund/return records; Audit → sensitive activity; Reporting/AI → derived read-only data.

## Trade-offs / consequences

**Positive:** Strong integrity; predictable recovery of partially interrupted operations; no distributed transaction coordinator; safe location deletion; consistent sales and inventory records.

**Negative:** A central database is a potential single point of failure; synchronous writes can create contention at peak times; data migrations need coordination across modules. Idempotency bookkeeping and concurrency tests add effort.

**Architectural constraints / safeguards:**

- Never treat a Draft Bill as a Completed Sale or stock reservation.
- Do not let background jobs complete or duplicate the sale/stock commit.
- Preserve existing sales when later editing an offer or recording a refund.
- Keep refund monetary state distinct from returned-item resellability and Available Stock.
- Use indexed lookup and short transactions to support the 3-second POS target, measured under the NFR-01 test profile (five concurrent users, documented development machine).
- Backup schedule, recovery time and acceptable data loss are **not yet defined**, so no RPO/RTO is asserted.

## Traceability and related decisions

- **ADR-001:** three-tier modular application and central persistence tier.
- **ADR-003:** server-only database access.
- **ADR-004:** idempotent import row commits.
- **ADR-005:** transactional prevention of overlapping offers and final bill snapshots.
- Sources: `PRD.md`, `architecture.md`; PRD NFR-02, FR-04/05/11–FR-16, §14 and §16.

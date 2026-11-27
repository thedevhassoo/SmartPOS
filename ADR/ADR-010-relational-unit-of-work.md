# ADR-010 - Relational persistence with conservative unit of work

Status: Proposed implementation decision requiring actual review. Supersedes the earlier prototype approach in ADR-009 for this source candidate; does not rewrite historical decisions.

Context: the previous handoff used generic JSONB entity records. The rebuilt source uses normalized PostgreSQL tables and child rows with primary/foreign keys, unique and check constraints and offer exclusion. JSONB remains for historical offer and audit snapshots. One checked-out pg client reads and writes within a transaction; a single lock row serializes operations to protect stock, refunds and idempotency. The repositories compute changes from a shared typed state projection.

Alternatives: (1) fine-grained module-owned SQL repositories and row locks; stronger module isolation and scalability, more substantial redesign and cross-module coordination. (2) generic JSONB persistence; simpler but weak relational constraints and less transparent ownership. (3) selected relational projection and conservative lock; easier transition and deterministic serialization, but reads the shared state and constrains throughput. This is not full compliance with the module-owned repository design.

Consequences: fresh relational database, schema installed as shared foundation, no migration of legacy data. Real PostgreSQL rollback/concurrency, security, throughput and architecture review remain required. Do not claim NFR-01 or NFR-02 database verification from the memory tests. Review before release; improve repository granularity if workload or architecture acceptance requires it.

# ADR-004 — Staged, Resumable CSV Product Import

**Status:** Proposed  
**Date:** 2026-11-10  
**Decision scope:** Bulk processing, pre-commit user decisions, import reliability and isolation from checkout  
**ASRs / drivers:** FR-14 (architectural driver), FR-15, ASR-01 (NFR-02), ASR-02 (NFR-03), ASR-03 (NFR-01).

## Context

The Business Owner or Store Manager must import potentially large `.csv` files without a fixed product-count limit. The workflow requires a strict four-column header, row validation, duplicate-barcode resolution **before** matching products already stored, Replace/Skip decisions, a complete preview, explicit confirmation, and a final row-level outcome report. Existing stock quantities must not be touched. Unexpected failures require safe retries and no duplicate creations or repeated updates. Performing all of this as one long request could block checkout or lose user decisions on interruption.

The required CSV header is `product_name,barcode,selling_price,storage_location`; **the storage_location header is required but its value is optional per row**. Product-name/barcode/price validation formats and throughput benchmarks remain open (PRD FR-14.1, FR-14.6).

## Alternatives considered

| Alternative | Benefits | Costs / risks |
|---|---|---|
| **Streamed parsing + durable staging + resumable worker** | Supports large files, preview, user decisions, partial progress, safe retries and checkout isolation. | More state management and a durable job runner are required. |
| **Single synchronous request for the entire import** | Straightforward control flow for small files. | Long-running requests, timeouts, difficult resumability, and pressure on POS responsiveness. |
| **Load the whole file into memory, then save** | Simple validation for small datasets. | Memory grows with file size; contradicts scalable processing objective. |
| **Write products while previewing** | Immediate feedback on a row. | Violates explicit confirmation and can create unapproved products/locations. |

## Decision

Build a **CSV Import module** consisting of a streamed parser/validator, **durable staging and decision records**, a user-facing preview/confirmation interface, and a **resumable background import worker** inside the modular monolith.

**Pre-commit phase:**

1. Only authorized Owner/Manager users may submit CSV imports.
2. Reject files not meeting the specified CSV-only and exact-header requirements. Validate individual rows without discarding unrelated valid rows.
3. Persist row outcomes and duplicate groups; require a selected survivor per duplicate-barcode group **before** comparing retained rows with existing products.
4. Collect Replace/Skip decisions for existing matches. Display a logically complete preview, **paginated if large**, including invalid and rejected records and reasons.
5. Apply **no Product or Storage Location mutations** until the user explicitly confirms with all decisions resolved.

**Post-confirmation phase:**

1. Persist a confirmed import job and its immutable row decisions.
2. Process eligible rows in bounded batches through the Catalog and Locations services. Treat each row's product mutation, optional location creation/assignment and **success marker** as one database transaction; do not change stock quantity.
3. Assign a stable job/row idempotency key. On restart, skip already committed rows and resume unfinished work without duplicating a creation or replaying an update.
4. Retry each unexpected record failure up to **three times after the initial attempt**. After those retries fail, mark the row Failed, retain the reason and continue with other eligible rows where possible.
5. Produce a durable outcome report covering new registrations, replacements, skipped rows, rejected rows and exhausted failures.

Use deterministic location normalization for capitalization/minor formatting differences; do not guess or auto-correct genuine spelling errors. Blank optional locations become Unassigned on a new or replaced product, while Skip leaves existing data unchanged.

## Durable import state and execution boundaries

**Business state ownership:** CSV Import owns the single durable import-job status, staged rows, user decisions, attempt counters and success/failure results. A worker abstraction may offer generic claiming/leasing/restart plumbing but must not introduce a second independently authoritative import status machine. A separate general-purpose job runner is **optional**, not a prerequisite for the one-shop architecture.

**Exactly-once committed effect, not execution:** A `(job,row)` uniqueness constraint alone is insufficient. The Catalog write, any required Locations creation/assignment, and the durable row success marker must commit in **one row-level transaction** through the owning public services. Successful rows are not replayed. At commit time revalidate the existing-product identity and Barcode uniqueness because catalog data can change after preview. A stale preview must not silently replace a different or newly changed product; the user-facing resolution remains a follow-on decision.

**Authorization and resource protection:** Persist server-attested identity and confirmed immutable choices. The worker has a scoped internal execution boundary, not the original browser's arbitrary privileges; role revocation after confirmation is a separately documented policy gate (ADR-003). Limit worker concurrency, memory/batch size and DB connections so imports cannot starve the four three-second checkout operations. Do not set an unsupported import-throughput or performance-pass claim.

## Rationale

A staged, durable workflow is needed because the user's duplicate and Replace/Skip decisions are part of the input to a transaction, not merely data-cleaning suggestions. Streaming avoids a size-proportional in-memory dependency, while durable progress markers enable recovery. Moving commit processing off the interactive checkout path protects ASR-03. Row-level atomicity and idempotency align with ADR-002 and the PRD's retry guarantees.

**Interfaces:** authorized UI → CSV Import API (upload/preview/resolve/confirm/status); Import worker → Product Catalog and Storage Locations application services; progress/outcome records → central database. Import processing must not bypass central RBAC.

## Trade-offs / consequences

**Positive:** Large-file resilience; no unconfirmed writes; clear failure reporting; repeatable decisions; safe partial success and restart; minimal interference with synchronous POS billing.

**Negative:** Additional staging data and worker lifecycle; more complex cleanup and monitoring; imports may finish after the user confirms instead of before the request returns; product records may change between preview and commit.

**Architectural constraints / safeguards:**

- Revalidate uniqueness/current product state when committing a staged row, and handle a stale preview without silently replacing a different product. Exact conflict presentation is a follow-on detailed-design decision.
- Guarantee **at-most-once committed effect per import row**, not at-most-once execution attempts.
- Do not promise a maximum import completion time: no approved throughput or resource profile exists.
- An existing stored location is reused; a new location is only created on an eligible, confirmed row.

## Traceability and related decisions

- **ADR-001:** background processing inside the modular monolith.
- **ADR-002:** row-level database atomicity and referential integrity.
- **ADR-003:** import permissions.
- Sources: `PRD.md`, `architecture.md`; PRD FR-14 (FR-14.1–FR-14.6), FR-15 and NFR-01–NFR-03.

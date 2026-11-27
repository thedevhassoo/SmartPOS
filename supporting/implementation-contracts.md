# Rebuilt application contracts

The supplied source is an integrated candidate based on earlier approved decisions, not a newly verified checkout of develop. Resolve any conflict with the authoritative live PRD and decision register before accepting affected slices.

- API: Express same-origin cookie authentication, explicit role checks in the action registry, POST action adapter for the client and REST facade in server/http-contracts.ts. JSON request validation and domain validators. No database access from the browser.
- Persistence: SQL migration in server/database/migrations, typed relational projection with one transaction client and conservative serialization lock. See ADR-010.
- Prices: integer minor units, PKR, server-side offer calculation and snapshots; no payment gateway.
- Scanner: string barcode, leading zeros, Enter terminator, queued repeated scans, dedicated input and name search. Hardware test separately.
- Refund requests: eligibility strictly before 168 hours, pending and approved units reserved, rejected reservations released, external completion recorded separately, resellability checked before restocking.
- CSV: four exact ordered columns, preview without product writes, explicit duplicate and existing-product decisions, row-level processing, bounded worker retries and stale-conflict handling. Default file limit 5 MB; row-count workload limit still requires confirmation.
- Reporting and recommendations: based on committed records, PKT periods, separate gross and refund events, explanatory local statistical rules; no cloud AI.
- Design: original orange/navy/white UI derived from approved visual direction, desktop-first, no copied reference assets or fake metrics.

These are implementation contracts, not proof that every original acceptance criterion passes. See source-file-map.md, traceability.md, testing.md and implementation-status.md.

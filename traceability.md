# SmartPOS — Traceability Matrix

**Status:** Initial Stage 2 mapping; slice implementation has not begun.

## Functional requirements coverage

| FR | Primary slice | Supporting slices | Key acceptance criteria |
|---|---|---|---|
| FR-01 | S01/S02 | All protected slices | AC-FR-01-01–06 |
| FR-02 | S03/S09 | S07/S14 | AC-FR-02-01–06 |
| FR-03 | S09/S12 | S13 | AC-FR-03-01–06 |
| FR-04 | S13 | S09/S12 | AC-FR-04-01–09 |
| FR-05 | S10 | S04/S13/S18/S19 | AC-FR-05-01–05 |
| FR-06 | S04 | S10/S19 | AC-FR-06-01–06 |
| FR-07 | S19 | S04/S10/S20 | AC-FR-07-01–05 |
| FR-08 | S16 | S13/S17 | AC-FR-08-01–06 |
| FR-09 | S16 | S13/S17/S20 | AC-FR-09-01–06 |
| FR-10 | S20 | S16/S19 | AC-FR-10-01–06 |
| FR-11 | S15/S17 | S13/S16 | AC-FR-11-01–10 |
| FR-12 | S18 | S15/S17/S13 | AC-FR-12-01–06 |
| FR-13 | S13/S17 | S01/S16 | AC-FR-13-01–08 |
| FR-14 | S07/S08/S14 | S03/S05/S06 | AC-FR-14-01–18 |
| FR-15 | S05/S06 | S03/S07/S14 | AC-FR-15-01–12 |
| FR-16 | S11/S12 | S09/S13 | AC-FR-16-01–16 |

## Non-functional requirements

| NFR | Primary verification | Owning/supporting slices |
|---|---|---|
| NFR-01 | Documented five-user benchmark and measured 95% three-second target | S03/S09/S12/S13; all slices for regression |
| NFR-02 | Transaction interruption/concurrency/idempotency checks | S13, S14, S17/S18 |
| NFR-03 | Direct negative API authorization tests for all roles | S01 and every protected slice |
| NFR-04 | Five participants, one hour training, 90% unaided completion | Cross-cutting final validation |

## Open and approved references

Approved Stage 2 resolutions cover detailed money, reporting, refund, inventory, offer, AI and barcode rules. Remaining implementation verification items include package versions, scanner hardware, host/network evidence, backup/restoration, benchmark results and usability evidence. Original OQ IDs remain preserved in `decision-register.md`.


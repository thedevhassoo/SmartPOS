# ADR-005 — Server-Authoritative Time Evaluation for Scheduled Offers

**Status:** Proposed  
**Date:** 2026-11-10  
**Decision scope:** Offer scheduling, effective-time consistency, overlap prevention and final bill pricing  
**ASRs / drivers:** FR-16 (architectural driver), FR-03, FR-04, ASR-01 (NFR-02), ASR-02 (NFR-03), ASR-03 (NFR-01).

## Context

The Business Owner and Store Manager can create, edit, schedule and cancel **store-wide** Authorized Offers. Only one offer may be active at an instant; the system must disallow overlapping schedules. Percentage and fixed-amount discounts must become effective **exactly at the configured start instant** and expire **exactly at the end instant**, including when an active offer is edited. A Draft Bill must use only the offer currently effective, and Push must use the offer effective at **finalization**, even if the draft was prepared earlier. A Cashier can use but cannot manage offers.

A periodic background job or workstation clock might apply a discount too early or too late. The PRD defines Pakistan Standard Time (PKT) as the canonical store time zone and the server as the authoritative time source, but leaves clock synchronization/precision unresolved (OQ-51). Percentage and fixed-amount discounts are applied to the bill subtotal, while currency, tax, rounding and calculation order remain open (OQ-10/OQ-31/OQ-50).

## Alternatives considered

| Alternative | Benefits | Costs / risks |
|---|---|---|
| **Evaluate stored time intervals against authoritative server time** | Correct effective offer at each transaction boundary without waiting for scheduled jobs. | Each calculation must consult trustworthy time/current schedule; indexed lookups needed. |
| **Scheduled jobs toggle an `active` field** | Easily displayed active flag; can precompute status. | Missed or delayed jobs violate exact boundaries; restart reconciliation required. |
| **Client/workstation checks local clock** | Responsive UI and no server check. | Clock skew and manipulated clients can misprice bills or bypass offer rules. |
| **Event/message-based activation service** | Could distribute changes to many services. | Unnecessary delivery and ordering complexity in a single-store monolith; eventual timing cannot be authoritative. |

## Decision

Persist each Authorized Offer's **start instant, end instant, discount type/value, and cancellation state** in the Offers module. Determine effective eligibility **on the server at the time of each relevant operation**, using a consistent authoritative time basis. Define the active interval as **start-inclusive, end-exclusive**:

```text
active_at(t) = not_cancelled AND start_time <= t AND t < end_time
```

This gives immediate logical activation/expiration at the specified boundary, without requiring a scheduled task to flip a persisted status flag.

- **No overlapping offers:** Reject any interval whose start is not before its end. Serialize competing schedule creation and modification through a transactionally protected write path, checking intervals against existing non-cancelled offers before committing. Adjacent intervals sharing an end/start instant are allowed by the half-open interval model.
- **Editing:** Owner/Manager edits (including those to currently active offers) are subject to the same overlap validation. Once committed, changes take effect on subsequent server evaluations immediately. Cashier write access is denied by ADR-003.
- **Draft Bill:** Recalculate from the offer effective at the server-side calculation instant; never retain an expired discount merely because a draft was opened earlier.
- **Push:** Evaluate the currently effective offer and persist the resulting bill/offer snapshot in the **same authoritative sale transaction** described by ADR-002. Historical Completed Sales are not retroactively repriced.
- **Display:** The UI may display a current status, but it is not authoritative; it refreshes/re-evaluates from server data as needed and cannot determine final billing eligibility.

Pakistan Standard Time (PKT) is the canonical store time zone and the server remains the authoritative time source; clock synchronization tolerance and the boundary test harness are **pending OQ-51**. A Percentage Discount is calculated from the bill subtotal and a Fixed-Amount Discount is subtracted from it, never exceeding the subtotal; currency, tax, rounding and calculation-order rules remain pending OQ-50.

## Rationale

Deriving effective status from a time interval avoids the main failure mode of timer-triggered state changes: a scheduler may be late or offline when an exact boundary occurs. Central evaluation also ensures that all checkout stations and Cashiers use the same pricing rules. Protecting schedule writes transactionally prevents two Manager/Owner requests from each observing a non-overlapping schedule and then creating an overlap. Re-evaluation at Push prevents a stale Draft Bill from making an expired offer effective in a Completed Sale.

**Interfaces:** Owner/Manager UI → Offers management API → transactionally protected schedule storage; Billing service → Offers eligibility/calculation interface → authoritative current terms; Completed Sale transaction → immutable applied-offer/pricing snapshot.

## Trade-offs / consequences

**Positive:** Reliable interval-boundary semantics at time of use; independent of job timing; secure store-wide eligibility; consistent final bills; simpler runtime than a dedicated scheduler.

**Negative:** Every pricing decision depends on a synchronized authoritative clock and current schedule; offer lookup and conflict checks add database work; already open Draft Bills may display stale prices until recalculated; schedule edits can change the expected total before Push.

**Architectural constraints / safeguards:**

- Time-based state is **derived**, not trusted from a client-maintained `active` flag.
- Preserve the one-active-offer rule under simultaneous schedule writes, not only in a single-user UI.
- Use efficient indexed interval queries to protect the NFR-01 checkout response target.
- Do not introduce item-specific offer targeting: this PRD defines **store-wide** offers.
- Clock precision and discount rounding/currency/tax rules are not invented by this ADR.

## Traceability and related decisions

- **ADR-001:** Offers and Billing as modules in a layered monolith.
- **ADR-002:** atomic final bill snapshot and overlap-safe relational writes.
- **ADR-003:** authorization for offer changes.
- Sources: `PRD.md`, `architecture.md`; PRD FR-03/04/16, NFR-01/02/03, OQ-10/OQ-31/OQ-50/OQ-51.

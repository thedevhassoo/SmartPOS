# ADR-001 — Three-Tier Layered Modular Monolith

**Status:** Proposed  
**Date:** 2026-11-10  
**Decision scope:** Overall architectural style, deployment boundaries, component communication and checkout isolation  
**ASRs / drivers:** ASR-01 (NFR-02), ASR-02 (NFR-03), ASR-03 (NFR-01); CON-01, CON-02, CON-03, CON-06, CON-08, CON-09; FR-03, FR-04, FR-07–FR-10, FR-14–FR-16.

## Context

The AI-Powered Smart POS and Inventory Management System serves **one retail shop** and three roles: Business Owner, Store Manager and Cashier. It must coordinate billing, inventory, product maintenance, CSV imports, scheduled offers, returns, reporting and advisory AI. Critical updates must be strongly consistent; unauthorized actions must be blocked; and routine POS operations have a **3-second response-time target** (NFR-01: at least 95% of measured operations with five concurrent users on a documented development machine). The architecture needs clear component responsibilities without introducing unnecessary inter-service infrastructure.

The PRD does not mandate a programming language, framework, database vendor or cloud platform. Its LAN-only wording describes a possible operating context, while the final hardware, network, offline and availability expectations remain open (OQ-27).

## Alternatives considered

| Alternative | Benefits | Costs / risks |
|---|---|---|
| **Three-tier layered modular monolith** | Central business rules; direct in-process coordination; straightforward cross-module transactions; cohesive modules; relatively simple one-shop deployment. | Modules deploy together; server and database need operational safeguards; boundaries require discipline. |
| **Microservices with independently deployed services** | Independent scaling/deployment and service ownership. | Distributed data consistency, network calls, monitoring and operational complexity disproportionate to the documented scope. |
| **Two-tier workstation-to-database application** | Fewer infrastructure tiers and possibly simple initial setup. | Database credentials and rules become distributed to clients; harder uniform authorization, updates and consistency controls. |
| **Primarily event-driven distributed architecture** | Useful decoupling for background workflows. | Asynchronous completion is unsuitable as the source of truth for sale-and-stock updates; additional failure modes and debugging overhead. |

## Decision

Adopt a **logical three-tier client–server architecture**, implemented as **one modular monolithic backend**:

1. **Presentation tier:** Role-aware web-based POS and management views on authorized shop workstations.
2. **Business logic tier:** A central authenticated application API containing modules for Identity & Access, Product Catalog, CSV Import, Storage Locations, Billing & Sales, Inventory & Expiry, Scheduled Offers, Refunds & Returns, Audit & Transaction History, Reporting & Stock Alerts, and AI Insights.
3. **Persistence tier:** A centralized transactional relational database accessed through controlled module-specific data interfaces.

The UI sends authenticated requests to the application API and **never connects directly to the database**. Business modules communicate primarily via explicit **in-process service interfaces**. Transaction-critical actions run synchronously. Large imports and non-critical reporting/AI refreshes may use durable background jobs after the relevant state has been committed.

The model is logically three-tier even if server and database run on the same physical host. A **single-shop LAN-hosted application** is the provisional deployment candidate, **not** a confirmed network/offline requirement.

## Rationale

A modular monolith best matches the small geographic and organizational scope while retaining clear responsibility boundaries. Internal calls avoid avoidable network latency along the checkout path and allow one database transaction to cover sale and inventory changes. Separating UI, domain processing and persistence supports secure access enforcement and targeted testing. The notes on layered and multi-tier architectures favor clear separation but also caution that extra layers and servers can add performance and availability costs; those costs are kept proportional here.

**Principal interfaces:** shop workstation → authenticated API (request/response); API → application services (in process); owning modules → relational repositories; reporting/AI modules → committed read data; import jobs → Catalog/Locations through their service contracts. The database is not an unrestricted inter-module message bus.

**External boundaries:** The POS has **no required payment gateway**—staff verify payments outside it. No supplier service, external SSO, e-commerce, cross-branch service, email/SMS service or third-party AI API is required. A barcode scanner is an input peripheral; no scanner protocol is fixed.

## Trade-offs / consequences

**Positive:** Simpler deployment and troubleshooting; consistent server-side permissions; a short synchronous checkout path; easy transaction coordination; business-capability separation and testability.

**Negative:** All modules share a release/deployment unit, application-server outages affect all roles, and the centralized persistence system is a critical dependency. Strict module ownership and automated interface tests are needed to prevent gradual coupling.

**Architectural constraints / safeguards:**

- No business-critical sale or inventory writes from the browser or asynchronously via reports/AI.
- Reporting and advisory AI must not block or roll back a valid Completed Sale.
- Optimize indexed product lookup and keep the critical bill-recalculation/Push path bounded; do not assume a concurrency or throughput target beyond the NFR-01 test profile.
- Keep backup/restore, offline support, high availability, final hosting and recovery objectives **unresolved pending OQ-27**.

## Traceability and related decisions

- **ADR-002:** shared relational persistence and atomic sale/stock updates.
- **ADR-003:** centralized identity and authorization boundary.
- **ADR-004 / ADR-005:** bulk import and offer timing within the chosen modular structure.
- Sources: AD-02, AD-06, AD-12–AD-15; `PRD.md` §§7–9, 14–16.

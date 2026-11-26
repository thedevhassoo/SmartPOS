# SmartPOS

**Project status:** Stage 2 approved context and implementation planning complete; application source code has not been initialized.  
**Repository:** `thedevhassoo/SmartPOS`  
**Branch:** `develop`  
**Baseline:** `bf6ef4c2f209884871207be0cfcbb418ea623351`

## Overview

SmartPOS is an in-store POS and inventory system for one retail shop. It supports product lookup, checkout, inventory and expiry records, storage locations, CSV product import, scheduled store-wide offers, refunds and returns, role-controlled reporting and explainable AI recommendations.

Payment is handled outside the POS. The application records external payment checks and authoritative Completed Sales but does not integrate a payment gateway or process bank transfers.

## Approved scope

- Business Owner, Store Manager and Cashier roles.
- Barcode scan, manual barcode entry and product-name lookup.
- Draft Bills and atomic Paid Bill Push.
- Central inventory, batches and audited stock adjustments.
- Storage location management.
- Durable CSV product import.
- Store-wide scheduled offers.
- Refund and return workflows.
- Dashboard, reports, stock alerts and local explainable recommendations.
- Central LAN hosting for multiple authorized workstations.

## Architecture

The system uses a three-tier layered modular monolith:

1. Role-aware browser presentation.
2. Central Express/Node application API with cohesive business modules.
3. Central PostgreSQL persistence.

Module boundaries, module-owned repositories and controlled cross-module unit-of-work coordination are mandatory.

## Approved technology

- React, strict TypeScript, Vite and React Router.
- Tailwind CSS and Material UI.
- Lucide React and restrained Framer Motion.
- Axios and Recharts.
- Node.js LTS, Express.js and strict TypeScript.
- PostgreSQL and `node-postgres` (`pg`).
- Zod, `csv-parse`, Vitest, Supertest and Playwright.
- Git/GitHub, SQL migrations and environment-based configuration.

Actual package versions and Node LTS have not been selected because source initialization has not begun.

## Repository context

- `PRD.md`: authoritative product requirements.
- `architecture.md`: architectural design and boundaries.
- `AGENTS.md`: agent implementation constraints.
- `ADR/`: five accepted architecture decisions and ADR-006 technology decision to be added.
- `context-validation.md`: consolidated Stage 2 decisions.
- `decision-register.md`: approved specification register.
- `context-reviews/`: four engineer context reviews.
- `plan.md`: initial 20-slice implementation plan.
- `traceability.md`: requirement and slice coverage.
- `testing.md`: test strategy and verification status.
- `workflow-evidence-log.md` and `group-contribution-log.md`: evidence placeholders.
- `plan-history/plan-v01.md`: initial plan snapshot.

## Development workflow

Exactly 20 meaningful end-to-end vertical slices are allocated equally to:

- Muhammad Sana Ullah
- Hassan Adil
- Nazakat Ali
- Muhammad Faseeh

All slices are currently Not Started. Human review and Accept/Revise/Reject decisions are required before integration. No future implementation or test result is claimed in this README.

## Setup status

The application source tree and package manifests do not exist yet. Do not use README commands to claim that the application is runnable. Setup commands and endpoints will be added only after initialization and verified execution.

## Known operational verification items

- Actual LAN host/network and PostgreSQL deployment.
- Database backup and restoration verification.
- Host clock synchronization.
- USB HID scanner model, suffix and real-hardware tests.
- Five-concurrent-user POS benchmark.
- Usability testing with five representative participants.
- AI held-out historical-period evaluation.
- Production package versions and lockfile.

## Running and testing

**Pending initialization.** No package scripts or application entry points are available in the reviewed repository.

## Security and data

Do not commit secrets or real customer data. The server is the authorization, pricing, stock and persistence trust boundary. Browser role hiding is not authorization. Production PostgreSQL is not exposed to workstations.


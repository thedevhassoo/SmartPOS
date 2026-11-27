# ADR-006 — Approved Technology Stack and LAN Runtime

**Status:** Accepted by explicit Stage 2 human instruction.  
**Decision date:** 2026-11-26.  
**Scope:** Implementation technologies and intended runtime for the SmartPOS layered modular monolith.  
**Related:** ADR-001–ADR-005, all remain governed by their explicit Stage 2 acceptance instruction; preserve their original rationale and constraints.

## Context

The existing architectural decisions establish a three-tier client-server layered modular monolith with central transactional relational persistence but do not select framework or database products. The Stage 2 human instruction approved a specific stack and single-shop LAN target. The repository has no source code, installed packages, lockfile, or test run at this decision point, so compatible stable versions must be selected and recorded at initialization rather than invented in this ADR.

## Decision

### Frontend

React, TypeScript with strict mode, Vite, React Router, Tailwind CSS, Material UI, Lucide React, Framer Motion, Axios and Recharts. Use one shared theme; MUI primarily for forms/dialogs/tables/interactions, Tailwind for layout and spacing, Lucide consistently, and restrained motion respecting reduced-motion preferences.

### Backend and persistence

Node.js LTS, Express.js and TypeScript with strict mode; PostgreSQL with `node-postgres` (`pg`), version-controlled SQL migrations, parameterized SQL, Zod runtime validation, and `csv-parse` for CSV processing. Use Vitest, Supertest and selected Playwright end-to-end testing.

Use shared TypeScript types/schemas only for genuine cross-boundary contracts. Do not add an unnecessary ORM, cloud provider, microservices, message broker, external job platform or separate database.

### Runtime/deployment

One retail shop; one central host runs Express and PostgreSQL; multiple authorized workstations connect over LAN. Express may serve the production React build. Normal operation has no internet dependency. PostgreSQL is inaccessible directly from client workstations. Offline billing and synchronization are out of scope. On server/network outage, show a clear connection error and never claim an unverified transaction committed. Use environment-based configuration/secrets. Provide PostgreSQL backup/restore instructions and verify restoration before release. No HA, failover or disaster recovery guarantee is made without implementation and measurement.

## Consequences

The stack supports typed UI/API contracts, PostgreSQL ACID transactions, direct SQL control and focused tests, at the cost of operating two TypeScript applications and a central database. Strict module boundaries and migration review remain required. Actual compatible package versions, Node LTS release, lockfile and deployment configuration are selected and verified during initialization; this ADR does not claim them already installed or tested.

## Constraints retained

- UI never accesses PostgreSQL or holds database credentials.
- Module-owned repositories and public application-service ports remain mandatory.
- Push and other critical multi-module operations use synchronous PostgreSQL transactions.
- Background CSV work is durable/resource-bounded and not sale authority.
- AI is local/explainable/advisory under approved FR-10 rules; no external model provider is selected.
- Stack approval does not resolve any Open Question not expressly decided in Stage 2.

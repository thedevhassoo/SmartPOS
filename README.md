# SmartPOS

**Status:** Final planning baseline v02 prepared; initialization and feature implementation must be verified from actual develop code. No working product or test pass is asserted by this document.

SmartPOS is a single-shop retail POS and inventory solution: role-controlled product lookup, USB HID scanner/manual/name search, Draft Bills and externally paid atomic sales, stock and expiry, storage locations, CSV import, store-wide offers, refunds/returns, reporting and advisory local recommendations. No payment provider, e-commerce, multi-shop or offline synchronization.

## Architecture and technology

Three-tier layered modular monolith, central Node/Express strict TypeScript API and PostgreSQL (`pg`) with SQL migrations. React strict TypeScript + Vite + React Router, Tailwind CSS + Material UI, Lucide React, restrained Framer Motion, Axios and Recharts. Zod, csv-parse, Vitest, Supertest and Playwright. ADR-006 is accepted. Use the approved minimalist light orange/navy/white UI; DreamsPOS is a visual reference only. No reference-site features or data. USB HID keyboard-emulation scanners, opaque barcode strings and leading zeros are explicit requirements; actual hardware verification is separate.

## Repository guide

- PRD.md, architecture.md, AGENTS.md, ADR/: authoritative requirements, architecture and decisions.
- decision-register.md, context-validation.md, context-baseline.md, context-reviews/: Stage 2 context and decisions.
- guidelines/, supporting/: design and interaction contracts.
- plan.md, plan-history/: approved planning allocation and living version history.
- planning-confirmation.md: final-planning authorization and pre-implementation consistency checks.
- traceability.md, testing.md: original criterion mapping and test plan.
- slices/: twenty owner-specific task/evidence folders, not separate runnable apps.
- workflow-evidence-log.md and group-contribution-log.md: actual evidence index maintained by coordinator.

## Team and Git workflow

| Engineer | Branch | Slices |
|---|---|---|
| Hassan Adil (coordinator) | feature-hassan | S03, S05, S06, S09, S16 |
| Nazakat Ali | feature-nazakat | S07, S08, S14, S19, S20 |
| Muhammad Sana Ullah | feature-sana | S01, S02, S04, S10, S13 |
| Muhammad Faseeh | feature-faseeh | S11, S12, S15, S17, S18 |

Work one ready vertical slice at a time through bounded AFK Claude Code. Use personal Git identity, actual chats and commits, test before human acceptance, then coordinator integrates into develop and preserves an exact new plan snapshot. Main is the final release branch after G5. Do not merge unaccepted work or rewrite history.

## Running and testing

The accessible develop documentation still describes a planning-only repository. Inspect actual source tree and verify scaffold before claiming runnable setup. Initialize only missing enabling work. Add actual runtime versions, install, environment configuration, migration, run, build, typecheck and test commands after execution. Do not commit credentials or real shop data. Use local PostgreSQL during development; production Express and PostgreSQL on one LAN host, restrict DB to server. Verify hardware, concurrent performance, usability, backup/restore and LAN deployment; all pending until actual tests.

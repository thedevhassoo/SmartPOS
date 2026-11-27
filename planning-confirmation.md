# SmartPOS - Final planning confirmation

Prepared 2026-11-26 23:20:41 PKT (UTC+05:00). The project instruction authorizes the final 20-slice planning baseline, with five per engineer, Hassan Adil coordinating and individual long-lived branches feeding develop then main. This is planning approval, not a claim of successful implementation, actual tests, individual acceptance, or a release-ready product. Actual repository commit and human reviews must be recorded when performed.

## Decisions confirmed for planning

- Preserve the existing architecture and accepted ADR-006; original ADR-001-005 dispositions are governed by the Stage 2 approval and must be synchronized in files rather than reapproved fictitiously.
- Preserve all sixteen FRs, four NFRs, original AC/OQ IDs, the approved business rules from the decision register, strict TypeScript, PostgreSQL, LAN, physical HID barcode support and PRD-only minimalist design.
- Adopt the twenty owners, dependencies and checks in plan.md. S17/S18 precede S16 to avoid a refund/report dependency cycle. Use one branch per member, not one project copy per slice.
- AFK for bounded agent work, actual human Accept/Revise/Reject before integration. Coordinator alone updates master plan and logs after accepted integrations.

## Required consistency check before G1

The observed develop files still contain stale original wording. These are real blockers if they affect the chosen slice. Apply a small, traceable documentation correction on develop based on the accepted Stage 2 decision register and actual PRD. Preserve original IDs and history. Do not use this file to silently override an unresolved authoritative requirement.

| Issue | Required reconciliation | When |
|---|---|---|
| PRD v3.1 still labels numerous questions/criteria open/deferred; decision register records approved resolutions | Read actual accepted Stage 2 decisions; edit PRD, AGENTS and related ADRs to reflect only explicitly approved rules; preserve unapproved gaps and record readiness blockers | Before affected slice; permissions before S01 |
| ADR paths/states | Canonical `ADR/`; remove stale plural path/proposed-only wording where formal approval is documented | Before initialization/S01 |
| PRD CSV cap versus DR-39 | Document configurable 5 MB/10,000 data row workload limits; no total catalog cap; update AC-FR-14-18 and stale no-row-cap wording; retain actual workload verification pending | Before S07 |
| CSV revocation, category | Confirm actual approved pause policy and Uncategorized for new rows, preserve category on replace; no stock changes | Before S07/S14 |
| Money and OQ-31 | Preserve ID and reconcile with OQ-10/OQ-50; exact PKR, half-up, capped nonstacking discounts and historical snapshots; if missing exact rule, block rather than invent | Before S09/S12 |
| Stock/refunds | Reconcile available/recorded units, expiry, exact 168-hour boundary, reservation and external failure treatment with approved decisions; no negative stock or duplicate restock | Before S04/S13/S15/S17/S18 |
| Dashboard/AI | Use approved metrics and formulas only; missing demand classification/threshold details must be documented before related slice | Before S16/S20 |
| AC count | 131 enumerated IDs, not 126 as introductory wording states; verify actual latest PRD before correction | Before final traceability |
| v01 historical summary is not byte-identical to old root plan | Preserve original v01; new snapshots exactly match corresponding plan | Now and every update |
| Source/tooling not verified from complete branch tree | Verify actual HEAD and source tree; complete scaffold if missing; do not falsely mark scaffold done | Before S01 |

## Commit procedure

Verify current develop branch, preserve prior historical files, compare this package to actual HEAD, and reconcile any concurrent changes before copying. If `plan-history/plan-v02.md` already exists, use next unused version and identical plan/snapshot. Add actual source HEAD and commit references where appropriate; use actual time when modifying. Do not overwrite previous root evidence entries; append real records. After checking the planning artefacts, coordinator may commit/push to develop. No application implementation or future acceptance is claimed.

# StudyTrack — AI-Assisted Implementation Plan

**Project type:** Greenfield web application  
**Plan status:** Draft for engineer review  
**Current phase:** Validate and plan; no source code exists  
**Last updated:** 2026-11-03 (sample date)

## 1. Goal and source of truth

Build a small, testable student task management application through **vertical slices**, using an AI coding agent for bounded implementation tasks and a human engineer for decisions and reviews.

Read the following before making changes:

- `PRD.md` — what must be built and the product's acceptance criteria.
- `architecture.md` — approved technology stack and architectural boundaries.
- `AGENTS.md` — operating rules for the coding agent.
- `ADR/` — rationale for approved significant decisions (if present).
- `README.md` — project overview and setup guidance.

If this plan conflicts with the PRD or architecture, **stop and ask for clarification**; do not silently choose an interpretation. This plan does not replace the authoritative documents.

## 2. Context validation (before coding)

- [ ] Agent reads the available project context.
- [ ] Agent lists ambiguities, contradictions, and important missing information.
- [ ] Engineer resolves important questions and approves decisions.
- [ ] Update `PRD.md`, `architecture.md`, `AGENTS.md`, or an ADR as necessary.
- [ ] Engineer approves the initial slice sequence below.

**Validation output:** A short review containing findings, required clarifications, and an approval decision. No source code should be generated during this step.

## 3. Proposed implementation strategy

**Build style:** Vertical slices. Deliver one observable student capability at a time, including the necessary UI, backend, storage, and tests. Do **not** build the entire frontend first, then the entire backend, then the entire database.

**Scope:** A simple single-user task tracker for the first release. Account registration, notifications, collaboration, and analytics are out of scope.

**Working agreement:** For each slice, make the smallest set of changes required, run tests, obtain review, and integrate approved changes before starting the next slice.

## 4. Initialization (enabling work; not itself a user feature)

**Status:** Not started

- [ ] Initialize a Git repository (if one does not already exist).
- [ ] Create a minimal frontend and backend scaffold consistent with `architecture.md`.
- [ ] Configure local SQLite persistence.
- [ ] Add basic test commands and a build check.
- [ ] Document verified setup and run commands in `README.md`.
- [ ] Confirm the app starts locally and the basic test/build commands run.

**Done when:** A reviewer can clone the repository, follow the README, start the scaffold, and execute the initial verification commands. Avoid unnecessary frameworks or dependencies.

## 5. Vertical slice backlog

### Slice 1 — Create a task

**Status:** Not started  
**Depends on:** Initialization  
**User value:** A student can record work to do.

**Minimum scope**
- Show a task-entry form with a required title and optional due date.
- Validate that a blank title cannot be saved.
- Send a valid task to the existing backend boundary and persist it.
- Confirm successful creation to the user.

**Acceptance criteria**
- [ ] A valid task can be created.
- [ ] An empty or whitespace-only title is rejected with clear feedback.
- [ ] The saved task remains available after a page refresh or restart (as applicable).
- [ ] Existing build/tests pass.

**Basic tests to define before implementation**
- Valid task creation succeeds.
- Empty title is rejected.
- Saved task can be retrieved after refresh/reload.

**Completion gate:** Tests pass; engineer reviews the changed files and confirms compliance with requirements and architecture.

### Slice 2 — View saved tasks

**Status:** Not started  
**Depends on:** Slice 1  
**User value:** A student can see recorded work.

**Minimum scope**
- Retrieve saved tasks.
- Display task title, due date (if any), and completion status.
- Provide a meaningful empty state when no tasks exist.

**Acceptance criteria**
- [ ] Saved tasks are shown after reload.
- [ ] A new project with no tasks displays an empty state, not an error.
- [ ] Existing tests continue to pass.

**Basic tests**
- Nonempty task list renders correctly.
- Empty list renders an appropriate message.

**Completion gate:** Tests pass; engineer reviews changes and approves integration.

### Slice 3 — Mark task as completed

**Status:** Not started  
**Depends on:** Slice 2  
**User value:** A student can track progress.

**Minimum scope**
- Add an action to complete a pending task.
- Update the task's status using the agreed task model.
- Persist the updated status and show it in the interface.

**Acceptance criteria**
- [ ] A pending task can be marked completed.
- [ ] The completed status remains after refresh.
- [ ] Completing one task does not change another task.
- [ ] Existing tests continue to pass.

**Basic tests**
- Completion changes only the selected task.
- Updated status persists.

**Completion gate:** Tests pass; engineer approves reviewed changes.

### Slice 4 — Filter tasks by status

**Status:** Not started  
**Depends on:** Slice 3  
**User value:** A student can focus on pending work or review completed work.

**Minimum scope**
- Provide All / Pending / Completed filters.
- Show all tasks by default.
- Filter using the agreed task status representation.
- Display a suitable empty state for an empty filtered result.
- Preserve the relative ordering of tasks.

**Acceptance criteria**
- [ ] All shows every task.
- [ ] Pending shows only pending tasks.
- [ ] Completed shows only completed tasks.
- [ ] An empty result displays a clear message.
- [ ] Switching filters does not change task data or order.

**Basic tests**
- Each filter produces the expected task set.
- Filtering does not mutate task status.

**Completion gate:** Tests pass; engineer reviews integration and behavior.

## 6. Repeatable workflow for EACH slice

1. **Select:** Choose the next approved slice from this plan.
2. **Retrieve context:** Load its relevant PRD requirements, architecture constraints, agent rules, and any approved decisions.
3. **Clarify:** Identify missing details. Engineer resolves consequential questions.
4. **Design when needed:** Let AI propose small design artefacts (e.g., API shape or data model) only when useful; obtain approval for significant decisions.
5. **Define tests:** Clarify acceptance criteria and create basic tests. For TDD, run newly written tests and observe the expected failure before implementation.
6. **Choose execution mode:**
   - **HITL:** New architectural decisions, changes to data contracts, security-sensitive work, or unclear business rules.
   - **AFK within bounds:** Small, well-specified implementation and testing tasks with safe tool permissions.
7. **Implement:** Ask the agent to change only what is necessary for the chosen slice.
8. **Verify:** Run tests, fix failures, and rerun. Record any unresolved limitations.
9. **Review:** Engineer examines changes against the requirements and architecture; accept, revise, or reject.
10. **Integrate and update context:** Merge approved changes; update plan status, README commands, and ADRs if a significant decision changed.

> **Rule:** Passing tests is necessary but not sufficient; human review remains a quality gate.

## 7. Definition of Done (for an introductory course)

A slice is **Done** when:

- [ ] Its acceptance criteria are met.
- [ ] Relevant automated tests and build checks pass.
- [ ] The engineer has reviewed the changes.
- [ ] No unresolved critical defect or architectural conflict remains.
- [ ] Approved work is integrated into the main project branch.
- [ ] `plan.md` is updated to show the completed slice.

## 8. Final system validation and deployment (after slices)

- [ ] Run end-to-end checks covering create, view, complete, and filter.
- [ ] Perform basic checks for invalid input and a usable empty state.
- [ ] Confirm no secrets are committed; verify configuration for the target environment.
- [ ] Deploy to a staging or test environment and perform a smoke test.
- [ ] Obtain engineer approval for release.
- [ ] Deploy the first release; record the working URL and verification result in `README.md`.
- [ ] Note feedback and issues as candidates for the next cycle.

## 9. Progress tracker

| Work item | Status | Evidence / notes |
| --- | --- | --- |
| Context validation | Not started | Findings and approval pending |
| Initialization | Not started | No code yet |
| Slice 1 — Create task | Not started | — |
| Slice 2 — View tasks | Not started | — |
| Slice 3 — Complete task | Not started | — |
| Slice 4 — Filter tasks | Not started | — |
| System validation | Not started | — |
| Deployment | Not started | — |

## 10. Questions for engineer approval

- [ ] Are the four initial features and their scope correct?
- [ ] Are the proposed technology choices confirmed by the architecture/ADRs?
- [ ] Is single-user storage sufficient for the first release?
- [ ] Are due dates optional, and are there any additional validation rules?
- [ ] What is the approved initial deployment target?

**Next action:** Validate the context, resolve these questions, and approve the plan before initializing the application.

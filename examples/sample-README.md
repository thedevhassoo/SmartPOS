# StudyTrack

**Status:** Planning — greenfield project; application code has not been created yet.

StudyTrack is a small web application that helps university students organize academic tasks and track their completion.

> **Purpose of this README:** Give a new human developer or AI coding agent a quick orientation to the project. Detailed requirements and design decisions belong in the linked project documents rather than being duplicated here.

## Intended users and goals

- **Primary users:** University students managing coursework, assignments, and personal study tasks.
- **Main goal:** Allow a student to create, view, and complete tasks in one simple interface.
- **First release:** A minimal but usable task management application. Advanced features (reminders, collaboration, analytics, and multi-user accounts) are outside the initial scope.

## Planned features (first release)

1. **Create a task:** Enter a title and optionally a due date; save it.
2. **View tasks:** See saved tasks in a list, including their status.
3. **Complete a task:** Mark a pending task complete and retain the new status.
4. **Filter tasks:** Show all, pending, or completed tasks.

These are an overview only. Consult `PRD.md` for authoritative requirements and acceptance criteria.

## Proposed technology stack

| Layer | Technology |
| --- | --- |
| Frontend | React + TypeScript |
| Backend | Node.js + Express |
| Database | SQLite |
| Testing | Vitest + React Testing Library; backend tests as appropriate |
| Version control | Git |

The technology choices are **illustrative approved assumptions for this sample**. The project's `architecture.md` and ADRs are the authoritative sources for technical decisions.

## Initial project context

Before an AI coding agent begins implementation, review these documents:

| File | Purpose |
| --- | --- |
| `PRD.md` | Product goals, scope, requirements, acceptance criteria |
| `architecture.md` | High-level components, interactions, and technology boundaries |
| `AGENTS.md` | Rules, constraints, and permitted agent behavior |
| `ADR/` | Records of significant technical decisions, if any |
| `plan.md` | Current implementation sequence and vertical slices |

**Note:** This README and plan are standalone **teaching examples**. The other files in the table are assumed to have been prepared in previous lessons; they are not bundled here.

## Repository structure

The repository structure has **not yet been generated**. During project initialization, the agent may propose a structure consistent with `architecture.md`; an engineer must approve significant deviations. After initialization, replace this section with the actual directory tree.

## Local setup and run instructions

Not available yet: there is no application code or build configuration. After the initial project scaffold is created and verified, record the exact commands for:

1. Installing dependencies.
2. Setting up local configuration (using `.env.example`, without committing secrets).
3. Starting the frontend and backend.
4. Creating or migrating the local database, if required.
5. Running tests and the build.

**Do not invent commands before the toolchain is configured.**

## Working with an AI coding agent

1. Load `AGENTS.md` and the relevant project documents.
2. Check `plan.md` and select **one** small vertical slice.
3. Confirm the slice's acceptance criteria and any unresolved questions.
4. Generate any additional design artefacts only when useful and review significant decisions.
5. Implement with tests, run them, review the changes, and integrate only when accepted.
6. Update `plan.md` and this README when the project evolves.

## Current next step

Validate the initial context and approve the slice backlog in `plan.md`. **Do not begin implementation until the engineer approves the plan.**

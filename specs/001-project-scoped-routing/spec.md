# Feature Specification: Project-Scoped Routing (stop hardcoding "default")

**Feature Branch**: `custom/multi-project`

**Created**: 2026-09-18

**Status**: Draft

**Input**: User description: "Fix `src/router/routes.tsx` so every project-scoped route is parameterized by the active project's real ID instead of the literal string `\"default\"`, so navigating into any registered project shows that project's own runs/pipelines/snapshots/etc. Backend (`GET/POST /api/v1/projects`) and project listing/creation in the dashboard already work (see commit 7fb89280); only in-app navigation to a project's own resources is still locked to `default`."

## Background

Two prior commits on this branch (`7fb89280`, `d6d0488c`/`afed1f27`) already unlocked listing and creating arbitrary projects in the OSS dashboard, which previously only exposed the `default` project as a UI restriction (not a backend or license limitation — both `zenml` server and `zenml-dashboard` are Apache-2.0, and the self-hosted OSS REST API for `/api/v1/projects` already supports arbitrary projects).

What remains broken: `src/router/routes.tsx` hardcodes the literal string `"default"` into every project-scoped route definition, e.g.:

```ts
projects: {
  overview: "/projects",
  runs: {
    overview: "/projects/default/runs",
    detail: (id: string) => `/projects/default/runs/${id}`,
    ...
  },
  pipelines: {
    overview: "/projects/default/pipelines",
    detail: { runs: (pipelineId: string) => `/projects/default/pipelines/${pipelineId}/runs`, ... }
  },
  snapshots: { overview: "/projects/default/snapshots", ... },
  deployments: { overview: "/projects/default/deployments", ... },
  triggers: { overview: "/projects/default/triggers" },
  models: { overview: "/projects/default/models" },
  artifacts: { overview: "/projects/default/artifacts" },
  settings: { repositories: {...}, profile: "/projects/default/settings/profile" }
}
```

As a result: the Projects page can list and create real projects, and clicking a project card *navigates* — but every link it produces still points into `default`'s runs/pipelines/snapshots data, because nothing in the router or its consumers is parameterized by project ID. `src/app/projects/project-item.tsx` already carries an inline comment flagging this exact gap at its `<Link to={routes.projects.pipelines.overview}>` call site.

A repo-audit as of 2026-09-18 found **121 call sites across 43 files** referencing `routes.projects.*` (via `grep -rn "routes\.projects\." src`), spanning breadcrumbs, tabs, column definitions, menus, dialogs, analytics, and the router itself (`src/router/Router.tsx`). All of them currently resolve to `default` and are candidates that must be reviewed/updated by the eventual fix.

Cross-reference: a lightweight tracking stub for this exists in a separate, unrelated repository's issue tracker as `tdew-ss7` (research-pipeline project that consumes this ZenML server) — that was a one-paragraph placeholder. This spec, and the `zmd` bead created alongside it, are the authoritative spec/tracking for the actual code change, which lives in this repository.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View a non-default project's own data (Priority: P1)

A dashboard user who has registered a second project (e.g. via `zenml project register`) opens the Projects page, sees it listed alongside `default`, and clicks into it expecting to see that project's pipelines, runs, snapshots, deployments, triggers, models, and artifacts — not `default`'s.

**Why this priority**: This is the actual capability the fork exists to unlock. Listing/creating projects (already shipped) is useless if you can't then use them — this is the blocking gap for real multi-project usability.

**Independent Test**: Register a second project on a self-hosted OSS ZenML server, run a pipeline in it (or use existing seed data), open the dashboard, click that project's card on the Projects page, and confirm every project-scoped view (overview, runs, pipelines, snapshots, deployments, triggers, models, artifacts, settings) shows that project's own data. Confirm the browser URL/app state reflects the selected project's ID, not the literal string `default`.

**Acceptance Scenarios**:

1. **Given** a server with a `default` project and a second registered project `research`, **When** the user clicks the `research` project card from the Projects page, **Then** the Runs, Pipelines, Snapshots, Deployments, Triggers, Models, and Artifacts views all show `research`'s data.
2. **Given** the user is viewing `research`'s pipelines list, **When** they open a pipeline detail, its runs, its snapshots, or its deployments, **Then** those detail views remain scoped to `research`, not `default`.
3. **Given** the user is scoped into `research`, **When** they navigate to project settings (repositories, profile), **Then** those settings are `research`'s, not `default`'s.

---

### User Story 2 - `default` project navigation has no regression (Priority: P1)

An existing user who only ever used the `default` project (the common case today, and the only case the current hardcoded routes support) continues to navigate the dashboard exactly as before after the fix ships.

**Why this priority**: This fix touches routing used by every existing installation. Breaking `default` navigation would be a regression for 100% of current users, so it is equally critical to the new capability in User Story 1.

**Independent Test**: On a server with only the `default` project (or with `default` selected), exercise the full set of project-scoped views, deep links, and bookmarked/shared URLs of the form `/projects/default/...`, and confirm all continue to resolve and render exactly as before the change.

**Acceptance Scenarios**:

1. **Given** a previously bookmarked or shared URL like `/projects/default/pipelines/<id>/runs`, **When** the user opens it directly (cold load, not via in-app navigation), **Then** it resolves to `default`'s pipeline runs exactly as it did before this fix.
2. **Given** a server with only the `default` project, **When** the user performs the same navigation flows as today (dashboard home → project → runs/pipelines/snapshots/deployments/triggers/models/artifacts/settings), **Then** behavior and shown data are unchanged.

---

### User Story 3 - Every project-scoped consumer is covered, not just top-level nav (Priority: P2)

A developer implementing or reviewing the fix needs confidence that *all* 121 existing call sites of `routes.projects.*` — breadcrumbs, tab bars, table columns, menus, dialogs, tour/analytics links, run/snapshot/deployment sheets — were audited and updated, not just the Projects page card links that are the most visible/obvious ones.

**Why this priority**: A partial fix (e.g. only fixing the project card link and top nav, but leaving breadcrumbs or column-definition links pointing at `default`) would be a worse user experience than an obviously-broken one, because it would silently mix data from two projects in the same screen.

**Independent Test**: Grep `src` for `routes.projects.` (or the parameterized helper that replaces it), diff the resulting call-site list against the 43-file / 121-call-site baseline captured in this spec's Background section, and confirm every one either passes the active project's real ID or has a documented reason it doesn't need to (e.g. dead code, non-project-scoped route).

**Acceptance Scenarios**:

1. **Given** the full list of files identified in the Background section as referencing `routes.projects.*`, **When** the fix is implemented, **Then** each file's project-scoped links use the active project's ID (verified by code review / grep audit, not just manual click-through).
2. **Given** a project-scoped breadcrumb, tab, or table row link rendered while the user is inside project `research`, **When** the user follows it, **Then** it stays within `research`, never silently falling back to `default`.

---

### Edge Cases

- What happens when the user is deep inside a project-scoped view (e.g. a run detail) and switches the active project via the Projects page or a project switcher — does the app navigate to the new project's equivalent overview, or attempt to keep the same sub-path (which may not exist for the new project)?
- What happens when a user opens a URL containing a project ID that does not exist on the server, or that the current user/service account cannot access (e.g. deleted project, permissions revoked)? The app must not silently fall back to `default`'s data.
- What happens when the same route (e.g. a run ID) is opened for two different projects in two browser tabs simultaneously — does app state (not just the URL) stay correctly scoped per tab?
- What happens to deep links generated before this fix (of the form `/projects/default/...`) once arbitrary project routing exists — do they need to keep resolving, per User Story 2, even though the URL no longer looks like the "canonical" form?
- What happens for a project whose ID/name requires URL encoding (spaces, unicode, slashes)?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The dashboard MUST allow navigating from the Projects list into any registered project's own Overview, Runs, Pipelines, Snapshots, Deployments, Triggers, Models, Artifacts, and Settings views — not only `default`.
- **FR-002**: Every route currently defined under `routes.projects.*` in `src/router/routes.tsx` (runs, pipelines, snapshots, deployments, triggers, models, artifacts, settings, and their nested detail/create routes) MUST derive its project segment from the active project's real identifier rather than the literal string `"default"`.
- **FR-003**: All existing call sites of `routes.projects.*` (121 references across 43 files as of 2026-09-18, per the Background section's grep audit) MUST be reviewed and updated so that each one resolves against the active project, not an implicit `default`.
- **FR-004**: Existing navigation and deep links for the `default` project MUST continue to work unchanged after the fix (no regression for the current, only-supported-today case).
- **FR-005**: Project-scoped chrome that is not itself a direct route (breadcrumbs, tab bars, the project menu, table/column link-outs) MUST reflect and link within the currently active project, consistent with FR-002/FR-003.
- **FR-006**: The system MUST NOT silently substitute `default`'s data when a user is scoped into, or a URL references, a different valid project — the active project actually shown must match the active project implied by app state/URL.
- **FR-007**: The system MUST define a clear, documented behavior for a URL/route referencing a project ID that does not exist or is not accessible to the current user (e.g. a "not found" / "no access" state), rather than falling back to `default` [NEEDS CLARIFICATION: exact not-found/no-access UX — reuse the existing 404 page (`src/app/404.tsx`), or a dedicated "project not found" state?].

### Key Entities *(include if feature involves data)*

- **Project**: A ZenML project as returned by `GET /api/v1/projects` — has an ID and name; already listable/creatable in this fork (commit `7fb89280`). This feature does not change how projects are listed or created, only how in-app navigation scopes itself to whichever project is active.
- **Active Project (routing concept)**: The project currently selected by the user's navigation context — today implicitly and exclusively `default`; after this fix, must be an explicit piece of router/app state that every `routes.projects.*` consumer reads from, instead of a hardcoded literal.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A user can go from the Projects page to any registered project's Runs, Pipelines, Snapshots, Deployments, Triggers, Models, and Artifacts views, and 100% of those views show that project's own data (verified by the User Story 1 test with at least one non-default project).
- **SC-002**: 100% of the 121 call sites / 43 files identified in this spec's Background as referencing `routes.projects.*` are accounted for in the fix's review (each one either updated to use the active project or explicitly documented as not needing to be).
- **SC-003**: Existing `default`-project navigation flows and previously-shared `/projects/default/...` URLs continue to resolve with zero behavior change after the fix ships (verified by the User Story 2 regression pass).
- **SC-004**: No screen ever mixes data from two different projects in a single view as a result of stale/hardcoded routing (verified via the Edge Cases around project switching and multi-tab usage).

## Assumptions

- The fix will require changing the *shape* of project-scoped URLs (e.g. from a fixed `/projects/default/runs` to a parameterized `/projects/:projectId/runs`) and/or introducing explicit active-project state consumed by `routes.projects.*`'s call sites — the exact mechanism is an implementation decision left to the planning phase (`/speckit-plan`), not fixed by this spec.
- "Registering a second project" for testing purposes means using the already-working, backend-native `zenml project register` CLI (or the dashboard's own create-project flow from commit `7fb89280`) against a self-hosted OSS ZenML server — no ZenML Pro / licensing concerns apply.
- This spec covers only the frontend routing/navigation gap in `zenml-dashboard`. It assumes the backend REST API and the already-shipped project list/create UI (commit `7fb89280`) need no further changes.
- Multi-tab / concurrent-project browsing (Edge Cases) is in scope to *define* expected behavior for, but a fully independent per-tab session model is not assumed to be required — the planning phase should confirm the minimum viable behavior (e.g. URL-derived active project is sufficient; no separate session store needed).

## Out of Scope

- The ZenML Pro dashboard, its licensing model, or any business-model gating logic — this fix only concerns the OSS `zenml-dashboard` fork.
- The GHCR image publishing / `Dockerfile` / `.github/workflows/release.yml` changes from commits `d6d0488c` and `afed1f27` — already-done, unrelated work.
- Setting up a real GitHub-hosted fork (`origin` remote, `gh auth login`) for this repository — a known, separately-tracked blocker.
- The actual code change to `src/router/routes.tsx` and its consumers — this spec and its companion bead (`zmd` prefix, see `.beads/`) document and plan the work; implementation is intentionally deferred to a future session.

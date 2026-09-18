/**
 * The "active project" (see spec at
 * specs/001-project-scoped-routing/spec.md, "Active Project (routing
 * concept)") is derived from the URL rather than kept in a separate global
 * store: every project-scoped route is shaped `/projects/:projectId/...`
 * (see src/router/routes.tsx and src/router/Router.tsx), so the URL is
 * already the single source of truth for which project is active. This also
 * gives correct per-tab/per-window scoping for free, since each tab has its
 * own `window.location`.
 *
 * `getActiveProjectId` is intentionally a plain function, not a hook: many
 * consumers (e.g. DataTable column definitions such as
 * src/app/runs/columns.tsx) are plain functions invoked per-row during a
 * parent component's render, not components themselves, so they cannot
 * follow the Rules of Hooks. Reading from `window.location.pathname`
 * directly works uniformly for components, hooks, and non-component
 * callbacks alike, and is still correct on every render because
 * react-router re-renders the whole matched route branch on navigation.
 */

const PROJECT_SEGMENT_PATTERN = /^\/projects\/([^/]+)/;

/**
 * Legacy fallback used only when a project-scoped helper is invoked outside
 * of any `/projects/:projectId/...` URL (should not normally happen for the
 * call sites that use this helper). Keeps behavior identical to the
 * previous hardcoded-"default" implementation in that unexpected case,
 * rather than producing a broken link.
 */
export const DEFAULT_PROJECT_ID = "default";

export function getActiveProjectId(): string {
	if (typeof window === "undefined") return DEFAULT_PROJECT_ID;

	const match = window.location.pathname.match(PROJECT_SEGMENT_PATTERN);
	if (!match) return DEFAULT_PROJECT_ID;

	try {
		return decodeURIComponent(match[1]);
	} catch {
		return match[1];
	}
}

import { isNotFoundError } from "@/lib/not-found-error";
import { lazy } from "react";
import { useRouteError } from "react-router";

const NotFoundPage = lazy(() => import("@/app/404"));

/**
 * Error boundary for the project-scoped route subtree (paired with
 * `projectScopeLoader` in src/router/loaders.ts).
 *
 * Implements the FR-007 product decision from
 * specs/001-project-scoped-routing/spec.md: a URL referencing a project ID
 * that doesn't exist, or isn't accessible to the current user, reuses the
 * existing 404 page/state (src/app/404.tsx) rather than a dedicated
 * "project not found" UI, and rather than silently falling back to the
 * "default" project's data (FR-006/FR-007).
 */
export function ProjectScopeBoundary() {
	const error = useRouteError();
	if (isNotFoundError(error)) return <NotFoundPage />;
	throw error;
}

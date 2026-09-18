import { fetchServerSettings, getServerSettingsKey } from "@/data/server/get-server-settings";
import { fetchServerInfo, getServerInfoKey } from "@/data/server/info-query";
import { projectQueries } from "@/data/projects";
import { fetchCurrentUser, getCurrentUserKey } from "@/data/users/current-user-query";
import { getAuthState } from "@/lib/sessions";
import { FetchError } from "@/lib/fetch-error";
import { isNotFoundError, notFound } from "@/lib/not-found-error";
import { QueryClient } from "@tanstack/react-query";
import { LoaderFunctionArgs } from "react-router";

export const authenticatedLayoutLoader = (queryClient: QueryClient) => async () => {
	if (getAuthState()) {
		await Promise.all([
			queryClient
				.ensureQueryData({ queryKey: getCurrentUserKey(), queryFn: fetchCurrentUser })
				// I'm not sure if I like this handling here. A potential check could also be getAuthstate()
				.catch(() => {}),
			queryClient
				.ensureQueryData({ queryKey: getServerSettingsKey(), queryFn: fetchServerSettings })
				.catch(() => {})
		]).catch(() => {});
	}

	return null;
};

export const rootLoader = (queryClient: QueryClient) => async () => {
	await queryClient
		.ensureQueryData({ queryKey: getServerInfoKey(), queryFn: fetchServerInfo })
		.catch(() => {});
	return null;
};

/**
 * Guards every `/projects/:projectId/...` route (FR-007): validates that
 * `projectId` refers to a project that exists and is accessible to the
 * current user, by reusing the same `GET /projects/{id}` request the
 * Projects page already relies on (`projectQueries.projectDetail`, which
 * calls `notFound()` on a 404 response). A missing/inaccessible project
 * rethrows a not-found error so it reaches `ProjectScopeBoundary`, which
 * renders the existing 404 page instead of silently falling back to
 * `default`. A 403 (permission denied) is treated the same as a 404 here,
 * since FR-007 covers both "doesn't exist" and "not accessible to the
 * current user".
 *
 * Other (e.g. transient network) errors are swallowed, consistent with
 * `authenticatedLayoutLoader` above, so we don't block navigation on
 * flaky connectivity.
 */
export const projectScopeLoader =
	(queryClient: QueryClient) =>
	async ({ params }: LoaderFunctionArgs) => {
		const projectId = params.projectId;
		if (!projectId) return null;

		try {
			await queryClient.ensureQueryData(projectQueries.projectDetail(projectId));
		} catch (error) {
			if (isNotFoundError(error)) throw error;
			if (error instanceof FetchError && error.status === 403) notFound();
		}

		return null;
	};

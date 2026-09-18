import { apiPaths, createApiPath } from "@/data/api";
import { FetchError } from "@/lib/fetch-error";
import { Project, ProjectRequest } from "@/types/projects";
import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import { fetcher } from "../fetch";

export async function createProject(body: ProjectRequest): Promise<Project> {
	const url = createApiPath(apiPaths.projects.all);

	const res = await fetcher(url, {
		method: "POST",
		headers: {
			"Content-Type": "application/json"
		},
		body: JSON.stringify(body)
	});

	if (!res.ok) {
		const errorData: string = await res
			.json()
			.then((data) => {
				if (Array.isArray(data.detail)) {
					return data.detail[1];
				}
				return data.detail;
			})
			.catch(() => "Failed to create project");

		throw new FetchError({
			status: res.status,
			statusText: res.statusText,
			message: errorData
		});
	}

	return res.json();
}

export function useCreateProjectMutation(
	options?: Omit<UseMutationOptions<Project, FetchError, ProjectRequest>, "mutationFn">
) {
	return useMutation<Project, FetchError, ProjectRequest>({
		mutationFn: async (payload) => createProject(payload),
		...options
	});
}

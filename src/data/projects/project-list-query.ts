import { FetchError } from "@/lib/fetch-error";
import { ProjectList } from "@/types/projects";
import { apiPaths, createApiPath } from "../api";
import { fetcher } from "../fetch";

export async function fetchAllProjects(): Promise<ProjectList> {
	const url = createApiPath(apiPaths.projects.all);
	const res = await fetcher(url, {
		method: "GET",
		headers: {
			"Content-Type": "application/json"
		}
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
			.catch(() => "Error while fetching projects");
		throw new FetchError({
			status: res.status,
			statusText: res.statusText,
			message: errorData
		});
	}
	return res.json();
}

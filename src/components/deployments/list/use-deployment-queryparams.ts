import { getActiveProjectId } from "@/router/active-project";
import { DeploymentsListQueryParams } from "@/types/deployments";
import { useSearchParams } from "react-router";
import { z } from "zod";

const DEFAULT_PAGE = 1;

const filterParamsSchema = z.object({
	page: z.coerce.number().min(DEFAULT_PAGE).optional().default(DEFAULT_PAGE).catch(DEFAULT_PAGE),
	name: z.string().optional(),

	operator: z.enum(["and", "or"]).optional()
});

export function useDeploymentQueryParams(): DeploymentsListQueryParams {
	const [searchParams] = useSearchParams();

	const { page, name, operator } = filterParamsSchema.parse({
		page: searchParams.get("page") || undefined,
		name: searchParams.get("name") || undefined
	});

	// `list_deployments_api_v1_deployments_get` has no `project_name_or_id` param
	// (unlike pipelines/runs/snapshots) — only the generic `project` filter field.
	return { page, name, logical_operator: operator, project: getActiveProjectId() };
}

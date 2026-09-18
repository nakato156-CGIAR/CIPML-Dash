import { pipelineBreadcrumb, runBreadcrumb } from "@/components/breadcrumbs/library";
import { useBreadcrumbsContext } from "@/layouts/AuthenticatedLayout/BreadcrumbsContext";
import { RunName } from "@/components/runs/run-name";
import { getActiveProjectId } from "@/router/active-project";
import { routes } from "@/router/routes";
import { PipelineRun } from "@/types/pipeline-runs";

import { useEffect } from "react";

export function useCreateSnapshotFromRunBreadcrumbs(run?: PipelineRun) {
	const { setBreadcrumbs } = useBreadcrumbsContext();

	useEffect(() => {
		if (run) {
			const projectId = getActiveProjectId();
			setBreadcrumbs([
				...(run.resources?.pipeline
					? [
							pipelineBreadcrumb(),
							{
								label: run.resources.pipeline.name || "",
								href: routes.projects.pipelines.detail.runs(projectId, run.resources.pipeline.id)
							}
						]
					: [runBreadcrumb()]),
				{
					label: <RunName name={run.name} index={run.body?.index} />,
					href: routes.projects.runs.detail(projectId, run.id)
				},
				{
					label: "Create Snapshot",
					href: routes.projects.runs.createSnapshot(projectId, run.id)
				}
			]);
		}
	}, [setBreadcrumbs, run]);
}

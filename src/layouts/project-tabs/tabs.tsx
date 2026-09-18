import { useRouteSegment } from "@/hooks/use-route-segment";
import { getActiveProjectId } from "@/router/active-project";
import { routes } from "@/router/routes";
import {
	ScrollArea,
	ScrollBar,
	Tabs,
	TabsList,
	TabsTrigger
} from "@zenml-io/react-component-library/components/client";
import { useNavigate } from "react-router";

// settings is in brackets because of the file structure

type TabValues =
	| "pipelines"
	| "runs"
	| "artifacts"
	| "models"
	| "triggers"
	| "settings"
	| "snapshots"
	| "deployments";

export function ProjectTabs() {
	const navigate = useNavigate();
	const segment = (useRouteSegment(2) as TabValues) || "pipelines";

	function changeVal(val: string) {
		const projectId = getActiveProjectId();
		switch (val) {
			case "pipelines":
				navigate(routes.projects.pipelines.overview(projectId));
				break;
			case "runs":
				navigate(routes.projects.runs.overview(projectId));
				break;
			case "deployments":
				navigate(routes.projects.deployments.overview(projectId));
				break;
			case "artifacts":
				navigate(routes.projects.artifacts.overview(projectId));
				break;
			case "models":
				navigate(routes.projects.models.overview(projectId));
				break;
			case "triggers":
				navigate(routes.projects.triggers.overview(projectId));
				break;
			case "snapshots":
				navigate(routes.projects.snapshots.overview(projectId));
				break;
			case "settings":
				navigate(routes.projects.settings.repositories.overview(projectId));
				break;
		}
	}

	return (
		<Tabs value={segment} onValueChange={changeVal}>
			<ScrollArea>
				<TabsList className="flex-nowrap border-none">
					<TabsTrigger value="pipelines">
						<span>Pipelines</span>
					</TabsTrigger>
					<TabsTrigger value="runs">
						<span>Runs</span>
					</TabsTrigger>
					<TabsTrigger value="snapshots">
						<span>Snapshots</span>
					</TabsTrigger>
					<TabsTrigger value="deployments">
						<span>Deployments</span>
					</TabsTrigger>
					<TabsTrigger value="artifacts">
						<span>Artifacts</span>
					</TabsTrigger>
					<TabsTrigger value="models">
						<span>Models</span>
					</TabsTrigger>
					<TabsTrigger value="triggers">
						<span>Triggers</span>
					</TabsTrigger>
					<TabsTrigger value="settings">
						<span>Settings</span>
					</TabsTrigger>
				</TabsList>
				<ScrollBar className="" orientation="horizontal" />
			</ScrollArea>
		</Tabs>
	);
}

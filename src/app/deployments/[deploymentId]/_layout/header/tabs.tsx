import InfoIcon from "@/assets/icons/info.svg?react";
import PlayIcon from "@/assets/icons/play-circle.svg?react";
import RunIcon from "@/assets/icons/terminal-square.svg?react";
import { TabIcon } from "@/components/tab-icon";
import { getActiveProjectId } from "@/router/active-project";
import { routes } from "@/router/routes";
import {
	ScrollArea,
	ScrollBar,
	Tabs,
	TabsList,
	TabsTrigger
} from "@zenml-io/react-component-library/components/client";
import { Link, useParams } from "react-router";
import { useActiveTab } from "./use-active-tab";

export function DeploymentDetailTabs() {
	const { deploymentId } = useParams() as { deploymentId: string };
	const activeTab = useActiveTab();
	const projectId = getActiveProjectId();
	return (
		<Tabs value={activeTab}>
			<ScrollArea>
				<TabsList className="flex-nowrap border-none [&_*]:flex [&_*]:items-center [&_*]:gap-1">
					<TabsTrigger asChild value="overview">
						<Link to={routes.projects.deployments.detail.overview(projectId, deploymentId)}>
							<TabIcon icon={InfoIcon} />
							<span>Overview</span>
						</Link>
					</TabsTrigger>
					<TabsTrigger asChild value="playground">
						<Link to={routes.projects.deployments.detail.playground(projectId, deploymentId)}>
							<TabIcon icon={PlayIcon} />
							<span>Playground</span>
						</Link>
					</TabsTrigger>
					<TabsTrigger asChild value="runs">
						<Link to={routes.projects.deployments.detail.runs(projectId, deploymentId)}>
							<TabIcon icon={RunIcon} />
							<span>Runs</span>
						</Link>
					</TabsTrigger>
				</TabsList>
				<ScrollBar className="" orientation="horizontal" />
			</ScrollArea>
		</Tabs>
	);
}

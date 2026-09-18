import { getActiveProjectId } from "@/router/active-project";
import { routes } from "@/router/routes";
import { BreadcrumbSegment } from "./types";

export const componentBreadcrumb: BreadcrumbSegment = {
	label: "Components",
	href: routes.components.overview
};

// The following are functions (not plain objects) because they must resolve
// against whichever project is active *when used*, not whichever project
// happened to be active when this module was first imported.
export const pipelineBreadcrumb = (): BreadcrumbSegment => ({
	label: "Pipelines",
	href: routes.projects.pipelines.overview(getActiveProjectId())
});

export const deploymentBreadcrumb = (): BreadcrumbSegment => ({
	label: "Deployments",
	href: routes.projects.deployments.overview(getActiveProjectId())
});

export const snapshotBreadcrumb = (): BreadcrumbSegment => ({
	label: "Snapshots",
	href: routes.projects.snapshots.overview(getActiveProjectId())
});

export const stacksBreadcrumb: BreadcrumbSegment = {
	label: "Stacks",
	href: routes.stacks.overview
};

export const runBreadcrumb = (): BreadcrumbSegment => ({
	label: "Runs",
	href: routes.projects.runs.overview(getActiveProjectId())
});

export const ServerSettingsBreadcrumb: BreadcrumbSegment = {
	label: "Settings",
	href: routes.settings.general,
	disabled: true
};

export const SecretsBreadcrumb: BreadcrumbSegment[] = [
	ServerSettingsBreadcrumb,
	{
		label: "Secrets",
		href: routes.settings.secrets.overview
	}
];

export const connectorBreadcrumb: BreadcrumbSegment[] = [
	ServerSettingsBreadcrumb,
	{
		label: "Connectors",
		href: routes.settings.connectors.overview
	}
];

export const serviceAccountBreadcrumb: BreadcrumbSegment[] = [
	ServerSettingsBreadcrumb,
	{
		label: "Service Accounts",
		href: routes.settings.service_accounts.overview
	}
];

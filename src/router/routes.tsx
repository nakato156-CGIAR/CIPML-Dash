/**
 * A project ID segment for a project-scoped URL.
 *
 * Real project IDs are URL-encoded (spec edge case: project IDs may contain
 * spaces/unicode/slashes). Route *pattern* placeholders (e.g. ":projectId",
 * used by src/router/Router.tsx and src/hooks/usePageTitle.ts to register/match
 * routes) are passed through untouched since they aren't real values.
 */
function projectSegment(projectId: string): string {
	return projectId.startsWith(":") ? projectId : encodeURIComponent(projectId);
}

export const routes = {
	home: "/",
	activateServer: "/activate-server",
	activateUser: "/activate-user",
	login: "/login",
	upgrade: "/upgrade",
	survey: "/survey",
	onboarding: "/onboarding",
	devices: {
		verify: "/devices/verify"
	},

	components: {
		overview: "/components",
		detail: (componentId: string) => `/components/${componentId}`,
		edit: (componentId: string) => `/components/${componentId}/edit`,
		create: "/components/create"
	},
	stacks: {
		overview: "/stacks",
		create: {
			index: "/stacks/create",
			newInfra: "/stacks/create/new-infrastructure",
			manual: "/stacks/create/manual",
			existingInfra: "/stacks/create/existing-infrastructure",
			terraform: "/stacks/create/terraform"
		},
		edit: (stackId: string) => `/stacks/${stackId}/edit`
	},
	projects: {
		// Not project-scoped: this is the list you pick a project FROM.
		overview: "/projects",
		runs: {
			overview: (projectId: string) => `/projects/${projectSegment(projectId)}/runs`,
			detail: (projectId: string, id: string) =>
				`/projects/${projectSegment(projectId)}/runs/${id}`,
			detailLogs: (projectId: string, id: string) =>
				`/projects/${projectSegment(projectId)}/runs/${id}/logs`,
			createSnapshot: (projectId: string, id: string) =>
				`/projects/${projectSegment(projectId)}/runs/${id}/create-snapshot`
		},
		pipelines: {
			overview: (projectId: string) => `/projects/${projectSegment(projectId)}/pipelines`,
			detail: {
				runs: (projectId: string, pipelineId: string) =>
					`/projects/${projectSegment(projectId)}/pipelines/${pipelineId}/runs`,
				snapshots: (projectId: string, pipelineId: string) =>
					`/projects/${projectSegment(projectId)}/pipelines/${pipelineId}/snapshots`,
				deployments: (projectId: string, pipelineId: string) =>
					`/projects/${projectSegment(projectId)}/pipelines/${pipelineId}/deployments`
			}
		},
		snapshots: {
			overview: (projectId: string) => `/projects/${projectSegment(projectId)}/snapshots`,
			create: (projectId: string) => `/projects/${projectSegment(projectId)}/snapshots/create`,
			detail: {
				overview: (projectId: string, snapshotId: string) =>
					`/projects/${projectSegment(projectId)}/snapshots/${snapshotId}`,
				runs: (projectId: string, snapshotId: string) =>
					`/projects/${projectSegment(projectId)}/snapshots/${snapshotId}/runs`
			}
		},
		deployments: {
			overview: (projectId: string) => `/projects/${projectSegment(projectId)}/deployments`,
			detail: {
				overview: (projectId: string, deploymentId: string) =>
					`/projects/${projectSegment(projectId)}/deployments/${deploymentId}`,
				runs: (projectId: string, deploymentId: string) =>
					`/projects/${projectSegment(projectId)}/deployments/${deploymentId}/runs`,
				playground: (projectId: string, deploymentId: string) =>
					`/projects/${projectSegment(projectId)}/deployments/${deploymentId}/playground`
			}
		},
		triggers: {
			overview: (projectId: string) => `/projects/${projectSegment(projectId)}/triggers`
		},
		models: {
			overview: (projectId: string) => `/projects/${projectSegment(projectId)}/models`
		},
		artifacts: {
			overview: (projectId: string) => `/projects/${projectSegment(projectId)}/artifacts`
		},
		settings: {
			repositories: {
				overview: (projectId: string) =>
					`/projects/${projectSegment(projectId)}/settings/repositories`
			},
			profile: (projectId: string) => `/projects/${projectSegment(projectId)}/settings/profile`
		}
	},
	settings: {
		apiTokens: "/settings/api-tokens",
		general: "/settings/general",
		members: `/settings/members`,
		mcp: "/settings/mcp",
		notifications: "/settings/notifications",
		profile: `/settings/profile`,
		secrets: { overview: "/settings/secrets", detail: (id: string) => `/settings/secrets/${id}` },
		connectors: {
			overview: "/settings/connectors",
			create: "/settings/connectors/create",
			detail: {
				configuration: (id: string) => `/settings/connectors/${id}/configuration`,
				components: (id: string) => `/settings/connectors/${id}/components`,
				resources: (id: string) => `/settings/connectors/${id}/resources`
			}
		},
		service_accounts: {
			overview: "/settings/service-accounts",
			detail: (id: string) => `/settings/service-accounts/${id}`
		}
	}
};

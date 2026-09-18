import Divider from "@/assets/icons/slash-divider.svg?react";
import { projectQueries } from "@/data/projects";
import { generateProjectImageUrl } from "@/lib/images";
import { getActiveProjectId } from "@/router/active-project";
import { routes } from "@/router/routes";
import { useQuery } from "@tanstack/react-query";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger
} from "@zenml-io/react-component-library/components/client";
import { Button } from "@zenml-io/react-component-library/components/server";
import { Link, useLocation } from "react-router";

export function ProjectLink() {
	const pathname = useLocation().pathname;
	const segments = pathname.split("/").filter(Boolean);
	const isProjectScoped = segments[0] === "projects" && segments.length > 1;

	// The active project (see src/router/active-project.ts) is the one implied
	// by the URL, e.g. `research` in `/projects/research/pipelines` — not
	// always `default`.
	const projectId = getActiveProjectId();
	// Cheap: `projectQueries.projectDetail` is already fetched/cached by
	// `projectScopeLoader` (src/router/loaders.ts) for every project-scoped
	// route, so this is typically an instant cache hit. `enabled` keeps this
	// from firing on non-project-scoped pages (Rules of Hooks means this call
	// itself can't be behind the early `return null` below).
	const project = useQuery({
		...projectQueries.projectDetail(projectId),
		enabled: isProjectScoped
	});

	if (!isProjectScoped) {
		return null;
	}

	const displayName = project.data?.body?.display_name || project.data?.name || projectId;
	const imageName = project.data?.name || projectId;

	return (
		<>
			<Divider className="h-4 w-4 flex-shrink-0 fill-neutral-200" />
			<div className="flex items-center gap-0.5">
				<TooltipProvider>
					<Tooltip>
						<TooltipTrigger asChild>
							<Button intent="secondary" className="p-0.5" emphasis="minimal" asChild>
								<Link to={routes.projects.pipelines.overview(projectId)}>
									<div className="flex max-w-[150px] items-center gap-1 md:max-w-[200px]">
										<img
											className="size-5 shrink-0 rounded-md object-cover"
											alt={imageName}
											src={generateProjectImageUrl(imageName)}
										/>
										<p className="truncate text-text-md font-medium">{displayName}</p>
									</div>
								</Link>
							</Button>
						</TooltipTrigger>
						<TooltipContent sideOffset={4}>Project</TooltipContent>
					</Tooltip>
				</TooltipProvider>
			</div>
		</>
	);
}

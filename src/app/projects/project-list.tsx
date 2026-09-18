import { projectQueries } from "@/data/projects";
import { useCurrentUser } from "@/data/users/current-user-query";
import { useQuery } from "@tanstack/react-query";
import { ProjectItem } from "./project-item";
import { Skeleton } from "@zenml-io/react-component-library";

export function ProjectList() {
	const projectsQuery = useQuery({ ...projectQueries.projectList() });
	const currentUserQuery = useCurrentUser();
	if (projectsQuery.isPending || currentUserQuery.isPending)
		return (
			<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
				<div className="h-full w-full">
					<Skeleton className="h-[400px] w-full" />
				</div>
			</div>
		);
	if (projectsQuery.isError) {
		return <p>{projectsQuery.error.message}</p>;
	}
	const projects = projectsQuery.data.items;

	const defaultProjectId = currentUserQuery.data?.body?.default_project_id;

	return (
		<ul className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
			{projects.map((project) => (
				<li key={project.id}>
					<ProjectItem project={project} isDefault={defaultProjectId === project.id} />
				</li>
			))}
		</ul>
	);
}

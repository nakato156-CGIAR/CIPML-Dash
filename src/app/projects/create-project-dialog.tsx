import AlertCircle from "@/assets/icons/alert-circle.svg?react";
import Plus from "@/assets/icons/plus.svg?react";
import { projectQueries } from "@/data/projects";
import { useCreateProjectMutation } from "@/data/projects/create-project";
import { isFetchError } from "@/lib/fetch-error";
import { ProjectRequest } from "@/types/projects";
import { useQueryClient } from "@tanstack/react-query";
import {
	Button,
	Dialog,
	DialogClose,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
	Input,
	useToast
} from "@zenml-io/react-component-library";
import { useId, useState } from "react";
import { useForm } from "react-hook-form";

const NAME_PATTERN = /^[a-z0-9_-]{1,50}$/;

export function CreateProjectDialog() {
	const [open, setOpen] = useState(false);

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button className="shrink-0" intent="primary">
					<Plus width={24} height={24} className="shrink-0 fill-white" />
					New Project
				</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Create a New Project</DialogTitle>
				</DialogHeader>
				<CreateProjectForm onSuccess={() => setOpen(false)} />
			</DialogContent>
		</Dialog>
	);
}

type CreateProjectFormProps = {
	onSuccess: () => void;
};

function CreateProjectForm({ onSuccess }: CreateProjectFormProps) {
	const { toast } = useToast();
	const queryClient = useQueryClient();
	const { mutate, isPending } = useCreateProjectMutation({
		onError(error) {
			if (isFetchError(error)) {
				toast({
					status: "error",
					emphasis: "subtle",
					icon: <AlertCircle className="h-5 w-5 shrink-0 fill-error-700" />,
					description: error.message,
					rounded: true
				});
			}
		},
		onSuccess() {
			queryClient.invalidateQueries({ queryKey: projectQueries.all });
			onSuccess();
		}
	});

	const nameId = useId();
	const displayNameId = useId();
	const { register, handleSubmit, watch } = useForm<ProjectRequest>();

	function submit(data: ProjectRequest) {
		mutate({
			name: data.name,
			display_name: data.display_name || data.name
		});
	}

	const name = watch("name");

	return (
		<>
			<form id="create-project-form" onSubmit={handleSubmit(submit)} className="space-y-5 p-7">
				<div className="space-y-0.5">
					<label htmlFor={nameId} className="text-text-sm">
						Name
					</label>
					<Input
						{...register("name", { required: true, pattern: NAME_PATTERN })}
						id={nameId}
						className="w-full"
						placeholder="my-project"
					/>
					<p className="text-text-xs text-theme-text-secondary">
						Lowercase letters, numbers, underscores and hyphens only.
					</p>
				</div>
				<div className="space-y-0.5">
					<label htmlFor={displayNameId} className="text-text-sm">
						Display name (optional)
					</label>
					<Input {...register("display_name")} id={displayNameId} className="w-full" />
				</div>
			</form>
			<DialogFooter className="gap-[10px]">
				<DialogClose asChild>
					<Button size="sm" intent="secondary">
						Cancel
					</Button>
				</DialogClose>
				<Button
					disabled={!name || !NAME_PATTERN.test(name) || isPending}
					form="create-project-form"
					size="sm"
				>
					Create Project
				</Button>
			</DialogFooter>
		</>
	);
}

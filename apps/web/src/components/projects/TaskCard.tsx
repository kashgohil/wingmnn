import { PriorityIcon } from "@/components/projects/PriorityLabel";
import { Avatar } from "@/components/ui/avatar";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import type { Task } from "@/lib/api/tasks.api";
import { useUserProfile } from "@/lib/hooks/use-users";
import { getPriorityLabel } from "@/lib/priority";
import { cn } from "@/lib/utils";
import { CheckSquare2, Clock } from "lucide-react";

interface Tag {
	id: string;
	name: string;
	colorCode: string;
}

interface TaskCardProps {
	task: Task;
	statusMap: Map<string, { name: string; colorCode: string }>;
	tags?: Tag[];
	subtaskCount?: number;
}

function formatTimeRemaining(dueDate: string): string {
	const now = new Date();
	const due = new Date(dueDate);
	const diffMs = due.getTime() - now.getTime();
	const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
	const diffHours = Math.floor(
		(diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
	);

	if (diffMs < 0) {
		// Overdue
		const absDays = Math.abs(diffDays);
		if (absDays === 0) {
			return "Overdue today";
		}
		if (absDays === 1) {
			return "Overdue 1 day";
		}
		return `Overdue ${absDays} days`;
	}

	if (diffDays === 0) {
		if (diffHours === 0) {
			return "Due today";
		}
		return `Due in ${diffHours} hour${diffHours > 1 ? "s" : ""}`;
	}

	if (diffDays === 1) {
		return "Due tomorrow";
	}

	if (diffDays < 7) {
		return `Due in ${diffDays} days`;
	}

	const weeks = Math.floor(diffDays / 7);
	if (weeks === 1) {
		return "Due in 1 week";
	}
	if (weeks < 4) {
		return `Due in ${weeks} weeks`;
	}

	const months = Math.floor(diffDays / 30);
	if (months === 1) {
		return "Due in 1 month";
	}
	return `Due in ${months} months`;
}

export function TaskCard({
	task,
	statusMap,
	tags = [],
	subtaskCount = 0,
}: TaskCardProps) {
	const { data: assignee } = useUserProfile(task.assignedTo ?? null);
	const taskStatus = statusMap.get(task.statusId);
	const accentColor = taskStatus?.colorCode ?? "#808080";

	return (
		<TooltipProvider>
			<div
				className={cn(
					"relative rounded-none border-2 border-border bg-background",
					"retro-border-shadow-sm overflow-hidden",
				)}
			>
				{/* Colored accent bar on the left */}
				<div
					className="absolute left-0 top-0 h-full w-1"
					style={{ backgroundColor: accentColor }}
				/>

				{/* Content */}
				<div className="relative pl-4 pr-3 py-3">
					{/* Title */}
					<h3 className="font-mono font-semibold text-sm leading-tight text-foreground mb-3 pr-2">
						{task.title}
					</h3>

					{/* Metadata row: Assignee, Status, Priority */}
					<div className="flex items-center gap-3 mb-3 flex-wrap">
						{/* Assignee */}
						{assignee ? (
							<Tooltip>
								<TooltipTrigger asChild>
									<div className="flex items-center gap-1.5">
										<Avatar
											name={assignee.name || "User"}
											size="sm"
											className="size-5"
										/>
										<span className="text-xs text-muted-foreground">
											{assignee.name}
										</span>
									</div>
								</TooltipTrigger>
								<TooltipContent side="top">
									<div className="flex items-center gap-2">
										<Avatar
											name={assignee.name || "User"}
											size="sm"
											className="size-6"
										/>
										<div>
											<p className="font-semibold text-xs">{assignee.name}</p>
											{assignee.email && (
												<p className="text-[10px] text-muted-foreground">
													{assignee.email}
												</p>
											)}
										</div>
									</div>
								</TooltipContent>
							</Tooltip>
						) : (
							<Tooltip>
								<TooltipTrigger asChild>
									<div className="flex items-center gap-1.5">
										<div className="size-5 rounded-full bg-muted border border-border flex items-center justify-center">
											<span className="text-[10px] text-muted-foreground">
												?
											</span>
										</div>
										<span className="text-xs text-muted-foreground">
											Unassigned
										</span>
									</div>
								</TooltipTrigger>
								<TooltipContent side="top">
									<p className="text-xs">Unassigned</p>
								</TooltipContent>
							</Tooltip>
						)}

						{/* Status */}
						{taskStatus && (
							<div className="flex items-center gap-1.5">
								<div
									className="size-2 rounded-full"
									style={{ backgroundColor: taskStatus.colorCode }}
								/>
								<span className="text-xs font-mono uppercase tracking-wider text-foreground">
									{taskStatus.name}
								</span>
							</div>
						)}

						{/* Priority */}
						{task.priority && (
							<Tooltip>
								<TooltipTrigger asChild>
									<div className="flex items-center gap-1.5">
										<PriorityIcon
											priority={task.priority}
											className="size-3.5"
										/>
										<span className="text-xs text-muted-foreground">
											{getPriorityLabel(task.priority)}
										</span>
									</div>
								</TooltipTrigger>
								<TooltipContent side="top">
									<p className="text-xs font-semibold">
										{getPriorityLabel(task.priority)}
									</p>
								</TooltipContent>
							</Tooltip>
						)}
					</div>

					{/* Tags */}
					{tags.length > 0 && (
						<div className="flex items-center gap-1.5 flex-wrap mb-3">
							{tags.map((tag) => (
								<div
									key={tag.id}
									className="flex items-center gap-1 px-1.5 py-0.5 rounded-none border border-border retro-border-shadow-sm"
									style={{
										borderColor: tag.colorCode,
										backgroundColor: `${tag.colorCode}15`,
									}}
								>
									<div
										className="size-1.5 rounded-full"
										style={{ backgroundColor: tag.colorCode }}
									/>
									<span className="text-[10px] font-mono uppercase tracking-wider text-foreground">
										{tag.name}
									</span>
								</div>
							))}
						</div>
					)}

					{/* Bottom row: Subtasks and Time remaining */}
					<div className="flex items-center gap-3 flex-wrap">
						{/* Subtask count */}
						{subtaskCount > 0 && (
							<div className="flex items-center gap-1.5">
								<CheckSquare2 className="size-3.5 text-muted-foreground" />
								<span className="text-xs text-muted-foreground">
									{subtaskCount} subtask{subtaskCount > 1 ? "s" : ""}
								</span>
							</div>
						)}

						{/* Time remaining */}
						{task.dueDate && (
							<div className="flex items-center gap-1.5">
								<Clock className="size-3.5 text-muted-foreground" />
								<span className="text-xs text-muted-foreground">
									{formatTimeRemaining(task.dueDate)}
								</span>
							</div>
						)}
					</div>
				</div>
			</div>
		</TooltipProvider>
	);
}

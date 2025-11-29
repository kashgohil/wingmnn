import { PriorityIcon } from "@/components/projects/PriorityLabel";
import { Avatar } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import {
	formatTimeRemaining,
	getContrastingTextColor,
	getTranslucentColor,
} from "@wingmnn/utils";
import { CheckSquare2, Clock } from "lucide-react";

interface Tag {
	id: string;
	name: string;
	colorCode: string;
}

type variant = "kanban" | "list";

interface TaskCardProps {
	task: Task;
	statusMap: Map<string, { name: string; colorCode: string }>;
	tags?: Tag[];
	subtaskCount?: number;
	variant?: variant;
}

export function TaskCard({
	task,
	statusMap,
	tags = [],
	subtaskCount = 0,
	variant = "list",
}: TaskCardProps) {
	const { data: assignee } = useUserProfile(task.assignedTo ?? null);
	const taskStatus = statusMap.get(task.statusId);
	const accentColor = taskStatus?.colorCode ?? "var(--color-border)";

	const translucentAccent = getTranslucentColor(accentColor, 0.6);

	return (
		<TooltipProvider>
			<Card
				className={cn(
					"relative border border-l-5!",
					variant === "kanban"
						? "retro-border-shadow-sm max-w-sm"
						: "retro-border-shadow-sm",
				)}
				style={{
					borderColor: translucentAccent,
					// We rely on the left border width class; just tint the whole border.
				}}
			>
				<CardHeader className="pb-0 flex flex-row items-center justify-between">
					<CardTitle>{task.title}</CardTitle>
					{/* Status */}
					{taskStatus && variant !== "kanban" && (
						<>
							<div
								className="absolute -top-0.5 -right-0.5 px-2 text-center min-w-20 py-1 tracking-wider whitespace-nowrap"
								style={{
									background: taskStatus.colorCode,
									color: getContrastingTextColor(taskStatus.colorCode),
								}}
							>
								{taskStatus.name}
							</div>
							<div className="w-1/6"></div>
						</>
					)}
				</CardHeader>
				<CardContent className="pt-2 flex flex-col gap-3">
					{/* Metadata row: Assignee, Status, Priority */}
					<div className="flex items-center justify-between gap-3 flex-wrap">
						<div className="flex items-center gap-3">
							{/* Tags */}
							{tags.length > 0 && (
								<div className="flex items-center gap-1.5 flex-wrap">
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
						<div className="flex items-center gap-1">
							{/* Priority */}
							{task.priority && (
								<Tooltip>
									<TooltipTrigger asChild>
										<div>
											<PriorityIcon
												className="size-6"
												priority={task.priority}
											/>
										</div>
									</TooltipTrigger>
									<TooltipContent
										side="bottom"
										className="text-xs"
									>
										{getPriorityLabel(task.priority)}
									</TooltipContent>
								</Tooltip>
							)}

							{/* Assignee */}
							{assignee ? (
								<Tooltip>
									<TooltipTrigger asChild>
										<Avatar
											name={assignee.name || "User"}
											className="size-6"
										/>
									</TooltipTrigger>
									<TooltipContent side="top">
										<div className="flex flex-col items-start gap-1">
											<p className="font-semibold text-xs">{assignee.name}</p>
											{assignee.email && (
												<p className="text-[10px] text-muted-foreground">
													{assignee.email}
												</p>
											)}
										</div>
									</TooltipContent>
								</Tooltip>
							) : (
								<Tooltip>
									<TooltipTrigger asChild>
										<div className="size-6 rounded-full bg-muted border border-border flex items-center justify-center">
											<span className="text-muted-foreground">?</span>
										</div>
									</TooltipTrigger>
									<TooltipContent
										side="bottom"
										className="text-xs"
									>
										Unassigned
									</TooltipContent>
								</Tooltip>
							)}
						</div>
					</div>
				</CardContent>
			</Card>
		</TooltipProvider>
	);
}

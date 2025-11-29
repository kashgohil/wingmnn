import type { Project } from "@/lib/api/projects.api";
import type { Task } from "@/lib/api/tasks.api";
import type { LucideIcon } from "lucide-react";
import { AlertOctagon, ChevronsUp, Feather, Flame } from "lucide-react";

export type PriorityValue = NonNullable<Project["priority"] | Task["priority"]>;

type PriorityMetadata = {
	label: string;
	description: string;
	icon: LucideIcon;
	iconClassName: string;
	dotClassName: string;
};

export const PRIORITY_META: Record<PriorityValue, PriorityMetadata> = {
	critical: {
		label: "Critical",
		description: "Highest urgency",
		icon: AlertOctagon,
		iconClassName: "text-red-500",
		dotClassName: "bg-red-500",
	},
	high: {
		label: "High",
		description: "Needs attention soon",
		icon: Flame,
		iconClassName: "text-orange-500",
		dotClassName: "bg-orange-500",
	},
	medium: {
		label: "Medium",
		description: "Standard priority",
		icon: ChevronsUp,
		iconClassName: "text-yellow-500",
		dotClassName: "bg-yellow-500",
	},
	low: {
		label: "Low",
		description: "Nice to have",
		icon: Feather,
		iconClassName: "text-blue-500",
		dotClassName: "bg-blue-500",
	},
};

export const PRIORITY_ORDER: PriorityValue[] = [
	"critical",
	"high",
	"medium",
	"low",
];

export function getPriorityLabel(
	priority: Project["priority"] | Task["priority"] | null | undefined,
) {
	if (!priority) {
		return "Unset";
	}

	return PRIORITY_META[priority]?.label ?? priority;
}

export function getPriorityDescription(priority: PriorityValue) {
	return PRIORITY_META[priority]?.description ?? "";
}

export function getPriorityMetadata(
	priority: PriorityValue | null | undefined,
): PriorityMetadata | null {
	if (!priority) {
		return null;
	}

	return PRIORITY_META[priority];
}

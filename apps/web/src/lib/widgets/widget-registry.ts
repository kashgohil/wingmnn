/**
 * Widget Registry
 * Manages widget visibility and configuration
 * Uses Zustand for state management with localStorage persistence
 */

import { useCallback } from "react";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type WidgetId =
	| "task-count"
	| "priority-distribution"
	| "status-distribution"
	| "completion-rate"
	| "overdue-tasks"
	| "upcoming-deadlines"
	| "time-spent"
	| "task-trend";

export interface WidgetConfig {
	id: WidgetId;
	name: string;
	description: string;
	visible: boolean;
}

const STORAGE_KEY = "dashboard-widget-config";

const defaultWidgets: WidgetConfig[] = [
	{
		id: "task-count",
		name: "Total Tasks",
		description: "Total number of tasks assigned to you",
		visible: true,
	},
	{
		id: "priority-distribution",
		name: "Priority Distribution",
		description: "Tasks grouped by priority",
		visible: true,
	},
	{
		id: "status-distribution",
		name: "Status Distribution",
		description: "Tasks grouped by status",
		visible: true,
	},
	{
		id: "completion-rate",
		name: "Completion Rate",
		description: "Percentage of completed tasks",
		visible: true,
	},
	{
		id: "overdue-tasks",
		name: "Overdue Tasks",
		description: "Tasks past their due date",
		visible: true,
	},
	{
		id: "upcoming-deadlines",
		name: "Upcoming Deadlines",
		description: "Tasks due in the next 7 days",
		visible: true,
	},
	{
		id: "time-spent",
		name: "Time Spent",
		description: "Time tracking analytics",
		visible: false,
	},
	{
		id: "task-trend",
		name: "Task Trend",
		description: "Task completion trends over time",
		visible: false,
	},
];

interface WidgetStoreState {
	widgets: WidgetConfig[];
	toggleWidget: (widgetId: WidgetId) => void;
	updateWidgetConfig: (newConfig: WidgetConfig[]) => void;
}

// Helper function to merge stored config with defaults
function mergeWithDefaults(stored: WidgetConfig[] | null): WidgetConfig[] {
	if (!stored) {
		return defaultWidgets;
	}

	// Merge with defaults to handle new widgets
	const widgetMap = new Map(stored.map((w) => [w.id, w]));
	return defaultWidgets.map((defaultWidget) => {
		const storedWidget = widgetMap.get(defaultWidget.id);
		return storedWidget || defaultWidget;
	});
}

export const useWidgetStore = create<WidgetStoreState>()(
	persist(
		(set) => ({
			widgets: defaultWidgets,
			toggleWidget: (widgetId: WidgetId) =>
				set((state) => ({
					widgets: state.widgets.map((w) =>
						w.id === widgetId ? { ...w, visible: !w.visible } : w,
					),
				})),
			updateWidgetConfig: (newConfig: WidgetConfig[]) =>
				set({ widgets: newConfig }),
		}),
		{
			name: STORAGE_KEY,
			storage: createJSONStorage(() => localStorage),
			// Merge stored config with defaults on hydration
			onRehydrateStorage: () => (state, error) => {
				if (error) {
					console.error("Failed to rehydrate widget config:", error);
					return;
				}
				if (state && state.widgets) {
					// Merge with defaults to handle new widgets
					state.widgets = mergeWithDefaults(state.widgets);
				}
			},
		},
	),
);

// Listen to storage events for cross-tab synchronization
if (typeof window !== "undefined") {
	window.addEventListener("storage", (event) => {
		if (event.key === STORAGE_KEY && event.newValue) {
			try {
				const parsed = JSON.parse(event.newValue);
				if (parsed?.state?.widgets) {
					const merged = mergeWithDefaults(parsed.state.widgets);
					useWidgetStore.setState({ widgets: merged });
				}
			} catch (error) {
				console.error("Failed to sync widget config:", error);
			}
		}
	});
}

export function useWidgetVisibility() {
	const widgets = useWidgetStore((state) => state.widgets);
	const toggleWidget = useWidgetStore((state) => state.toggleWidget);
	const updateWidgetConfig = useWidgetStore(
		(state) => state.updateWidgetConfig,
	);

	const isWidgetVisible = useCallback(
		(widgetId: WidgetId): boolean => {
			return widgets.find((w) => w.id === widgetId)?.visible ?? true;
		},
		[widgets],
	);

	const getWidgetConfig = useCallback(() => {
		return widgets;
	}, [widgets]);

	return {
		isWidgetVisible,
		toggleWidget,
		getWidgetConfig,
		updateWidgetConfig,
	};
}

/**
 * Widget Registry
 * Manages widget visibility and configuration
 */

import { useCallback, useSyncExternalStore } from "react";

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

function loadWidgetConfig(): WidgetConfig[] {
	if (typeof window === "undefined") {
		return defaultWidgets;
	}

	try {
		const stored = localStorage.getItem(STORAGE_KEY);
		if (stored) {
			const parsed = JSON.parse(stored) as WidgetConfig[];
			// Merge with defaults to handle new widgets
			const widgetMap = new Map(parsed.map((w) => [w.id, w]));
			return defaultWidgets.map((defaultWidget) => {
				const stored = widgetMap.get(defaultWidget.id);
				return stored || defaultWidget;
			});
		}
	} catch (error) {
		console.error("Failed to load widget config:", error);
	}

	return defaultWidgets;
}

type WidgetStore = {
	subscribe: (listener: () => void) => () => void;
	getSnapshot: () => WidgetConfig[];
	getServerSnapshot: () => WidgetConfig[];
	toggleWidget: (widgetId: WidgetId) => void;
	updateWidgetConfig: (newConfig: WidgetConfig[]) => void;
};

function createWidgetStore(): WidgetStore {
	let config = loadWidgetConfig();
	const listeners = new Set<() => void>();

	const notify = () => {
		for (const listener of listeners) {
			listener();
		}
	};

	const setConfig = (nextConfig: WidgetConfig[], persist = true) => {
		config = nextConfig;
		if (persist) {
			saveWidgetConfig(config);
		}
		notify();
	};

	window.addEventListener("storage", (event) => {
		if (event.key === STORAGE_KEY) {
			setConfig(loadWidgetConfig(), false);
		}
	});

	return {
		subscribe: (listener) => {
			listeners.add(listener);
			return () => listeners.delete(listener);
		},
		getSnapshot: () => config,
		getServerSnapshot: () => defaultWidgets,
		toggleWidget: (widgetId) => {
			setConfig(
				config.map((w) =>
					w.id === widgetId ? { ...w, visible: !w.visible } : w,
				),
			);
		},
		updateWidgetConfig: (newConfig) => setConfig(newConfig),
	};
}

const widgetStore = createWidgetStore();

function saveWidgetConfig(config: WidgetConfig[]) {
	if (typeof window === "undefined") {
		return;
	}

	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
	} catch (error) {
		console.error("Failed to save widget config:", error);
	}
}

export function useWidgetVisibility() {
	const config = useSyncExternalStore(
		widgetStore.subscribe,
		widgetStore.getSnapshot,
		widgetStore.getServerSnapshot,
	);

	const isWidgetVisible = useCallback(
		(widgetId: WidgetId): boolean => {
			return config.find((w) => w.id === widgetId)?.visible ?? true;
		},
		[config],
	);

	const toggleWidget = useCallback((widgetId: WidgetId) => {
		widgetStore.toggleWidget(widgetId);
	}, []);

	const getWidgetConfig = useCallback(() => {
		return config;
	}, [config]);

	const updateWidgetConfig = useCallback((newConfig: WidgetConfig[]) => {
		widgetStore.updateWidgetConfig(newConfig);
	}, []);

	return {
		isWidgetVisible,
		toggleWidget,
		getWidgetConfig,
		updateWidgetConfig,
	};
}

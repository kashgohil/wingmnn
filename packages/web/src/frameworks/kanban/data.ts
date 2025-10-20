import type { KanbanColumn } from "./types";

export const initialColumns: KanbanColumn[] = [
	{
		id: "todo",
		title: "To Do",
		cards: [
			{ id: "todo-1", content: "Task 1 - Short" },
			{ id: "todo-2", content: "Task 2 - Medium length with some details" },
			{ id: "todo-3", content: "Task 3 - Another short task" },
			{
				id: "todo-4",
				content: "Task 4 - Long description that will take multiple lines and demonstrate variable height cards",
			},
			{ id: "todo-5", content: "Task 5 - Medium complexity" },
			{ id: "todo-6", content: "Task 6 - Quick task" },
			{ id: "todo-7", content: "Task 7 - Detailed task with comprehensive information" },
			{ id: "todo-8", content: "Task 8 - Short" },
			{ id: "todo-9", content: "Task 9 - Very detailed task with multiple requirements and specifications" },
			{ id: "todo-10", content: "Task 10 - Brief" },
		],
	},
	{
		id: "inprogress",
		title: "In Progress",
		cards: [
			{ id: "progress-1", content: "Working on this feature" },
			{
				id: "progress-2",
				content:
					"This is a complex feature implementation that requires multiple steps and detailed planning. The card content is longer to show variable heights.",
			},
			{ id: "progress-3", content: "Bug fix in progress" },
			{ id: "progress-4", content: "Short task" },
			{
				id: "progress-5",
				content:
					"This is a very comprehensive task that involves multiple components, extensive testing, and detailed documentation. It's designed to be significantly taller than other cards.",
			},
			{ id: "progress-6", content: "Quick fix" },
			{ id: "progress-7", content: "Medium complexity task with moderate description length" },
		],
	},
	{
		id: "done",
		title: "Done",
		cards: [
			{ id: "done-1", content: "Completed successfully" },
			{
				id: "done-2",
				content:
					"This was a complex task that involved multiple phases and required extensive testing and documentation. The completion summary is longer to demonstrate variable card heights.",
			},
			{ id: "done-3", content: "Done" },
			{
				id: "done-4",
				content:
					"This task was completed with comprehensive testing and includes detailed notes about the implementation approach and lessons learned",
			},
			{ id: "done-5", content: "Short completed task" },
		],
	},
];

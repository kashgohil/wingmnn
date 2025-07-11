import type { ColumnData } from "./types";

export const initialColumns: ColumnData[] = [
  {
    id: "todo",
    title: "To Do",
    cards: [
      { id: "1", content: "Task 1" },
      { id: "2", content: "Task 2" },
    ],
  },
  {
    id: "inprogress",
    title: "In Progress",
    cards: [{ id: "3", content: "Task 3" }],
  },
  {
    id: "done",
    title: "Done",
    cards: [{ id: "4", content: "Task 4" }],
  },
];

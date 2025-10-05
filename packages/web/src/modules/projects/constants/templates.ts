export const templates = [
  {
    id: "TODO",
    name: "Todo",
    description: "A simple todo list template",
    icon: "list",
    color: "#007bff",
    fields: [
      {
        id: "title",
        type: "text",
        label: "Title",
        required: true,
      },
      {
        id: "description",
        type: "textarea",
        label: "Description",
        required: false,
      },
    ],
  },
  {
    id: "MANAGER",
    name: "Manager",
    description: "A simple manager template",
    icon: "user",
    color: "#ffc107",
    fields: [
      {
        id: "name",
        type: "text",
        label: "Name",
        required: true,
      },
      {
        id: "email",
        type: "email",
        label: "Email",
        required: true,
      },
    ],
  },
  {
    id: "STUDENT",
    name: "Student",
    description: "A simple student template",
    icon: "user",
    color: "#ffc107",
    fields: [
      {
        id: "name",
        type: "text",
        label: "Name",
        required: true,
      },
      {
        id: "email",
        type: "email",
        label: "Email",
        required: true,
      },
    ],
  },
  {
    id: "PROJECT",
    name: "Project",
    description: "A simple project template",
    icon: "user",
    color: "#ffc107",
    fields: [
      {
        id: "name",
        type: "text",
        label: "Name",
        required: true,
      },
      {
        id: "email",
        type: "email",
        label: "Email",
        required: true,
      },
    ],
  },
];

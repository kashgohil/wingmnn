# Projects Module

A comprehensive project management system that supports projects, workflows, tasks, and task relationships with full CRUD operations, search functionality, and bulk actions.

## Features

### Projects
- ✅ Complete CRUD operations (Create, Read, Update, Delete)
- ✅ Project search and filtering
- ✅ Project archiving/unarchiving
- ✅ Project statistics and metrics
- ✅ Project leads and team management
- ✅ Custom fields and metadata
- ✅ Tags support

### Workflows
- ✅ Custom workflow creation per project
- ✅ Default workflow auto-creation
- ✅ Workflow status management
- ✅ Status transitions and rules
- ✅ Initial and final status configuration
- ✅ Custom status colors and ordering

### Tasks
- ✅ Complete task CRUD operations
- ✅ Task hierarchy (parent-child relationships)
- ✅ Task linking and relations
- ✅ Task assignments and status tracking
- ✅ Time tracking (estimates, spent time)
- ✅ Task comments system
- ✅ File attachments
- ✅ Task history logging
- ✅ Priority and type management
- ✅ Custom fields support

### Advanced Features
- ✅ Comprehensive search and filtering
- ✅ Bulk operations (assign, status update, delete)
- ✅ Task key generation (PROJECT-123 format)
- ✅ Change history tracking
- ✅ Soft delete support
- ✅ Pagination support

## Database Schema

### Core Tables

#### Projects (`projects`)
```sql
- id (varchar, primary key)
- name (varchar, required)
- description (text)
- status (enum: planning, active, on_hold, completed, cancelled, archived)
- start_date (varchar)
- end_date (varchar)
- budget (varchar)
- priority (integer, 1-5 scale)
- is_archived (boolean)
- team_id (varchar)
- project_lead (varchar, references users.id)
- tags (jsonb array)
- metadata (jsonb object)
- created_at, updated_at, created_by, updated_by, deleted
```

#### Workflows (`workflows`)
```sql
- id (varchar, primary key)
- name (varchar, required)
- description (text)
- project_id (varchar, references projects.id)
- is_default (boolean)
- created_at, updated_at, created_by, updated_by, deleted
```

#### Workflow Statuses (`workflow_statuses`)
```sql
- id (varchar, primary key)
- name (varchar, required)
- description (text)
- type (enum: todo, in_progress, review, testing, done, blocked, cancelled)
- color (varchar, hex color)
- order (integer)
- workflow_id (varchar, references workflows.id)
- is_initial (boolean)
- is_final (boolean)
- created_at, updated_at, created_by, updated_by, deleted
```

#### Tasks (`tasks`)
```sql
- id (varchar, primary key)
- key (varchar, unique, auto-generated like "PRJ-123")
- title (varchar, required)
- description (text)
- content (text)
- type (enum: feature, enhancement, sub_task, task, bug, story, epic, spike, research)
- priority (enum: lowest, low, medium, high, highest, critical)
- project_id (varchar, references projects.id)
- workflow_status_id (varchar, references workflow_statuses.id)
- assigned_to (varchar, references users.id)
- reporter_id (varchar, references users.id)
- parent_task_id (varchar, references tasks.id)
- original_estimate (integer, minutes)
- remaining_estimate (integer, minutes)
- time_spent (integer, minutes)
- start_date, due_date (varchar)
- story_points (integer)
- tags (jsonb array)
- custom_fields (jsonb object)
- is_archived (boolean)
- created_at, updated_at, created_by, updated_by, deleted
```

### Relationship Tables

#### Task Relations (`task_relations`)
```sql
- id (varchar, primary key)
- source_task_id (varchar, references tasks.id)
- target_task_id (varchar, references tasks.id)
- relation_type (enum: blocks, is_blocked_by, relates_to, duplicates, etc.)
- description (text)
- created_at, updated_at, created_by, updated_by, deleted
```

#### Task Comments (`task_comments`)
```sql
- id (varchar, primary key)
- task_id (varchar, references tasks.id)
- content (text, required)
- is_internal (boolean)
- created_at, updated_at, created_by, updated_by, deleted
```

#### Task Attachments (`task_attachments`)
```sql
- id (varchar, primary key)
- task_id (varchar, references tasks.id)
- file_name (varchar, required)
- file_url (varchar, required)
- file_size (integer)
- mime_type (varchar)
- created_at, updated_at, created_by, updated_by, deleted
```

#### Task History (`task_history`)
```sql
- id (varchar, primary key)
- task_id (varchar, references tasks.id)
- field (varchar, required)
- old_value (text)
- new_value (text)
- change_description (text)
- created_at, updated_at, created_by, updated_by, deleted
```

## API Endpoints

### Projects

#### Basic CRUD
- `GET /api/projects/get/:projectId` - Get project by ID
- `GET /api/projects/get/:projectId/with-tasks` - Get project with tasks
- `POST /api/projects/create` - Create new project
- `PUT /api/projects/update/:projectId` - Update project
- `DELETE /api/projects/delete/:projectId` - Delete project (soft delete)

#### Search and List
- `POST /api/projects/search` - Search projects with filters
- `GET /api/projects/list` - List projects with pagination
- `GET /api/projects/stats/:projectId` - Get project statistics

#### Actions
- `PATCH /api/projects/archive/:projectId` - Archive project
- `PATCH /api/projects/unarchive/:projectId` - Unarchive project

### Workflows

#### Basic CRUD
- `POST /api/projects/workflows/create` - Create workflow
- `GET /api/projects/workflows/get/:workflowId` - Get workflow
- `PUT /api/projects/workflows/update/:workflowId` - Update workflow
- `DELETE /api/projects/workflows/delete/:workflowId` - Delete workflow
- `GET /api/projects/workflows/project/:projectId` - Get workflows by project

#### Workflow Statuses
- `POST /api/projects/workflows/statuses/create` - Create status
- `GET /api/projects/workflows/statuses/get/:statusId` - Get status
- `PUT /api/projects/workflows/statuses/update/:statusId` - Update status
- `DELETE /api/projects/workflows/statuses/delete/:statusId` - Delete status
- `GET /api/projects/workflows/statuses/workflow/:workflowId` - Get statuses by workflow

### Tasks

#### Basic CRUD
- `POST /api/projects/tasks/create` - Create task
- `GET /api/projects/tasks/get/:taskId` - Get task
- `GET /api/projects/tasks/get/:taskId/with-relations` - Get task with all relations
- `PUT /api/projects/tasks/update/:taskId` - Update task
- `DELETE /api/projects/tasks/delete/:taskId` - Delete task

#### Search and List
- `POST /api/projects/tasks/project/:projectId` - Get tasks by project
- `POST /api/projects/tasks/search` - Search tasks
- `GET /api/projects/tasks/subtasks/:parentTaskId` - Get subtasks

#### Task Management
- `PATCH /api/projects/tasks/assign/:taskId` - Assign task
- `PATCH /api/projects/tasks/status/:taskId` - Update task status

#### Task Relations
- `POST /api/projects/tasks/relations/create` - Create task relation
- `DELETE /api/projects/tasks/relations/delete/:relationId` - Delete relation

#### Comments
- `POST /api/projects/tasks/comments/create` - Add comment
- `PUT /api/projects/tasks/comments/update/:commentId` - Update comment
- `DELETE /api/projects/tasks/comments/delete/:commentId` - Delete comment

#### Attachments
- `POST /api/projects/tasks/attachments/create` - Add attachment
- `DELETE /api/projects/tasks/attachments/delete/:attachmentId` - Delete attachment

### Actions (Bulk Operations)

#### Generic Actions
- `POST /api/projects/actions` - Execute single action
- `POST /api/projects/actions/bulk` - Execute bulk actions
- `POST /api/projects/actions/project/:projectId` - Project-specific actions
- `POST /api/projects/actions/task/:taskId` - Task-specific actions

#### Specific Bulk Actions
- `POST /api/projects/actions/archive-projects` - Bulk archive/unarchive
- `POST /api/projects/actions/assign-tasks` - Bulk task assignment
- `POST /api/projects/actions/update-task-statuses` - Bulk status updates
- `POST /api/projects/actions/delete-tasks` - Bulk task deletion

## Usage Examples

### Creating a Project
```typescript
const projectData = {
  name: "New Website",
  description: "Redesign company website",
  priority: 3,
  projectLead: "user-123",
  tags: ["web", "design", "frontend"],
  metadata: {
    budget: 50000,
    timeline: "Q2 2024"
  }
};

const response = await fetch('/api/projects/create', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(projectData)
});
```

### Creating a Task
```typescript
const taskData = {
  title: "Design homepage mockup",
  description: "Create wireframes and visual design for homepage",
  type: "design",
  priority: "high",
  projectId: "project-123",
  assignedTo: "designer-456",
  dueDate: "2024-03-15",
  originalEstimate: 480, // 8 hours in minutes
  tags: ["design", "homepage"]
};

const response = await fetch('/api/projects/tasks/create', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(taskData)
});
```

### Search Projects
```typescript
const searchFilters = {
  search: "website",
  status: "active",
  priority: 3,
  tags: ["web"],
  limit: 20,
  offset: 0
};

const response = await fetch('/api/projects/search', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(searchFilters)
});
```

### Bulk Task Assignment
```typescript
const bulkAssignment = {
  taskIds: ["task-1", "task-2", "task-3"],
  assigneeId: "user-456"
};

const response = await fetch('/api/projects/actions/assign-tasks', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(bulkAssignment)
});
```

## Service Methods

### ProjectService

The `ProjectService` class provides all business logic for project management:

#### Project Methods
- `get(projectId)` - Get project by ID
- `getWithTasks(projectId)` - Get project with tasks
- `create(data)` - Create new project
- `update(projectId, data, updatedBy)` - Update project
- `delete(projectId, deletedBy)` - Soft delete project
- `search(filters)` - Search projects
- `getStats(projectId)` - Get project statistics
- `archive/unarchive(projectId, userId)` - Archive operations

#### Workflow Methods
- `createWorkflow(data)` - Create custom workflow
- `createDefaultWorkflow(projectId, userId)` - Create default workflow
- `getWorkflow(workflowId)` - Get workflow details
- `updateWorkflow/deleteWorkflow` - Workflow management
- `createWorkflowStatus` - Create workflow status
- `getStatusesByWorkflow` - Get all statuses for workflow

#### Task Methods
- `createTask(data)` - Create new task (auto-generates key)
- `getTask(taskId)` - Get task details
- `getTaskWithRelations(taskId)` - Get task with all relationships
- `updateTask(taskId, data, updatedBy)` - Update task (logs history)
- `deleteTask(taskId, deletedBy)` - Soft delete task
- `getTasksPaginated(filters)` - Search/filter tasks
- `assignTask(taskId, assigneeId, userId)` - Assign task
- `updateTaskStatus(taskId, statusId, userId)` - Update status

#### Task Relationship Methods
- `createTaskRelation(data)` - Link tasks
- `deleteTaskRelation(relationId, userId)` - Remove link

#### Comment and Attachment Methods
- `addTaskComment(data)` - Add comment
- `updateTaskComment/deleteTaskComment` - Comment management
- `addTaskAttachment(data)` - Add file attachment
- `deleteTaskAttachment(attachmentId, userId)` - Remove attachment

#### Action Methods
- `actions(actionType, targetId, userId, additionalData)` - Generic action handler

## Query Utilities

The module includes comprehensive query utilities in `utils.ts`:

- `projectsQuery` - Project database operations
- `workflowsQuery` - Workflow database operations
- `workflowStatusesQuery` - Status database operations
- `tasksQuery` - Task database operations
- `taskRelationsQuery` - Task relationship operations
- `taskCommentsQuery` - Comment operations
- `taskAttachmentsQuery` - Attachment operations
- `taskHistoryQuery` - History tracking operations

Each query utility provides:
- Basic CRUD operations
- Specialized finder methods
- Search and filtering capabilities
- Relationship loading

## Error Handling

All methods use consistent error handling patterns:
- Input validation with descriptive error messages
- Database error wrapping with context
- Standardized error responses in API routes
- Proper HTTP status codes

## Testing

Comprehensive test suite in `projectService.test.ts` covering:
- All CRUD operations
- Error scenarios
- Mock database interactions
- Edge cases and validation
- Service method integration

## Default Workflow

When a project is created, a default workflow is automatically generated with these statuses:
1. **To Do** (initial status)
2. **In Progress**
3. **Review**
4. **Testing**
5. **Done** (final status)

## Task Key Generation

Tasks automatically receive unique keys in the format: `[PROJECT_PREFIX]-[NUMBER]`
- Project prefix: First 3 characters of project name (uppercase)
- Number: Sequential number based on task count in project
- Example: "Website Redesign" project → "WEB-1", "WEB-2", etc.

## Change History

All task changes are automatically logged in the `task_history` table, tracking:
- Field that changed
- Old and new values
- Description of change
- User who made the change
- Timestamp

This provides complete audit trail for project management and compliance.